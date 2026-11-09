'use client';

import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import type { Color } from '../../types';
import { SpinnerGlyph } from '../_internal/spinner-glyph';
import './spinner.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

/** 四个尺寸的像素值。这是组件对外 API，不是样式，样式全部在 spinner.css 里取 tokens。 */
const SIZE_PX: Record<SpinnerSize, number> = { xs: 12, sm: 16, md: 20, lg: 24 };

export interface SpinnerProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'color'> {
  /** 尺寸，默认 sm（16px） */
  size?: SpinnerSize;
  /** 给了 label 就进无障碍树（role=status），并显示一行文字 */
  label?: string;
  /** 与文字同行显示，而不是占满一行 */
  inline?: boolean;
  /** 覆盖在父容器上（父容器需 position: relative），用于区域级加载 */
  overlay?: boolean;
  /** 角色色，默认 primary；current 表示跟随继承色 */
  color?: Color | 'current';
}

/**
 * 加载指示器。复用 _internal/spinner-glyph，不重复画 SVG。
 * 没有 label 时对读屏隐藏，此时应由外层容器标注 aria-busy。
 */
export function Spinner({
  size = 'sm',
  label,
  inline = false,
  overlay = false,
  color = 'primary',
  className,
  ref,
  ...rest
}: SpinnerProps) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('oui-spinner', className)}
      data-size={size}
      data-color={color}
      data-inline={inline ? '' : undefined}
      data-overlay={overlay ? '' : undefined}
      role={label ? 'status' : undefined}
      aria-live={label ? 'polite' : undefined}
      aria-hidden={label ? undefined : true}
    >
      <SpinnerGlyph size={SIZE_PX[size]} className="oui-spinner__glyph" />
      {label ? <span className="oui-spinner__label">{label}</span> : null}
    </div>
  );
}
