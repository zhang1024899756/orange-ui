'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { Color, Size, Variant } from '../../types';
import { SpinnerGlyph } from '../_internal/spinner-glyph';
import './button.css';

export type ButtonShape = 'rect' | 'round' | 'circle';

export interface ButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /** 形态：实心 / 描边 / 浅底 / 幽灵 / 纯文字，默认 solid */
  variant?: Variant;
  /** 角色色，默认 primary */
  color?: Color;
  /** 尺寸，默认 md（32px，与参照站一致） */
  size?: Size;
  /** 形状：方角 / 胶囊 / 正圆 */
  shape?: ButtonShape;
  /** 加载中：锁定原宽度、阻断交互、aria-busy */
  loading?: boolean;
  /** 有值时替换文字；没有值时只转圈、原文字隐形以锁宽 */
  loadingText?: string;
  /** 左侧图标 */
  icon?: ReactNode;
  /** 右侧图标 */
  iconRight?: ReactNode;
  /** 撑满父容器 */
  block?: boolean;
  /** 给了 href 就渲染成 <a role="button"> */
  href?: string;
}

export function Button({
  variant = 'solid',
  color = 'primary',
  size = 'md',
  shape = 'rect',
  loading = false,
  loadingText,
  icon,
  iconRight,
  block = false,
  href,
  className,
  children,
  disabled,
  type,
  ref,
  ...rest
}: ButtonProps) {
  const iconOnly = !children && !loadingText && (icon !== undefined || iconRight !== undefined);
  const lockedWidth = loading && !loadingText;

  const classes = cx('oui-button', className);

  const data = {
    'data-variant': variant,
    'data-color': color,
    'data-size': size,
    'data-shape': iconOnly ? 'circle' : shape,
    'data-block': block ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'data-loading-text': loading && loadingText ? '' : undefined,
    'data-icon-only': iconOnly ? '' : undefined,
  } as const;

  const inner = (
    <>
      {loading ? (
        <span className="oui-button__spin" aria-hidden="true">
          <SpinnerGlyph />
        </span>
      ) : icon ? (
        <span className="oui-button__icon">{icon}</span>
      ) : null}

      {children || loadingText ? (
        <span className="oui-button__label">{loading && loadingText ? loadingText : children}</span>
      ) : null}

      {!loading && iconRight ? (
        <span className="oui-button__icon oui-button__icon--right">{iconRight}</span>
      ) : null}

      {lockedWidth ? <span className="oui-sr-only">加载中</span> : null}
    </>
  );

  if (href !== undefined) {
    return (
      <a
        {...(rest as ComponentPropsWithRef<'a'>)}
        {...data}
        ref={ref as unknown as ComponentPropsWithRef<'a'>['ref']}
        href={href}
        role="button"
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading ? true : undefined}
        tabIndex={disabled || loading ? -1 : undefined}
        className={classes}
        onClick={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            return;
          }
          (rest as ComponentPropsWithRef<'a'>).onClick?.(event);
        }}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      {...rest}
      {...data}
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {inner}
    </button>
  );
}
