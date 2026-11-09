'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { deriveSolidColor, mixBlack } from '../utils/color';
import type { OuiScheme, OuiTheme } from '../types';

export interface ThemeProviderProps {
  /** 内置主题名（orange / violet / teal / rose）或使用方自己注册的主题名 */
  theme?: OuiTheme;
  /** 明暗；system 会跟随 prefers-color-scheme */
  scheme?: OuiScheme;
  /**
   * 自定义强调色（fill 层）：描边、16px 图标、焦点环、10% 浅底、渐变副色都用它。
   * 实心背景需要的那一档会由 primarySolid 或自动派生补上——见下。
   */
  primary?: string;
  /** 渐变副色；给了它才会重写 --oui-gradient-brand */
  primary2?: string;
  /**
   * 实心背景档（白字 ≥4.5:1）。不传时按 primary 自动派生：
   * 保持色相/饱和度、压低明度到白字刚好达标；primary 本身已达标（如 #624AFF 5.33）就原样使用。
   * 想精确控制品牌色在实心大块上的深浅时再传它。
   */
  primarySolid?: string;
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
 * 把调用方的自定义颜色翻译成 CSS 变量。
 *
 * 0.2.0 起实心背景恒白字，所以只给 --oui-color-primary 是不够的：白字压在 #F26B21 上只有
 * 3.04:1。这里在运行时把实心档一并算出来（deriveSolidColor），并把 hover / active 按
 * tokens.css 同一套比例（92% / 86% 保留）派生——调用方只写一个 primary，实心按钮就是对的。
 */
function buildColorVars(primary?: string, primary2?: string, primarySolid?: string): Record<string, string> {
  const vars: Record<string, string> = {};

  if (primary) vars['--oui-color-primary'] = primary;

  const solid = primarySolid ?? (primary ? deriveSolidColor(primary) ?? undefined : undefined);
  if (solid) {
    vars['--oui-color-primary-solid'] = solid;
    const hover = mixBlack(solid, 0.92);
    const active = mixBlack(solid, 0.86);
    if (hover) vars['--oui-color-primary-solid-hover'] = hover;
    if (active) vars['--oui-color-primary-solid-active'] = active;
  }

  if (primary2) {
    vars['--oui-gradient-brand-2'] = primary2;
    vars['--oui-gradient-brand'] =
      'linear-gradient(135deg, ' + (primary ?? 'var(--oui-color-primary)') + ' 0%, ' + primary2 + ' 100%)';
  }

  return vars;
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
  primarySolid,
  global = false,
  className,
  children,
}: ThemeProviderProps) {
  const resolved = useResolvedScheme(scheme);

  const style = useMemo<CSSProperties | undefined>(() => {
    const vars = buildColorVars(primary, primary2, primarySolid);
    return Object.keys(vars).length > 0 ? (vars as CSSProperties) : undefined;
  }, [primary, primary2, primarySolid]);

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
