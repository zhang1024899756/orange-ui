'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './empty.css';

export type EmptySize = 'sm' | 'md' | 'lg';

export interface EmptyProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** 标题，默认「暂无数据」 */
  title?: ReactNode;
  /** 补充说明 */
  description?: ReactNode;
  /** 自定义图形，默认内置的几何占位插画 */
  icon?: ReactNode;
  /** 操作区，通常放一个按钮 */
  action?: ReactNode;
  /** 尺寸，默认 md；sm 用于卡片内部，lg 用于整页空态 */
  size?: EmptySize;
}

/** 默认插画：一只空托盘。24 网格外扩到 48，线宽 1.75、圆头，与内置图标同一套手绘语言。 */
function EmptyGlyph() {
  return (
    <svg
      className="oui-empty__glyph"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 24h30v12a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3Z" />
      <path d="M9 24 15 11h18l6 13" />
      <path d="M20 18h8" strokeDasharray="2 4" />
    </svg>
  );
}

/**
 * 空状态。
 * 自身没有交互，loading 不适用：数据加载中应该用 <Skeleton />，
 * action 里的按钮由使用方用 Button 的 loading 表达。
 */
export function Empty({
  title = '暂无数据',
  description,
  icon,
  action,
  size = 'md',
  className,
  children,
  ref,
  ...rest
}: EmptyProps) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('oui-empty', className)}
      data-size={size}
    >
      <div className="oui-empty__icon" aria-hidden="true">
        {icon ?? <EmptyGlyph />}
      </div>
      <div className="oui-empty__title">{title}</div>
      {description !== undefined ? <div className="oui-empty__description">{description}</div> : null}
      {children !== undefined ? <div className="oui-empty__extra">{children}</div> : null}
      {action !== undefined ? <div className="oui-empty__action">{action}</div> : null}
    </div>
  );
}
