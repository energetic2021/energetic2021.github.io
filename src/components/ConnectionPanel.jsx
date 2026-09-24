import React from 'react';
import { useI18n } from '../i18n';
import { CollapsibleSection } from './CollapsibleSection';
import { useConnectionContext, usePreferencesContext } from '../hooks/useMotorStudioContext';

function TokenVisibilityIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 3l18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.3A10.6 10.6 0 0 1 12 6c6.3 0 9.9 6 9.9 6a17.4 17.4 0 0 1-3.2 3.8M6.5 6.8C4.1 8.4 2.1 12 2.1 12a17.7 17.7 0 0 0 9.9 6 10.9 10.9 0 0 0 4.1-.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9A3.2 3.2 0 0 0 14.1 14.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ConnectionPanel() {
  const { t } = useI18n();
  const [showWsToken, setShowWsToken] = React.useState(false);
  const {
    wsUrl,
    setWsUrl,
    channel,
    setChannel,
    targetTransport,
    targetSerialPort,
    capabilitiesSource,
    scanTimeoutMs,
    setScanTimeoutMs,
    wsTokenEnabled,
    setWsTokenEnabled,
    wsToken,
    setWsToken,
    connectWs,
    disconnectWs,
  } = useConnectionContext();
  const { uiPrefs, toggleUiPref } = usePreferencesContext();
  const collapsed = uiPrefs.sectionConnectionCollapsed;
  const onToggleCollapsed = () => toggleUiPref('sectionConnectionCollapsed');
  const isDmSerial = String(targetTransport || '').trim().toLowerCase() === 'dm-serial';
  const transportText = String(targetTransport || 'auto').trim() || 'auto';
  const serialText = String(targetSerialPort || '').trim() || t('serial_port_gateway_managed');
  return (
    <CollapsibleSection
      title={t('section_connection')}
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      collapsedHint={t('websocket_can')}
    >

      {!collapsed && (
        <>
          <div className="connCompactGrid">
            <div className="field compactField connFieldUrl">
              <label>{t('ws_url')}</label>
              <input value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} />
            </div>
            <div className="field compactField connFieldTokenToggle">
              <label>
                <input
                  type="checkbox"
                  checked={wsTokenEnabled}
                  onChange={(e) => setWsTokenEnabled(e.target.checked)}
                />{' '}
                {t('ws_token_enabled')}
              </label>
            </div>
            <div className="field compactField connFieldToken">
              <label>{t('ws_token')}</label>
              <div className="tokenInputWrap">
                <input
                  type={showWsToken ? 'text' : 'password'}
                  aria-label={t('ws_token')}
                  value={wsToken}
                  disabled={!wsTokenEnabled}
                  onChange={(e) => setWsToken(e.target.value)}
                  placeholder={t('ws_token_placeholder')}
                />
                <button
                  type="button"
                  className="tokenEyeBtn"
                  aria-label={showWsToken ? t('hide_ws_token') : t('show_ws_token')}
                  title={showWsToken ? t('hide_ws_token') : t('show_ws_token')}
                  disabled={!wsTokenEnabled}
                  onClick={() => setShowWsToken((prev) => !prev)}
                >
                  <TokenVisibilityIcon visible={showWsToken} />
                </button>
              </div>
            </div>
            <div className="field compactField connFieldTransport">
              <label>{t('transport')}</label>
              <input value={transportText} readOnly />
            </div>
            <div className="field compactField connFieldChannel">
              <label>{isDmSerial ? t('serial_port') : t('can_channel')}</label>
              {isDmSerial ? (
                <input value={serialText} readOnly disabled title={t('serial_port_gateway_managed')} />
              ) : (
                <input value={channel} onChange={(e) => setChannel(e.target.value)} />
              )}
            </div>
            <div className="field compactField connFieldTimeout">
              <label>{t('scan_timeout_ms')}</label>
              <input value={scanTimeoutMs} onChange={(e) => setScanTimeoutMs(e.target.value)} />
            </div>
          </div>

          <div className="row toolbar">
            <button className="primary strong" onClick={connectWs}>{t('connect')}</button>
            <button onClick={disconnectWs}>{t('disconnect')}</button>
            <span className="tip">
              {t('pure_frontend_tip')} · {t('capabilities_source')}: {capabilitiesSource || 'fallback'}
            </span>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}
