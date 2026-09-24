// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useConnectionState } from './useConnectionState';

vi.mock('./useGatewayBridge', () => ({
  useGatewayBridge: () => ({
    connText: 'disconnected',
    connected: false,
    targetTransport: 'auto',
    targetSerialPort: '',
    gatewayCapabilities: null,
    capabilitiesSource: 'fallback',
    connectWs: vi.fn(),
    disconnectWs: vi.fn(),
    sendCmd: vi.fn(),
  }),
}));

function createStorageMock() {
  const store = new Map();
  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

function Harness() {
  const state = useConnectionState({
    pushLog: vi.fn(),
    setStateSnapshot: vi.fn(),
    onGatewayState: vi.fn(),
    onGatewayParams: vi.fn(),
  });

  return (
    <div>
      <div data-testid="ws-url">{state.wsUrl}</div>
      <div data-testid="ws-token-enabled">{String(state.wsTokenEnabled)}</div>
      <div data-testid="ws-token">{state.wsToken}</div>
    </div>
  );
}

let storage;

beforeEach(() => {
  storage = createStorageMock();
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useConnectionState persistence', () => {
  it('restores ws url and token settings from localStorage', () => {
    window.localStorage.setItem('motorbridge_studio_ws_url_v1', JSON.stringify('ws://persisted-host:9002'));
    window.localStorage.setItem('motorbridge_studio_ws_token_enabled_v1', JSON.stringify(true));
    window.localStorage.setItem('motorbridge_studio_ws_token_v1', JSON.stringify('persisted-token'));

    render(<Harness />);

    expect(screen.getByTestId('ws-url').textContent).toBe('ws://persisted-host:9002');
    expect(screen.getByTestId('ws-token-enabled').textContent).toBe('true');
    expect(screen.getByTestId('ws-token').textContent).toBe('persisted-token');
  });

  it('falls back to defaults when persisted ws url is blank', () => {
    window.localStorage.setItem('motorbridge_studio_ws_url_v1', JSON.stringify('   '));

    render(<Harness />);

    expect(screen.getByTestId('ws-url').textContent).toBe('ws://127.0.0.1:9002');
  });
});
