'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import './number.css';

export type NumberSize = 'xs' | 'sm' | 'md' | 'lg';

export interface NumberProps extends Omit<ComponentPropsWithRef<'span'>, 'color' | 'prefix'> {
  /** 数值 */
  value: number;
  /** 小数位；不传时普通模式按整数展示 */
  precision?: number;
  /** 紧凑写法：14000 → 1.4万，1200 → 1.2k */
  compact?: boolean;
  /** 前缀（货币符号、量纲） */
  prefix?: ReactNode;
  /** 后缀（%、次、人） */
  suffix?: ReactNode;
  /** 涨跌值：>0 绿箭头向上，<0 红箭头向下，0 保持中性 */
  trend?: number;
  /** 等宽数字，默认 true（表格里数字不跳动） */
  mono?: boolean;
  /** 字号档，默认 md */
  size?: NumberSize;
  /** 加载态：同高骨架条，不改变盒子高度 */
  loading?: boolean;
  /** 数字变化时 count-up；prefers-reduced-motion 下自动关闭 */
  animated?: boolean;
}

function trimZero(input: string): string {
  return input.replace(/\.0+$/, '');
}

/** 数字格式化：紧凑档与千分位档共用一套精度口径 */
export function formatNumberValue(value: number, precision?: number, compact = false): string {
  // 组件名就叫 Number，会遮蔽全局构造器，这里显式走 globalThis
  if (!globalThis.Number.isFinite(value)) return String(value);

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const digits = precision;

  if (compact) {
    if (abs >= 10000) {
      return sign + trimZero((abs / 10000).toFixed(digits ?? 1)) + '万';
    }
    if (abs >= 1000) {
      return sign + trimZero((abs / 1000).toFixed(digits ?? 1)) + 'k';
    }
    if (abs === 0) return '0';
    return sign + (digits === undefined ? String(abs) : abs.toFixed(digits));
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits ?? 0,
    maximumFractionDigits: digits ?? 0,
  }).format(value);
}

/**
 * 数值。所有数字都走 tabular-nums，等宽对齐；涨跌色只在箭头和数字上用 ink 档。
 */
export function Number({
  value,
  precision,
  compact = false,
  prefix,
  suffix,
  trend,
  mono = true,
  size = 'md',
  loading = false,
  animated = false,
  className,
  children,
  ref,
  ...rest
}: NumberProps) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;

    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!animated || reduce || from === value || typeof requestAnimationFrame !== 'function') {
      setDisplay(value);
      return;
    }

    const duration = 600;
    const start = performance.now();
    let raf = 0;
    let settled = false;

    const finish = () => {
      settled = true;
      setDisplay(value);
    };

    const tick = (now: number) => {
      // 定时器已经收尾了就不再让慢帧把中间值写回去
      if (settled) return;
      const progress = Math.min(1, (now - start) / duration);
      if (progress >= 1) {
        finish();
        return;
      }
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // rAF 在标签页切到后台时会被浏览器暂停，动画会永远停在中间值；
    // 用一个定时器兜底，保证无论如何最终都会落到目标值。
    const settle = setTimeout(finish, duration + 80);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [value, animated]);

  const classes = cx('oui-number', className);
  const baseData = {
    'data-size': size,
    'data-mono': mono ? '' : undefined,
    'data-trend': trend === undefined ? undefined : trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat',
  } as const;

  if (loading) {
    return (
      <span {...rest} {...baseData} ref={ref} className={classes} data-loading="" aria-busy="true">
        <span className="oui-number__skeleton" aria-hidden="true" />
        <span className="oui-sr-only">加载中</span>
      </span>
    );
  }

  const text = formatNumberValue(display, precision, compact);

  return (
    <span {...rest} {...baseData} ref={ref} className={classes}>
      {trend !== undefined && trend !== 0 ? (
        <>
          <Icon
            name={trend > 0 ? 'chevron-up' : 'chevron-down'}
            size={12}
            className="oui-number__trend"
          />
          <span className="oui-sr-only">{trend > 0 ? '上升' : '下降'}</span>
        </>
      ) : null}
      {prefix !== undefined ? <span className="oui-number__affix">{prefix}</span> : null}
      <span className="oui-number__value">{text}</span>
      {suffix !== undefined ? <span className="oui-number__affix">{suffix}</span> : null}
      {children}
    </span>
  );
}
