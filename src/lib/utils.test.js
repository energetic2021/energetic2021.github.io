import { describe, expect, it } from 'vitest';
import {
  damiaoModelCandidates,
  normalizeControlForHit,
  normalizeControlValue,
  normalizeHits,
} from './utils';

describe('utils normalizeHits', () => {
  it('keeps Damiao auto scan focused on the installed 4340 and 4310 motors', () => {
    expect(damiaoModelCandidates('auto')).toEqual(['4340', '4310']);
    expect(damiaoModelCandidates('')).toEqual(['4340', '4310']);
  });

  it('uses confirmed RobStride device_id as esc_id', () => {
    const normalized = normalizeHits(
      'robstride',
      {
        hits: [
          { probe: 1, device_id: 1, responder_id: 254, feedback_id: 0xfd },
          { probe: 2, device_id: 2, responder_id: 254, feedback_id: 0xfd },
        ],
      },
      'rs-00'
    );

    expect(normalized).toHaveLength(2);
    expect(normalized[0].esc_id).toBe(1);
    expect(normalized[1].esc_id).toBe(2);
    expect(normalized[0].device_id).toBe(1);
    expect(normalized[1].device_id).toBe(2);
  });

  it('drops RobStride ping hits when probe and device_id disagree', () => {
    const normalized = normalizeHits(
      'robstride',
      {
        hits: [
          { probe: 1, device_id: 2, responder_id: 254, feedback_id: 0xfd },
          { probe: 2, device_id: 2, responder_id: 254, feedback_id: 0xfd },
        ],
      },
      'rs-00'
    );

    expect(normalized).toHaveLength(1);
    expect(normalized[0].esc_id).toBe(2);
  });

  it('keeps RobStride read-param fallback hits when no device_id is reported', () => {
    const [hit] = normalizeHits(
      'robstride',
      {
        hits: [{ probe: 3, via: 'read_param', feedback_id: 0xfd, param_id: '0x7019' }],
      },
      'rs-00'
    );

    expect(hit.esc_id).toBe(3);
    expect(hit.probe).toBe(3);
  });

  it('adds RobStride model limits to scan hits', () => {
    const [hit] = normalizeHits(
      'robstride',
      {
        hits: [{ probe: 4, device_id: 4, responder_id: 0xfd, feedback_id: 0xfd }],
      },
      'rs-00'
    );

    expect(hit.pmax).toBeCloseTo(4 * Math.PI);
    expect(hit.vmax).toBe(50);
    expect(hit.tmax).toBe(17);
  });
});

describe('utils normalizeControlValue', () => {
  it('preserves empty numeric control text while editing', () => {
    expect(normalizeControlValue('target', '', 1.23)).toBe('');
  });

  it('preserves transient negative numeric text while editing', () => {
    expect(normalizeControlValue('target', '-', 1.23)).toBe('-');
    expect(normalizeControlValue('target', '-.', 1.23)).toBe('-.');
  });

  it('preserves trailing decimal text while editing', () => {
    expect(normalizeControlValue('vlim', '1.', 0)).toBe('1.');
    expect(normalizeControlValue('kp', '12.', 0)).toBe('12.');
    expect(normalizeControlValue('kd', '-0.', 0)).toBe('-0.');
    expect(normalizeControlValue('tau', '0.', 0)).toBe('0.');
  });

  it('still parses numeric control text when present', () => {
    expect(normalizeControlValue('target', '1.23', 0)).toBeCloseTo(1.23);
    expect(normalizeControlValue('target', '-1.23', 0)).toBeCloseTo(-1.23);
  });
});

describe('utils normalizeControlForHit', () => {
  it('does not refill cleared numeric control fields while editing', () => {
    const hit = { vendor: 'robstride', esc_id: 1, mst_id: 0xfd };
    const control = normalizeControlForHit(hit, {
      target: '',
      vlim: '',
      kp: '',
      kd: '',
      tau: '',
      ratio: '',
      newEsc: '',
      newMst: '',
    });

    expect(control.target).toBe('');
    expect(control.vlim).toBe('');
    expect(control.kp).toBe('');
    expect(control.kd).toBe('');
    expect(control.tau).toBe('');
    expect(control.ratio).toBe('');
    expect(control.newEsc).toBe('');
    expect(control.newMst).toBe('');
  });
});
