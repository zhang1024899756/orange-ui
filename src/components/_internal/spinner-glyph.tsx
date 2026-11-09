'use client';

import type { CSSProperties } from 'react';
import { cx } from '../../utils/cx';
import './spinner-glyph.css';

export interface SpinnerGlyphProps {
  /** 视觉尺寸，默认 1em（跟随字号） */
  size?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * 内部原语：所有组件的 loading 都用它。
 * 不单独对外导出，公开的是 Spinner 组件。
 */
export function SpinnerGlyph({ size = '1em', className, style }: SpinnerGlyphProps) {
  return (
    <svg
      className={cx('oui-spinner-glyph', className)}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.22" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
