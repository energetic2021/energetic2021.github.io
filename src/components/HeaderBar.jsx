import React from 'react';
import { useI18n } from '../i18n';
import {
  useConnectionContext,
  useDevContext,
  useWorkspaceContext,
} from '../hooks/useMotorStudioContext';

export function HeaderBar() {
  const { t, locale, setLocale } = useI18n();
  const { connected, connText } = useConnectionContext();
  const { devMode } = useDevContext();
  const { setMenuOpen } = useWorkspaceContext();
  const logoUrl = `${import.meta.env.BASE_URL}seeed-logo.png`;

  return (
    <header className="hero">
      <div className="heroBrand">
        <div className="heroLogoWrap">
          <img
            className="heroLogo"
            src={logoUrl}
            alt="Seeed Studio logo"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="heroTitleBlock">
          <h1>{t('app_title')}</h1>
        </div>
      </div>
      <div className="heroActions">
        <label className="langBox">
          <span>{t('language')}</span>
          <select value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="en">{t('lang_en')}</option>
            <option value="zh">{t('lang_zh')}</option>
            <option value="es">{t('lang_es')}</option>
          </select>
        </label>
        <button className="menuToggle" onClick={() => setMenuOpen((v) => !v)}>
          {t('quick_menu')}
        </button>
        <div className="heroConnStatus">
          <div className={`badge ${connected ? 'ok' : 'err'}`}>{connText}</div>
          {devMode && (
            <span className="armDevBadge" title={t('arm_dev_mode_hint')}>
              DEV
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
