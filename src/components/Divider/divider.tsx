'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'sm' | 'md' | 'lg';

export interface DividerProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 默认水平 */
  orientation?: DividerOrientation;
  /** 虚线（1px dashed） */
  dashed?: boolean;
  /** 水平时是上下外边距，垂直时是左右外边距 */
  spacing?: DividerSpacing;
  /** 左右缩进（只对水平生效） */
  inset?: boolean;
  /** 纯装饰：不进无障碍树 */
  decorative?: boolean;
  /** 水平分隔线中间的文字 */
  children?: ReactNode;
}

export function Divider({
  orientation = 'horizontal',
  dashed = false,
  spacing = 'md',
  inset = false,
  decorative = false,
  className,
  children,
  ref,
  ...rest
}: DividerProps) {
  const vertical = orientation === 'vertical';
  const hasText = !vertical && children !== undefined && children !== null && children !== false;

  const classes = cx('oui-divider', className);
  const data = {
    'data-orientation': orientation,
    'data-spacing': spacing,
    'data-dashed': dashed ? '' : undefined,
    'data-inset': inset ? '' : undefined,
    'data-with-text': hasText ? '' : undefined,
  } as const;

  return (
    <div
      {...rest}
      {...data}
      ref={ref}
      className={classes}
      role={decorative ? undefined : 'separator'}
      aria-orientation={decorative ? undefined : vertical ? 'vertical' : 'horizontal'}
      aria-hidden={decorative ? true : undefined}
    >
      {hasText ? <span className="oui-divider__text">{children}</span> : null}
    </div>
  );
}
