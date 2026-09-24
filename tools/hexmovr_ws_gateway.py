#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import base64
import hashlib
import json
import signal
import struct
import time
from dataclasses import dataclass
from enum import IntEnum
from typing import Any

from motorbridge import Controller, Mode

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"


class OpCode(IntEnum):
    TEXT = 0x1
    CLOSE = 0x8
    PING = 0x9
    PONG = 0xA


@dataclass
class Target:
    vendor: str = "hexmovr"
    transport: str = "socketcan"
    channel: str = "can0"
    model: str = "hexmovr"
    motor_id: int = 1
    feedback_id: int = 0


class HexmovrSession:
    def __init__(self, target: Target, dt_ms: int) -> None:
        self.target = target
        self.dt_ms = dt_ms
        self.ctrl: Controller | None = None
        self.motor = None

    def close(self) -> None:
        motor, ctrl = self.motor, self.ctrl
        self.motor = None
        self.ctrl = None
        if motor is not None:
            try:
                motor.close()
            except Exception:
                pass
        if ctrl is not None:
            try:
                ctrl.shutdown()
            except Exception:
                pass
            try:
                ctrl.close()
            except Exception:
                pass

    def set_target(self, payload: dict[str, Any]) -> dict[str, Any]:
        vendor = str(payload.get("vendor", self.target.vendor)).lower()
        if vendor != "hexmovr":
            raise ValueError("hexmovr_ws_gateway only supports vendor=hexmovr")
        transport = str(payload.get("transport", self.target.transport)).lower()
        if transport not in ("auto", "socketcan"):
            raise ValueError("vendor=hexmovr uses classic CAN; choose auto or socketcan")
        next_target = Target(
            vendor="hexmovr",
            transport="socketcan" if transport == "auto" else transport,
            channel=str(payload.get("channel", self.target.channel)),
            model=str(payload.get("model", self.target.model) or "hexmovr"),
            motor_id=int(payload.get("motor_id", self.target.motor_id)),
            feedback_id=int(payload.get("feedback_id", self.target.feedback_id)),
        )
        if next_target != self.target:
            self.close()
            self.target = next_target
        return self.target_dict()

    def target_dict(self) -> dict[str, Any]:
        return {
            "vendor": self.target.vendor,
            "transport": self.target.transport,
            "channel": self.target.channel,
            "model": self.target.model,
            "motor_id": self.target.motor_id,
            "feedback_id": self.target.feedback_id,
        }

    def connect(self):
        if self.ctrl is not None and self.motor is not None:
            return self.motor
        self.close()
        self.ctrl = Controller(self.target.channel)
        self.motor = self.ctrl.add_hexmovr_motor(
            self.target.motor_id,
            self.target.feedback_id,
            self.target.model,
        )
        return self.motor

    def state_once(self, timeout_ms: int = 500) -> dict[str, Any]:
        motor = self.connect()
        motor.request_feedback()
        self.ctrl.poll_feedback_once()
        state = motor.get_state()
        return state_to_json(state, self.target)

    def command(self, op: str, payload: dict[str, Any]) -> dict[str, Any]:
        motor = self.connect()
        if op == "mit":
            motor.ensure_mode(Mode.MIT, int(payload.get("timeout_ms", payload.get("ensure_timeout_ms", 1000))))
            motor.send_mit(
                float(payload.get("pos", payload.get("target", 0.0))),
                float(payload.get("vel", 0.0)),
                float(payload.get("kp", 30.0)),
                float(payload.get("kd", 1.0)),
                float(payload.get("tau", 0.0)),
            )
        elif op == "pos_vel":
            motor.ensure_mode(Mode.POS_VEL, int(payload.get("timeout_ms", payload.get("ensure_timeout_ms", 1000))))
            motor.send_pos_vel(
                float(payload.get("pos", payload.get("target", 0.0))),
                float(payload.get("vlim", 1.0)),
            )
        elif op == "vel":
            motor.ensure_mode(Mode.VEL, int(payload.get("timeout_ms", payload.get("ensure_timeout_ms", 1000))))
            motor.send_vel(float(payload.get("vel", payload.get("target", 0.0))))
        elif op in ("disable", "stop"):
            motor.disable()
        elif op == "clear_error":
            motor.clear_error()
        elif op == "set_zero_position":
            motor.set_zero_position()
        elif op == "ensure_mode":
            mode = str(payload.get("mode", "mit")).lower()
            mode_map = {"mit": Mode.MIT, "pos": Mode.POS_VEL, "pos_vel": Mode.POS_VEL, "vel": Mode.VEL}
            if mode not in mode_map:
                raise ValueError("hexmovr mode must be mit|pos_vel|vel")
            motor.ensure_mode(mode_map[mode], int(payload.get("timeout_ms", payload.get("ensure_timeout_ms", 1000))))
        elif op == "enable":
            # Hexmovr has no standalone enable frame; motion commands activate modes.
            pass
        else:
            raise ValueError(f"unsupported op for hexmovr: {op}")
        return {"vendor": "hexmovr", "op": op}

    def scan(self, payload: dict[str, Any]) -> dict[str, Any]:
        start_id = int(payload.get("start_id", 1))
        end_id = int(payload.get("end_id", start_id))
        timeout_ms = int(payload.get("timeout_ms", 500))
        model = str(payload.get("model", self.target.model) or "hexmovr")
        hits = []
        ctrl = Controller(self.target.channel)
        try:
            for motor_id in range(start_id, end_id + 1):
                motor = ctrl.add_hexmovr_motor(motor_id, 0, model)
                try:
                    motor.request_feedback()
                    time.sleep(min(max(timeout_ms, 10), 300) / 1000.0)
                    ctrl.poll_feedback_once()
                    state = motor.get_state()
                    if state is not None:
                        hits.append(
                            {
                                "probe": motor_id,
                                "motor_id": motor_id,
                                "feedback_id": motor_id,
                                "detected_by": "feedback",
                                "state": state_to_json(state, Target(motor_id=motor_id, model=model)),
                            }
                        )
                except Exception:
                    pass
                finally:
                    motor.close()
                time.sleep(0.002)
        finally:
            try:
                ctrl.close()
            except Exception:
                pass
        return {
            "vendor": "hexmovr",
            "transport": self.target.transport,
            "count": len(hits),
            "start_id": start_id,
            "end_id": end_id,
            "hits": hits,
        }


def state_to_json(state: Any, target: Target) -> dict[str, Any]:
    return {
        "vendor": "hexmovr",
        "has_value": state is not None,
        "can_id": int(getattr(state, "can_id", target.motor_id)),
        "arbitration_id": int(getattr(state, "arbitration_id", 0)),
        "motor_id": int(target.motor_id),
        "feedback_id": int(target.feedback_id or target.motor_id),
        "status_code": int(getattr(state, "status_code", 0)),
        "pos": float(getattr(state, "pos", 0.0)),
        "vel": float(getattr(state, "vel", 0.0)),
        "torq": float(getattr(state, "torq", 0.0)),
        "t_mos": float(getattr(state, "t_mos", 0.0)),
        "t_rotor": float(getattr(state, "t_rotor", 0.0)),
    }


def capabilities(session: HexmovrSession) -> dict[str, Any]:
    return {
        "api_version": "v1",
        "gateway_version": "hexmovr-studio-adapter",
        "default_vendor": "hexmovr",
        "default_target": session.target_dict(),
        "features": ["dynamic_target"],
        "vendors": {
            "hexmovr": {
                "transports": ["auto", "socketcan"],
                "modes": ["mit", "pos_vel", "vel"],
                "ops_unified": ["scan", "enable", "disable", "stop", "clear_error", "state_once", "status", "verify"],
                "ops_vendor_native": ["set_zero_position"],
            }
        },
    }


def ws_accept(key: str) -> str:
    digest = hashlib.sha1((key + GUID).encode("ascii")).digest()
    return base64.b64encode(digest).decode("ascii")


async def read_frame(reader: asyncio.StreamReader) -> tuple[OpCode, bytes] | None:
    header = await reader.readexactly(2)
    opcode = OpCode(header[0] & 0x0F)
    masked = bool(header[1] & 0x80)
    length = header[1] & 0x7F
    if length == 126:
        length = struct.unpack("!H", await reader.readexactly(2))[0]
    elif length == 127:
        length = struct.unpack("!Q", await reader.readexactly(8))[0]
    mask = await reader.readexactly(4) if masked else b""
    payload = await reader.readexactly(length) if length else b""
    if masked:
        payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    return opcode, payload


async def write_frame(writer: asyncio.StreamWriter, opcode: OpCode, payload: bytes = b"") -> None:
    header = bytearray([0x80 | int(opcode)])
    length = len(payload)
    if length < 126:
        header.append(length)
    elif length <= 0xFFFF:
        header.extend([126])
        header.extend(struct.pack("!H", length))
    else:
        header.extend([127])
        header.extend(struct.pack("!Q", length))
    writer.write(bytes(header) + payload)
    await writer.drain()


async def send_json(writer: asyncio.StreamWriter, payload: dict[str, Any]) -> None:
    await write_frame(writer, OpCode.TEXT, json.dumps(payload).encode("utf-8"))


async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter, session: HexmovrSession) -> None:
    request = await reader.readuntil(b"\r\n\r\n")
    headers = {}
    for line in request.decode("latin1").split("\r\n")[1:]:
        if ":" in line:
            k, v = line.split(":", 1)
            headers[k.strip().lower()] = v.strip()
    key = headers.get("sec-websocket-key")
    if not key:
        writer.close()
        await writer.wait_closed()
        return
    writer.write(
        (
            "HTTP/1.1 101 Switching Protocols\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Accept: {ws_accept(key)}\r\n\r\n"
        ).encode("ascii")
    )
    await writer.drain()
    await send_json(
        writer,
        {
            "type": "event",
            "event": "connected",
            "data": {
                "router_mode": "hexmovr_adapter",
                "connected_bus": None,
                "default_target": session.target_dict(),
            },
        },
    )
    while True:
        try:
            frame = await read_frame(reader)
        except asyncio.IncompleteReadError:
            break
        if frame is None:
            break
        opcode, payload = frame
        if opcode == OpCode.CLOSE:
            break
        if opcode == OpCode.PING:
            await write_frame(writer, OpCode.PONG, payload)
            continue
        if opcode != OpCode.TEXT:
            continue
        req = json.loads(payload.decode("utf-8"))
        req_id = req.get("req_id")
        op = str(req.get("op", ""))
        try:
            if op == "capabilities":
                data = capabilities(session)
            elif op == "set_target":
                data = session.set_target(req)
            elif op == "close_bus":
                session.close()
                data = {"closed": True}
            elif op == "shutdown":
                session.close()
                data = {"shutdown": True}
            elif op == "scan":
                data = session.scan(req)
            elif op in ("state_once", "status", "verify"):
                data = session.state_once(int(req.get("timeout_ms", 500)))
            elif op in ("enable", "disable", "stop", "clear_error", "mit", "pos_vel", "vel", "ensure_mode", "set_zero_position"):
                data = session.command(op, req)
            else:
                raise ValueError(f"unsupported op: {op}")
            await send_json(writer, {"ok": True, "req_id": req_id, "op": op, "data": data})
        except Exception as exc:
            await send_json(writer, {"ok": False, "req_id": req_id, "op": op, "error": str(exc)})
    session.close()
    writer.close()
    await writer.wait_closed()


async def amain() -> None:
    parser = argparse.ArgumentParser(description="Hexmovr adapter gateway for motorbridge-studio.")
    parser.add_argument("--bind", default="127.0.0.1:9002")
    parser.add_argument("--channel", default="can0")
    parser.add_argument("--model", default="hexmovr")
    parser.add_argument("--motor-id", type=lambda x: int(x, 0), default=1)
    parser.add_argument("--feedback-id", type=lambda x: int(x, 0), default=0)
    parser.add_argument("--dt-ms", type=int, default=20)
    args = parser.parse_args()
    host, port_s = args.bind.rsplit(":", 1)
    session = HexmovrSession(
        Target(channel=args.channel, model=args.model, motor_id=args.motor_id, feedback_id=args.feedback_id),
        args.dt_ms,
    )
    server = await asyncio.start_server(lambda r, w: handle_client(r, w, session), host, int(port_s))
    print(f"hexmovr_ws_gateway listening on ws://{args.bind}", flush=True)
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)
    async with server:
        await stop.wait()
    session.close()


if __name__ == "__main__":
    asyncio.run(amain())
