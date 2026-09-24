import { describe, expect, it } from 'vitest';
import { DEV_SEQUENCE, advanceDevSequence } from './useDevMode';

const ev = (key, { ctrl = true, meta = false } = {}) => ({ ctrl, meta, key });

describe('advanceDevSequence (Ctrl+D+E+V chord)', () => {
  it('completes only when the full ordered sequence is pressed with ctrl held', () => {
    let state = { buffer: [], complete: false };
    state = advanceDevSequence(state.buffer, ev('d'));
    expect(state.complete).toBe(false);
    expect(state.buffer).toEqual(['d']);
    state = advanceDevSequence(state.buffer, ev('e'));
    expect(state.complete).toBe(false);
    expect(state.buffer).toEqual(['d', 'e']);
    state = advanceDevSequence(state.buffer, ev('v'));
    expect(state.complete).toBe(true);
    expect(state.buffer).toEqual([]);
  });

  it('ignores keys pressed without a modifier', () => {
    const state = advanceDevSequence(['d'], ev('e', { ctrl: false }));
    expect(state.buffer).toEqual([]);
    expect(state.complete).toBe(false);
  });

  it('resets the buffer on an out-of-order key', () => {
    let state = advanceDevSequence([], ev('d'));
    state = advanceDevSequence(state.buffer, ev('x')); // breaks the prefix
    expect(state.buffer).toEqual([]);
    // A later 'v' alone cannot complete.
    state = advanceDevSequence(state.buffer, ev('v'));
    expect(state.complete).toBe(false);
  });

  it('restarts at d when d is pressed mid-sequence', () => {
    let state = advanceDevSequence([], ev('d'));
    state = advanceDevSequence(state.buffer, ev('d')); // restart
    expect(state.buffer).toEqual(['d']);
    state = advanceDevSequence(state.buffer, ev('e'));
    state = advanceDevSequence(state.buffer, ev('v'));
    expect(state.complete).toBe(true);
  });

  it('matches the documented chord letters', () => {
    expect(DEV_SEQUENCE).toEqual(['d', 'e', 'v']);
  });
});
