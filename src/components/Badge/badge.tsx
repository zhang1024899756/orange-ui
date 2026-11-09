'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { Color } from '../../types';
import './badge.css';

export interface BadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'content' | 'color'> {
  /** 计数值；0 默认不显示（用 showZero 打开） */
  count?: number;
  /** 计数上限，超过显示「max+」，默认 99 */
  max?: number;
  /** 只显示一个圆点，不带数字 */
  dot?: boolean;
  /** 文字徽章内容，如 NEW / BETA */
  content?: ReactNode;
  /** 角色色，默认 primary */
  color?: Color;
  /** 两档高度：sm 16 / md 24，默认 sm */
  size?: 'sm' | 'md';
  /** 相对右上角的额外偏移 [x, y]，单位 px */
  offset?: [number, number];
  /** count 为 0 时是否仍然显示 */
  showZero?: boolean;
  /** 覆盖读屏文案；数字徽章默认「N 条未读」 */
  label?: string;
  /** 被标注的元素；有 children 时徽章绝对定位到右上角 */
  children?: ReactNode;
}

type BadgeKind = 'dot' | 'count' | 'text';

/** 徽章。有 children 贴在右上角，没有就独立显示。 */
export function Badge({
  count,
  max = 99,
  dot = false,
  content,
  color = 'primary',
  size = 'sm',
  offset,
  showZero = false,
  label,
  className,
  style,
  children,
  ref,
  ...rest
}: BadgeProps) {
  const hasChildren = children !== undefined && children !== null;

  let kind: BadgeKind | null = null;
  let inner: ReactNode = null;
  let a11yLabel: string | undefined;

  if (dot) {
    kind = 'dot';
    // 纯圆点没有文字，读屏必须靠 label
    a11yLabel = label ?? '有未读内容';
  } else if (count !== undefined && (count > 0 || showZero)) {
    kind = 'count';
    const shown = count > max ? `${max}+` : String(count);
    inner = shown;
    a11yLabel = label ?? `${shown} 条未读`;
  } else if (content !== undefined && content !== null) {
    kind = 'text';
    inner = content;
    // 文字徽章本身可读，不再套 role=img；只有显式给了 label 才替换
    a11yLabel = label;
  }

  const styleWithOffset = (
    offset ? { ...style, '--oui-badge-offset-x': `${offset[0]}px`, '--oui-badge-offset-y': `${offset[1]}px` } : style
  ) as CSSProperties;

  const data = {
    'data-color': color,
    'data-size': size,
    'data-standalone': hasChildren ? undefined : '',
  } as const;

  return (
    <span {...rest} {...data} ref={ref} className={cx('oui-badge', className)} style={styleWithOffset}>
      {children}
      {kind !== null ? (
        <span
          className="oui-badge__bubble"
          data-kind={kind}
          role={a11yLabel ? 'img' : undefined}
          aria-label={a11yLabel}
        >
          {inner}
        </span>
      ) : null}
    </span>
  );
}
