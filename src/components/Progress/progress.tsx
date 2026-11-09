'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { Color } from '../../types';
import './progress.css';

export interface ProgressProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /** 0–100；indeterminate 时忽略 */
  value?: number;
  /** 线形或环形 */
  type?: 'line' | 'circle';
  /** 语义状态：success 强制成功色、error 强制危险色，优先于 color */
  status?: 'normal' | 'success' | 'error';
  /** 不确定进度 = loading 形态（无限流动） */
  indeterminate?: boolean;
  /** 是否在轨道右侧 / 环心显示百分比 */
  showLabel?: boolean;
  /** 尺寸：xs / sm / md；线形 4 / 6 / 8px，环形 40 / 56 / 72px */
  size?: 'xs' | 'sm' | 'md';
  /** 填充色；status 为 success / error 时会覆盖它 */
  color?: Color;
  /** 用品牌渐变填充 */
  gradient?: boolean;
  /** 自定义标签文案 */
  format?: (percent: number) => ReactNode;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

export function Progress({
  value = 0,
  type = 'line',
  status = 'normal',
  indeterminate = false,
  showLabel = false,
  size = 'sm',
  color = 'primary',
  gradient = false,
  format,
  className,
  ref,
  ...rest
}: ProgressProps) {
  const percent = indeterminate ? 0 : clamp(value);
  const resolvedColor = status === 'success' ? 'success' : status === 'error' ? 'danger' : color;
  const label = format ? format(percent) : `${Math.round(percent)}%`;

  const a11y = indeterminate
    ? { 'aria-busy': true as const }
    : { 'aria-valuenow': Math.round(percent), 'aria-valuemin': 0, 'aria-valuemax': 100 };

  const classes = cx('oui-progress', className);
  const data = {
    'data-type': type,
    'data-size': size,
    'data-color': resolvedColor,
    'data-status': status,
    'data-indeterminate': indeterminate ? '' : undefined,
    'data-gradient': gradient ? '' : undefined,
  } as const;

  if (type === 'circle') {
    const r = 18;
    const c = 2 * Math.PI * r;
    return (
      <div
        {...rest}
        {...data}
        ref={ref}
        className={classes}
        role="progressbar"
        aria-label={rest['aria-label'] ?? '进度'}
        {...a11y}
      >
        <svg className="oui-progress__ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle className="oui-progress__ring-track" cx="22" cy="22" r={r} />
          <circle
            className="oui-progress__ring-fill"
            cx="22"
            cy="22"
            r={r}
            strokeDasharray={`${(percent / 100) * c} ${c}`}
          />
        </svg>
        {showLabel ? <span className="oui-progress__ring-label">{label}</span> : null}
      </div>
    );
  }

  return (
    <div
      {...rest}
      {...data}
      ref={ref}
      className={classes}
      role="progressbar"
      aria-label={rest['aria-label'] ?? '进度'}
      {...a11y}
    >
      <div className="oui-progress__track">
        <div className="oui-progress__fill" style={indeterminate ? undefined : { width: `${percent}%` }} />
      </div>
      {showLabel ? <span className="oui-progress__label">{label}</span> : null}
    </div>
  );
}
