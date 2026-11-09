import React, { useEffect } from 'react';
import '@arvinzxy/orange-ui/style.css';

/**
 * 文档站根节点。
 * 1) 引入组件库的完整样式（tokens + base + 20 个组件）
 * 2) 给 <body> 加 .oui-root：base 层的 box-sizing / 字体 / 焦点环只作用于
 *    .oui-root 子树，加上它整站就都吃组件库的排版基线，且不污染组件库本身
 * 3) 从 localStorage 恢复上次选的主题，避免刷新回弹
 */
const STORAGE_KEY = 'orange-ui-docs-theme';

function readSaved(): { theme: string; scheme: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.theme === 'string' && typeof parsed.scheme === 'string') return parsed;
    }
  } catch { /* 隐私模式下 localStorage 会抛，忽略 */ }
  return { theme: 'orange', scheme: 'light' };
}

export default function Root({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    document.body.classList.add('oui-root');
    const saved = readSaved();
    html.setAttribute('data-oui-theme', saved.theme);
    html.setAttribute('data-oui-scheme', saved.scheme);
    html.setAttribute('data-theme', saved.scheme === 'dark' ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('oui-docs-theme', { detail: saved }));
  }, []);

  return <>{children}</>;
}
