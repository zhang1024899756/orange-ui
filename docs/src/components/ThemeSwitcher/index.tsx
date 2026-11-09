import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const THEMES = [
  { id: 'orange', label: '蜜橘', color: '#F26B21' },
  { id: 'violet', label: '紫罗兰', color: '#624AFF' },
  { id: 'teal', label: '青屿', color: '#0E9384' },
  { id: 'rose', label: '珊瑚', color: '#E5446D' },
];

const STORAGE_KEY = 'orange-ui-docs-theme';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('orange');
  const [scheme, setScheme] = useState('light');

  useEffect(() => {
    const html = document.documentElement;
    const apply = (next: { theme: string; scheme: string }) => {
      html.setAttribute('data-oui-theme', next.theme);
      html.setAttribute('data-oui-scheme', next.scheme);
      html.setAttribute('data-theme', next.scheme === 'dark' ? 'dark' : 'light');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
    };

    const fromDom = {
      theme: html.getAttribute('data-oui-theme') ?? 'orange',
      scheme: html.getAttribute('data-oui-scheme') === 'dark' ? 'dark' : 'light',
    };
    setTheme(fromDom.theme);
    setScheme(fromDom.scheme);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent).detail as { theme: string; scheme: string } | undefined;
      if (!detail) return;
      setTheme(detail.theme);
      setScheme(detail.scheme);
    };
    window.addEventListener('oui-docs-theme', onChange);
    return () => window.removeEventListener('oui-docs-theme', onChange);
  }, []);

  const pick = (nextTheme: string, nextScheme: string) => {
    setTheme(nextTheme);
    setScheme(nextScheme);
    const html = document.documentElement;
    html.setAttribute('data-oui-theme', nextTheme);
    html.setAttribute('data-oui-scheme', nextScheme);
    html.setAttribute('data-theme', nextScheme === 'dark' ? 'dark' : 'light');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: nextTheme, scheme: nextScheme }));
    } catch { /* ignore */ }
  };

  return (
    <div className={styles.wrap} role="group" aria-label="主题切换">
      {THEMES.map((item) => (
        <button
          key={item.id}
          type="button"
          className={styles.dot}
          data-active={theme === item.id ? '' : undefined}
          style={{ '--dot': item.color } as React.CSSProperties}
          aria-label={'主题：' + item.label}
          aria-pressed={theme === item.id}
          title={item.label}
          onClick={() => pick(item.id, scheme)}
        />
      ))}
      <span className={styles.sep} aria-hidden="true" />
      <button
        type="button"
        className={styles.mode}
        aria-label={scheme === 'dark' ? '切换到亮色' : '切换到暗色'}
        aria-pressed={scheme === 'dark'}
        title={scheme === 'dark' ? '亮色' : '暗色'}
        onClick={() => pick(theme, scheme === 'dark' ? 'light' : 'dark')}
      >
        {scheme === 'dark' ? '☾' : '☀'}
      </button>
    </div>
  );
}
