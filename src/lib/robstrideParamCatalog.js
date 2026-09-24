// RobStride protocol section 4 runtime parameter list, aligned with
// motor_vendors/robstride/src/registers.rs in MotorBridge v0.3.5.
export const ROBSTRIDE_PARAM_CATALOG = [
  {
    id: 0x7005,
    name: 'run_mode',
    dataType: 'Int8',
    access: 'rw',
    desc: 'Control mode: 0 MIT, 1 Position/PP, 2 velocity, 3 current, 5 CSP.',
    descZh: '控制模式 0=MIT运控,1=位置(PP),2=速度,3=电流,5=位置(CSP)',
  },
  {
    id: 0x7006,
    name: 'iq_ref',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Current-mode Iq target, A, typical range -43..43.',
    descZh: '电流模式Iq指令 A',
  },
  {
    id: 0x700a,
    name: 'spd_ref',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Velocity-mode target, rad/s, typical range -20..20.',
    descZh: '速度模式转速指令 rad/s',
  },
  {
    id: 0x700b,
    name: 'limit_torque',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Torque limit, Nm, typical range 0..60.',
    descZh: '转矩限制 Nm',
  },
  {
    id: 0x7010,
    name: 'cur_kp',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Current-loop Kp, default around 0.17.',
    descZh: '电流环Kp',
  },
  {
    id: 0x7011,
    name: 'cur_ki',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Current-loop Ki, default around 0.012.',
    descZh: '电流环Ki',
  },
  {
    id: 0x7014,
    name: 'cur_filter_gain',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Current filter gain ratio, typical range 0..1, default around 0.1.',
    descZh: '电流滤波系数 0~1',
  },
  {
    id: 0x7016,
    name: 'loc_ref',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Position target, rad. Used by unified pos_vel.',
    descZh: '位置模式角度指令 rad',
  },
  {
    id: 0x7017,
    name: 'limit_spd',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Position speed limit, rad/s, typical range 0..20. Used by unified pos_vel.',
    descZh: '位置(CSP)速度限制 rad/s',
  },
  {
    id: 0x7018,
    name: 'limit_cur',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Velocity/position current limit, A, typical range 0..43.',
    descZh: '速度/位置模式电流限制 A',
  },
  {
    id: 0x7019,
    name: 'mechPos',
    dataType: 'Float32',
    access: 'ro',
    desc: 'Load-side counted mechanical angle, rad.',
    descZh: '负载端计圈机械角度 rad',
  },
  {
    id: 0x701a,
    name: 'iqf',
    dataType: 'Float32',
    access: 'ro',
    desc: 'Filtered Iq current, A.',
    descZh: 'iq滤波值 A',
  },
  {
    id: 0x701b,
    name: 'mechVel',
    dataType: 'Float32',
    access: 'ro',
    desc: 'Load-side mechanical velocity, rad/s.',
    descZh: '负载端转速 rad/s',
  },
  {
    id: 0x701c,
    name: 'VBUS',
    dataType: 'Float32',
    access: 'ro',
    desc: 'Bus voltage, V.',
    descZh: '母线电压 V',
  },
  {
    id: 0x701e,
    name: 'loc_kp',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Position-loop Kp, default around 60. Used by unified pos_vel when kp/loc_kp is supplied.',
    descZh: '位置环Kp',
  },
  {
    id: 0x701f,
    name: 'spd_kp',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Speed-loop Kp, default around 6.',
    descZh: '速度环Kp',
  },
  {
    id: 0x7020,
    name: 'spd_ki',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Speed-loop Ki, default around 0.02.',
    descZh: '速度环Ki',
  },
  {
    id: 0x7021,
    name: 'spd_filter_gain',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Speed filter gain, default around 0.1.',
    descZh: '速度滤波系数',
  },
  {
    id: 0x7022,
    name: 'acc_rad',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Velocity-mode acceleration, rad/s^2, default around 20.',
    descZh: '速度模式加速度 rad/s^2',
  },
  {
    id: 0x7024,
    name: 'vel_max',
    dataType: 'Float32',
    access: 'rw',
    desc: 'PP/Position mode max velocity, rad/s, default around 10.',
    descZh: '位置(PP)速度 rad/s',
  },
  {
    id: 0x7025,
    name: 'acc_set',
    dataType: 'Float32',
    access: 'rw',
    desc: 'PP/Position mode acceleration, rad/s^2, default around 10.',
    descZh: '位置(PP)加速度 rad/s^2',
  },
  {
    id: 0x7026,
    name: 'EPScan_time',
    dataType: 'UInt16',
    access: 'rw',
    desc: 'Active report period. Default 1 means 10 ms; each +1 adds about 5 ms.',
    descZh: '主动上报周期 1=10ms,每+1递增5ms',
  },
  {
    id: 0x7028,
    name: 'canTimeout',
    dataType: 'UInt32',
    access: 'rw',
    desc: 'CAN timeout. Default 0; 20000 means about 1 s.',
    descZh: 'CAN超时阈值 20000=1s',
  },
  {
    id: 0x7029,
    name: 'zero_sta',
    dataType: 'UInt8',
    access: 'rw',
    desc: 'Zero state: 0 for 0..2pi, 1 for -pi..pi. Save parameters after writing.',
    descZh: '零点标志位 0=0~2π,1=-π~π',
  },
  {
    id: 0x702a,
    name: 'damper',
    dataType: 'UInt8',
    access: 'rw',
    desc: 'Switch. 1 disables power-off back-drive damping.',
    descZh: '阻尼开关 1=取消关机反驱保护',
  },
  {
    id: 0x702b,
    name: 'add_offset',
    dataType: 'Float32',
    access: 'rw',
    desc: 'Zero offset, rad, default 0.',
    descZh: '零位偏置 rad',
  },
  {
    id: 0x702c,
    name: 'alveolous_open',
    dataType: 'UInt8',
    access: 'rw',
    desc: 'Switch. 1 enables cogging compensation.',
    descZh: '齿槽补偿开关 1=启用',
  },
  {
    id: 0x702d,
    name: 'iq_test',
    dataType: 'UInt8',
    access: 'rw',
    desc: 'Switch. 1 enables more precise initialization calibration.',
    descZh: '初始化校准开关 1=启用',
  },
  {
    id: 0x702e,
    name: 'dcc_set',
    dataType: 'Float32',
    access: 'rw',
    desc: 'PP-mode deceleration, rad/s^2, default around 10.',
    descZh: 'PP模式减速度 rad/s^2',
  },
].sort((a, b) => a.id - b.id);

export const ROBSTRIDE_ACCESS_LABELS = {
  rw: 'Read/Write',
  ro: 'Read-Only',
  wo: 'Write-Only',
};

export function toRobstrideCliType(dataType) {
  const t = String(dataType || '').toLowerCase();
  if (t === 'uint8' || t === 'u8') return 'u8';
  if (t === 'uint16' || t === 'u16') return 'u16';
  if (t === 'uint32' || t === 'u32') return 'u32';
  if (t === 'int8' || t === 'i8') return 'i8';
  if (t === 'float' || t === 'float32' || t === 'f32') return 'f32';
  return '';
}

export function canRobstrideRead(access) {
  return access === 'rw' || access === 'ro';
}

export function canRobstrideWrite(access) {
  return access === 'rw' || access === 'wo';
}

// Safety- / motion- / tuning-critical parameters that an importer should
// review carefully before writing back. `high` flags them in the export's
// priority column; everything else is `normal`.
export const ROBSTRIDE_HIGH_PRIORITY_PARAM_IDS = new Set([
  0x7005, // run_mode   - control mode switch; wrong mode => unexpected motion
  0x700b, // limit_torque - torque limit, safety
  0x7010, // cur_kp     - current-loop Kp; affects torque / stability
  0x7017, // limit_spd  - speed limit, safety
  0x7018, // limit_cur  - current limit, safety
  0x701e, // loc_kp     - position stiffness; affects motion
  0x7024, // vel_max    - PP/position velocity; affects motion speed
  0x7029, // zero_sta  - angle zero reference; wrong value shifts whole pose
  0x702a, // damper    - power-off damping switch; affects behavior on disable
]);

export function robstrideParamPriority(def) {
  return ROBSTRIDE_HIGH_PRIORITY_PARAM_IDS.has(def.id) ? 'high' : 'normal';
}

// Parse a TSV produced by the param export back into a structured import plan.
// Mirrors the export layout exactly: comment lines (#) and blanks are skipped,
// the first non-comment line is the header `param_id\ttype\tname\taccess\tpriority\tJ1\tJ2...`,
// and each following line is one register. Columns are located by header name
// (not by fixed index) so a reordered file still parses. Cells that are not
// numeric ("", "ERR", "offline") are skipped — they carry no import value.
//
// Returns { ok, errors, joints, rows }:
//   ok     — true iff errors is empty AND at least one writable value exists
//   errors — human-readable format problems (param_id unknown, name/type
//            mismatch, non-writable register, non-numeric cell, ...)
//   joints — [1,2,...] joint numbers found in the header
//   rows   — [{ def, type, values: { joint: number } }] for every writable
//            register that has at least one numeric cell
export function parseRobstrideParamsTsv(text) {
  const errors = [];
  const lines = String(text || '').split(/\r?\n/);

  // Locate the header: first non-comment, non-blank line.
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i].trim();
    if (!l || l.startsWith('#')) continue;
    headerIdx = i;
    break;
  }
  if (headerIdx === -1) {
    return { ok: false, errors: ['no header row found'], joints: [], rows: [] };
  }

  const headers = lines[headerIdx].split('\t').map((h) => h.trim());
  const col = (name) => headers.indexOf(name);
  const required = ['param_id', 'type', 'name', 'access', 'priority'];
  for (const name of required) {
    if (col(name) === -1) errors.push(`missing column: ${name}`);
  }
  // Joint columns: headers matching /^J\d+$/.
  const jointCols = [];
  headers.forEach((h, idx) => {
    const m = /^J(\d+)$/.exec(h);
    if (m) jointCols.push({ col: idx, joint: Number(m[1]) });
  });
  if (jointCols.length === 0) errors.push('no joint columns (J1..) found');

  if (errors.length > 0) {
    return { ok: false, errors, joints: jointCols.map((j) => j.joint), rows: [] };
  }

  const paramIdCol = col('param_id');
  const typeCol = col('type');
  const nameCol = col('name');
  const rows = [];

  const parseHexId = (s) => {
    const m = /^0x([0-9a-fA-F]+)$/.exec((s || '').trim());
    return m ? parseInt(m[1], 16) : null;
  };

  for (let i = headerIdx + 1; i < lines.length; i += 1) {
    const l = lines[i].replace(/\r$/, '');
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const cells = l.split('\t');
    const pidRaw = (cells[paramIdCol] || '').trim();
    const pid = parseHexId(pidRaw);
    if (pid == null) {
      errors.push(`line ${i + 1}: bad param_id "${pidRaw}"`);
      continue;
    }
    const def = ROBSTRIDE_PARAM_CATALOG.find((d) => d.id === pid);
    if (!def) {
      errors.push(`line ${i + 1}: unknown param_id ${pidRaw}`);
      continue;
    }
    // Cross-check name/type against the catalog (informational, non-fatal).
    const nameVal = (cells[nameCol] || '').trim();
    if (nameVal && nameVal !== def.name) {
      errors.push(`line ${i + 1}: name mismatch "${nameVal}" vs "${def.name}" for ${pidRaw}`);
    }
    const expType = toRobstrideCliType(def.dataType);
    const typeVal = (cells[typeCol] || '').trim();
    if (typeVal && typeVal !== expType) {
      errors.push(`line ${i + 1}: type mismatch "${typeVal}" vs "${expType}" for ${pidRaw}`);
    }
    // Only writable registers can be imported; read-only rows (which the export
    // never emits but a hand-edited file may contain) are silently skipped.
    if (!canRobstrideWrite(def.access)) {
      continue;
    }
    const values = {};
    for (const jc of jointCols) {
      const raw = (cells[jc.col] || '').trim();
      if (raw === '' || raw === 'ERR' || raw === 'offline') continue;
      const num = Number(raw);
      if (!Number.isFinite(num)) {
        errors.push(`line ${i + 1}: J${jc.joint} non-numeric value "${raw}" for ${pidRaw}`);
        continue;
      }
      values[jc.joint] = num;
    }
    if (Object.keys(values).length > 0) {
      rows.push({ def, paramId: pid, type: expType, values });
    }
  }

  if (rows.length === 0) {
    errors.push('no writable parameter values found to import');
  }
  return {
    ok: errors.length === 0,
    errors,
    joints: jointCols.map((j) => j.joint),
    rows,
  };
}
