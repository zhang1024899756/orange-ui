'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import type { OuiScheme, OuiTheme } from '../types';

export interface ThemeProviderProps {
  /** 内置主题名（orange / violet / teal / rose）或使用方自己注册的主题名 */
  theme?: OuiTheme;
  /** 明暗；system 会跟随 prefers-color-scheme */
  scheme?: OuiScheme;
  /** 自定义强调色：只给主色与渐变副色即可，其余派生由 CSS 完成 */
  primary?: string;
  primary2?: string;
  /** true = 写到 <html> 上（整站生效）；false（默认）= 包一层 div，只管自己这片区域 */
  global?: boolean;
  className?: string;
  children: ReactNode;
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

function useResolvedScheme(scheme: OuiScheme): 'light' | 'dark' {
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    if (scheme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(DARK_QUERY);
    setSystemDark(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [scheme]);

  if (scheme === 'system') return systemDark ? 'dark' : 'light';
  return scheme;
}

/**
 * 主题作用域。
 * - global=false（默认）：渲染一层 div，只影响内部组件，适合站点里的嵌入式区块
 * - global=true：把属性写到 <html> 上，整站生效
 * 两种模式都只改 data 属性与 CSS 变量，不触发任何样式重算之外的重新渲染。
 */
export function ThemeProvider({
  theme = 'orange',
  scheme = 'light',
  primary,
  primary2,
  global = false,
  className,
  children,
}: ThemeProviderProps) {
  const resolved = useResolvedScheme(scheme);

  const style = useMemo<CSSProperties | undefined>(() => {
    if (!primary && !primary2) return undefined;
    const vars: Record<string, string> = {};
    if (primary) vars['--oui-color-primary'] = primary;
    if (primary2) {
      vars['--oui-gradient-brand-2'] = primary2;
      vars['--oui-gradient-brand'] =
        `linear-gradient(135deg, ${primary ?? 'var(--oui-color-primary)'} 0%, ${primary2} 100%)`;
    }
    return vars as CSSProperties;
  }, [primary, primary2]);

  useEffect(() => {
    if (!global || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-oui-theme', theme);
    root.setAttribute('data-oui-scheme', resolved);
    if (style) {
      for (const [key, value] of Object.entries(style)) {
        if (key.startsWith('--') && typeof value === 'string') root.style.setProperty(key, value);
      }
    }
    return () => {
      if (!style) return;
      for (const key of Object.keys(style)) {
        if (key.startsWith('--')) root.style.removeProperty(key);
      }
    };
  }, [global, theme, resolved, style]);

  if (global) return <>{children}</>;

  return (
    <div
      className={cx('oui-root', className)}
      data-oui-theme={theme}
      data-oui-scheme={resolved}
      style={style}
    >
      {children}
    </div>
  );
}
