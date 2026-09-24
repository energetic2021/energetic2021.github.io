// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '../i18n';
import { MotorStudioProvider } from '../hooks/useMotorStudioContext';
import { ConnectionPanel } from './ConnectionPanel';

function renderWithStudio(connectionOverrides = {}) {
  const connection = {
    wsUrl: 'ws://127.0.0.1:9002',
    setWsUrl: vi.fn(),
    channel: 'can0',
    setChannel: vi.fn(),
    targetTransport: 'auto',
    targetSerialPort: '',
    capabilitiesSource: 'fallback',
    scanTimeoutMs: '500',
    setScanTimeoutMs: vi.fn(),
    wsTokenEnabled: false,
    setWsTokenEnabled: vi.fn(),
    wsToken: '',
    setWsToken: vi.fn(),
    connectWs: vi.fn(),
    disconnectWs: vi.fn(),
    ...connectionOverrides,
  };

  const studio = {
    connection,
    scan: {},
    control: {},
    robotArm: {},
    preferences: {
      uiPrefs: { sectionConnectionCollapsed: false },
      toggleUiPref: vi.fn(),
    },
    logs: {},
    workspace: {},
  };

  return render(
    <I18nProvider>
      <MotorStudioProvider value={studio}>
        <ConnectionPanel />
      </MotorStudioProvider>
    </I18nProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ConnectionPanel token controls', () => {
  it('renders token checkbox and disabled token input by default', () => {
    renderWithStudio();

    expect(screen.getByLabelText('Enable MOTORBRIDGE_WS_TOKEN')).toBeTruthy();
    expect(screen.getByLabelText('MOTORBRIDGE_WS_TOKEN').disabled).toBe(true);
  });

  it('enables the token input and wires change handlers from context', () => {
    const setWsTokenEnabled = vi.fn();
    const setWsToken = vi.fn();

    renderWithStudio({
      wsTokenEnabled: true,
      wsToken: 'secret-token',
      setWsTokenEnabled,
      setWsToken,
    });

    fireEvent.click(screen.getByLabelText('Enable MOTORBRIDGE_WS_TOKEN'));
    fireEvent.change(screen.getByLabelText('MOTORBRIDGE_WS_TOKEN'), {
      target: { value: 'next-token' },
    });

    expect(setWsTokenEnabled).toHaveBeenCalled();
    expect(setWsToken).toHaveBeenCalledWith('next-token');
    expect(screen.getByLabelText('MOTORBRIDGE_WS_TOKEN').disabled).toBe(false);
  });

  it('toggles token visibility with the eye button', () => {
    renderWithStudio({
      wsTokenEnabled: true,
      wsToken: 'secret-token',
    });

    const input = screen.getByLabelText('MOTORBRIDGE_WS_TOKEN');
    const toggle = screen.getByRole('button', { name: 'Show token' });

    expect(input.type).toBe('password');

    fireEvent.click(toggle);

    expect(screen.getByLabelText('MOTORBRIDGE_WS_TOKEN').type).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide token' })).toBeTruthy();
  });
});
