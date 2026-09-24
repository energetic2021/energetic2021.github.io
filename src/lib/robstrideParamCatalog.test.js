import { describe, expect, it } from 'vitest';
import {
  ROBSTRIDE_PARAM_CATALOG,
  canRobstrideRead,
  canRobstrideWrite,
  parseRobstrideParamsTsv,
  toRobstrideCliType,
} from './robstrideParamCatalog';

describe('robstride parameter catalog helpers', () => {
  it('maps only parameter types supported by the v0.3.5 WS API', () => {
    expect(toRobstrideCliType('UInt8')).toBe('u8');
    expect(toRobstrideCliType('UInt16')).toBe('u16');
    expect(toRobstrideCliType('UInt32')).toBe('u32');
    expect(toRobstrideCliType('Int8')).toBe('i8');
    expect(toRobstrideCliType('Float32')).toBe('f32');
  });

  it('does not silently reinterpret signed 16/32-bit values as unsigned', () => {
    expect(toRobstrideCliType('int16')).toBe('');
    expect(toRobstrideCliType('int32')).toBe('');
  });

  it('uses the RobStride section 4 runtime 0x7xxx parameter list', () => {
    const ids = ROBSTRIDE_PARAM_CATALOG.map((x) => x.id);
    expect(ids).toEqual([
      0x7005, 0x7006, 0x700a, 0x700b, 0x7010, 0x7011, 0x7014, 0x7016, 0x7017, 0x7018, 0x7019,
      0x701a, 0x701b, 0x701c, 0x701e, 0x701f, 0x7020, 0x7021, 0x7022, 0x7024, 0x7025, 0x7026,
      0x7028, 0x7029, 0x702a, 0x702b, 0x702c, 0x702d, 0x702e,
    ]);
    expect(ids.every((id) => id >= 0x7000 && id <= 0x7fff)).toBe(true);
  });

  it('marks read-only and read/write RobStride parameters correctly', () => {
    const mechPos = ROBSTRIDE_PARAM_CATALOG.find((x) => x.id === 0x7019);
    const canTimeout = ROBSTRIDE_PARAM_CATALOG.find((x) => x.id === 0x7028);

    expect(mechPos?.access).toBe('ro');
    expect(canRobstrideRead(mechPos?.access)).toBe(true);
    expect(canRobstrideWrite(mechPos?.access)).toBe(false);

    // The manual lists 0x7026/0x7028/0x7029 as read/write (W/R), not
    // write-only; the catalog must allow reading them so the param export
    // can read them back.
    expect(canTimeout?.access).toBe('rw');
    expect(canRobstrideRead(canTimeout?.access)).toBe(true);
    expect(canRobstrideWrite(canTimeout?.access)).toBe(true);
    for (const id of [0x7026, 0x7029]) {
      const def = ROBSTRIDE_PARAM_CATALOG.find((x) => x.id === id);
      expect(def?.access).toBe('rw');
      expect(canRobstrideRead(def?.access)).toBe(true);
    }
  });

  it('parses an exported TSV back into an import plan', () => {
    const tsv = [
      '# RobStride arm parameters export (TSV)',
      '# vendor: robstride',
      '# joints: 1, 2, 3',
      '# import: split each non-"#" line by tab; skip cells that are not numeric.',
      '',
      'param_id\ttype\tname\tdesc_zh\taccess\tpriority\tJ1\tJ2\tJ3',
      '0x7005\ti8\trun_mode\t控制模式 0=MIT运控,1=位置(PP),2=速度,3=电流,5=位置(CSP)\trw\thigh\t0\t1\t2',
      '0x7006\tf32\tiq_ref\t电流模式Iq指令 A\trw\tnormal\t1.5\t2.5\toffline',
      '0x7019\tf32\tmechPos\t负载端计圈机械角度 rad\tro\tro\t0.1\t0.2\t0.3',
      '0x7028\tu32\tcanTimeout\tCAN超时阈值 20000=1s\trw\tnormal\tERR\t0\t20000',
    ].join('\n');

    const parsed = parseRobstrideParamsTsv(tsv);
    expect(parsed.ok).toBe(true);
    expect(parsed.joints).toEqual([1, 2, 3]);
    // run_mode and iq_ref are writable with numeric cells; mechPos is read-only;
    // canTimeout J1 is "ERR" (skipped) but J2/J3 are numeric -> still a row.
    const ids = parsed.rows.map((r) => r.paramId);
    expect(ids).toEqual([0x7005, 0x7006, 0x7028]);
    const iq = parsed.rows.find((r) => r.paramId === 0x7006);
    expect(iq.values).toEqual({ 1: 1.5, 2: 2.5 }); // J3 "offline" skipped
    const canTo = parsed.rows.find((r) => r.paramId === 0x7028);
    expect(canTo.values).toEqual({ 2: 0, 3: 20000 }); // J1 "ERR" skipped
  });

  it('carries a Chinese description (descZh) for every catalog parameter', () => {
    for (const def of ROBSTRIDE_PARAM_CATALOG) {
      expect(typeof def.descZh).toBe('string');
      expect(def.descZh.length).toBeGreaterThan(0);
    }
  });

  it('rejects a malformed TSV with readable errors', () => {
    // Missing header entirely.
    expect(parseRobstrideParamsTsv('# only comments\n').ok).toBe(false);
    // Unknown param_id + missing required columns.
    const bad = 'param_id\ttype\tname\taccess\tpriority\tJ1\n0x9999\tf32\tbogus\trw\tnormal\t1.0\n';
    const parsed = parseRobstrideParamsTsv(bad);
    expect(parsed.ok).toBe(false);
    expect(parsed.errors.some((e) => e.includes('unknown param_id'))).toBe(true);
  });

  it('cross-checks name and type columns against the catalog', () => {
    const tsv = [
      'param_id\ttype\tname\taccess\tpriority\tJ1',
      '0x7005\tu8\twrong_name\trw\thigh\t0',
    ].join('\n');
    const parsed = parseRobstrideParamsTsv(tsv);
    expect(parsed.ok).toBe(false);
    expect(parsed.errors.some((e) => e.includes('name mismatch'))).toBe(true);
    expect(parsed.errors.some((e) => e.includes('type mismatch'))).toBe(true);
  });
});
