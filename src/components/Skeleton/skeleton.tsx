'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './skeleton.css';

export type SkeletonVariant = 'text' | 'rect' | 'circle' | 'button';

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 形态：文本行 / 矩形 / 圆形 / 按钮，默认 text */
  variant?: SkeletonVariant;
  /** 宽度；数字按 px 处理 */
  width?: number | string;
  /** 高度；数字按 px 处理。text 多行时作用于每一行 */
  height?: number | string;
  /** text 形态的行数，默认 3；最后一行固定 60% 宽 */
  lines?: number;
  /** 是否播放扫光动画，默认 true（减少动态偏好下自动退化为静态灰块） */
  animated?: boolean;
  /** 包裹模式：true 显示骨架，false 直接渲染 children，默认 true */
  loading?: boolean;
  /** 被包裹的内容；给了 children 就进入包裹模式 */
  children?: ReactNode;
}

const toCssSize = (value: number | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

/**
 * 骨架屏。两种用法：
 * 1. 占位：<Skeleton variant="rect" /> —— 自身就是骨架，对读屏隐藏；
 * 2. 包裹：<Skeleton loading={loading}>{content}</Skeleton> —— 外层带 aria-busy，加载中换成骨架。
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 3,
  animated = true,
  loading = true,
  className,
  style,
  children,
  ref,
  ...rest
}: SkeletonProps) {
  const lineCount = variant === 'text' ? Math.max(1, Math.floor(lines)) : 1;

  const cssWidth = toCssSize(width);
  const cssHeight = toCssSize(height);

  // text 的宽度挂在容器上（每一行撑满），其余形态挂在骨块本身
  const rootStyle: CSSProperties = { ...style };
  const barStyle: CSSProperties = {};
  if (variant === 'text') {
    if (cssWidth) rootStyle.width = cssWidth;
    if (cssHeight) barStyle.height = cssHeight;
  } else {
    if (cssWidth) barStyle.width = cssWidth;
    if (cssHeight) barStyle.height = cssHeight;
  }

  const bars = Array.from({ length: lineCount }, (_, index) => (
    <span
      key={index}
      className="oui-skeleton__bar"
      // 多行文本的末行留短，视觉上像一句话结束
      data-partial={index === lineCount - 1 && lineCount > 1 ? '' : undefined}
      style={barStyle}
    />
  ));

  const data = {
    'data-variant': variant,
    'data-animated': animated ? '' : undefined,
  } as const;

  if (children !== undefined) {
    return (
      <div
        {...rest}
        // 已加载完成时不挂形态标记：骨架的 flex 排布不能影响真实内容的布局
        {...(loading ? data : {})}
        data-wrapper=""
        ref={ref}
        className={cx('oui-skeleton', className)}
        style={rootStyle}
        aria-busy={loading || undefined}
      >
        {loading ? bars : children}
      </div>
    );
  }

  return (
    <div
      {...rest}
      {...data}
      data-standalone=""
      ref={ref}
      className={cx('oui-skeleton', className)}
      style={rootStyle}
      aria-hidden="true"
    >
      {bars}
    </div>
  );
}
