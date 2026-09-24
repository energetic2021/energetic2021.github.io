// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '../i18n';
import { useGatewayBridge } from './useGatewayBridge';

class FakeWebSocket {
  static OPEN = 1;

  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    FakeWebSocket.instances.push(this);
  }

  close() {
    this.readyState = 2;
  }

  send() {}

  emitOpen() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }
}

FakeWebSocket.instances = [];

function Harness({ wsUrl = 'ws://example.com:9002', wsTokenEnabled = false, wsToken = '' }) {
  const bridge = useGatewayBridge({
    wsUrl,
    channel: 'can0',
    wsTokenEnabled,
    wsToken,
    pushLog: vi.fn(),
    setStateSnapshot: vi.fn(),
    onGatewayState: vi.fn(),
    onGatewayParams: vi.fn(),
  });

  return (
    <>
      <div data-testid="status">{bridge.connText}</div>
      <button onClick={bridge.connectWs}>Connect</button>
      <button onClick={bridge.disconnectWs}>Disconnect</button>
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  FakeWebSocket.instances = [];
});

describe('useGatewayBridge token auth', () => {
  it('connects without query token when disabled', () => {
    vi.stubGlobal('WebSocket', FakeWebSocket);

    render(
      <I18nProvider>
        <Harness />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(FakeWebSocket.instances[0].url).toBe('ws://example.com:9002');
  });

  it('appends query token when enabled', () => {
    vi.stubGlobal('WebSocket', FakeWebSocket);

    render(
      <I18nProvider>
        <Harness wsTokenEnabled wsToken="secret-token" />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(FakeWebSocket.instances[0].url).toBe(
      'ws://example.com:9002/?motorbridge_ws_token=secret-token'
    );
  });

  it('does not create a websocket when token auth is enabled without a token', () => {
    vi.stubGlobal('WebSocket', FakeWebSocket);

    render(
      <I18nProvider>
        <Harness wsTokenEnabled wsToken="" />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(FakeWebSocket.instances).toHaveLength(0);
    expect(screen.getByTestId('status').textContent).toBe('ws: disconnected');
  });


  it('reconnects with the updated token when connect is clicked again', () => {
    vi.stubGlobal('WebSocket', FakeWebSocket);

    const { rerender } = render(
      <I18nProvider>
        <Harness wsTokenEnabled wsToken="secret-token" />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    act(() => {
      FakeWebSocket.instances[0].emitOpen();
    });

    rerender(
      <I18nProvider>
        <Harness wsTokenEnabled wsToken="next-token" />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.instances[1].url).toBe(
      'ws://example.com:9002/?motorbridge_ws_token=next-token'
    );
  });

  it('uses the latest token during auto reconnect', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', FakeWebSocket);

    const { rerender } = render(
      <I18nProvider>
        <Harness wsTokenEnabled wsToken="secret-token" />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    act(() => {
      FakeWebSocket.instances[0].emitOpen();
    });

    rerender(
      <I18nProvider>
        <Harness wsTokenEnabled wsToken="next-token" />
      </I18nProvider>
    );

    act(() => {
      FakeWebSocket.instances[0].onclose?.();
    });

    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });

    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.instances[1].url).toBe(
      'ws://example.com:9002/?motorbridge_ws_token=next-token'
    );

    vi.useRealTimers();
  });
});
