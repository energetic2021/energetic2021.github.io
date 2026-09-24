import { useCallback, useEffect, useState } from 'react';

// Developer-mode toggle triggered by the key chord Ctrl+D, Ctrl+E, Ctrl+V
// (hold Ctrl and tap D, E, V in order within a short window). Session-only:
// the flag lives in component state, not localStorage, so a page refresh or
// reconnect clears it — there is no risk of leaving hidden controls exposed
// across sessions on a shared machine.
//
// The chord is detected by accumulating the last few ctrl-held letter keys
// and matching against ['d','e','v']. `advanceDevSequence` is extracted as a
// pure function so the matching logic can be unit-tested without the DOM.

export const DEV_SEQUENCE = ['d', 'e', 'v'];
const SEQUENCE_WINDOW_MS = 2000;

// Given the current buffer and a keydown event, return the next buffer and
// whether the sequence just completed. ctrl/meta must be held for the key to
// count; any non-matching key resets the buffer so a stray press cannot
// complete a partial sequence.
//
// Returns { buffer: string[], complete: boolean }.
export function advanceDevSequence(buffer, { ctrl, meta, key } = {}) {
  const mod = ctrl || meta;
  const k = String(key || '').toLowerCase();
  if (!mod || !/^[a-z]$/.test(k)) {
    return { buffer: [], complete: false };
  }
  // Accept the key only if it extends the prefix so far.
  const expected = DEV_SEQUENCE[buffer.length];
  if (k === expected) {
    const next = [...buffer, k];
    if (next.length === DEV_SEQUENCE.length) {
      return { buffer: [], complete: true };
    }
    return { buffer: next, complete: false };
  }
  // Allow restarting at 'd' even mid-sequence (e.g. d, d, e, v).
  if (k === DEV_SEQUENCE[0]) {
    return { buffer: [k], complete: false };
  }
  return { buffer: [], complete: false };
}

export function useDevMode() {
  const [devMode, setDevModeState] = useState(false);

  useEffect(() => {
    let buffer = [];
    let timer = null;
    const reset = () => {
      buffer = [];
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    const onKeyDown = (e) => {
      const { buffer: nextBuffer, complete } = advanceDevSequence(buffer, {
        ctrl: e.ctrlKey,
        meta: e.metaKey,
        key: e.key,
      });
      buffer = nextBuffer;
      // While a prefix is forming, suppress the browser defaults for these
      // keys so Ctrl+D (bookmark) / Ctrl+E / Ctrl+V don't hijack the chord.
      // A standalone Ctrl+V paste when NOT mid-sequence is still allowed
      // because the buffer is empty and we return early inside the matcher.
      if (buffer.length > 0 || complete) {
        e.preventDefault();
      }
      if (complete) {
        setDevModeState((v) => !v);
        reset();
        return;
      }
      if (buffer.length > 0) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(reset, SEQUENCE_WINDOW_MS);
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const toggleDevMode = useCallback(() => setDevModeState((v) => !v), []);
  const setDevMode = useCallback((v) => setDevModeState(Boolean(v)), []);
  return { devMode, setDevMode, toggleDevMode };
}
