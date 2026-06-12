import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
      className="language-toggle"
      style={{
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-full)',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--accent-blue)';
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--glass-bg)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
    >
      <span>{language === 'en' ? '🇺🇸 EN' : '🇹🇭 TH'}</span>
    </button>
  );
};
