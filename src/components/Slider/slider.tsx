'use client';

import {
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/use-controllable-state';
import { SpinnerGlyph } from '../_internal/spinner-glyph';
import './slider.css';

export type SliderTooltip = 'hover' | 'always' | 'never';

export interface SliderProps
  extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'defaultValue' | 'value'> {
  /** 受控值：单个数字或 [最小值, 最大值] */
  value?: number | [number, number];
  /** 非受控初始值 */
  defaultValue?: number | [number, number];
  /** 双滑块。给了数组 value 也会自动进入双滑块 */
  range?: boolean;
  /** 最小值，默认 0 */
  min?: number;
  /** 最大值，默认 100 */
  max?: number;
  /** 步长，默认 1 */
  step?: number;
  /** 刻度文案，键是数值 */
  marks?: Record<number, ReactNode>;
  /** 提示气泡：hover 悬停显示 / always 常显 / never 不显示 */
  tooltip?: SliderTooltip;
  /** 禁用：降透明、不可拖动、不可聚焦 */
  disabled?: boolean;
  /** 加载中：整体降透明、thumb 转圈、不可拖 */
  loading?: boolean;
  /** 拖动 / 键盘调整过程中触发 */
  onChange?: (value: number | [number, number]) => void;
  /** 一次拖拽结束（松手）时触发 */
  onChangeComplete?: (value: number | [number, number]) => void;
}

function clampNumber(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** 把外部值收敛成内部数组形态；range 时永远是升序的两个数 */
function normalize(value: number | [number, number], range: boolean, min: number, max: number): number[] {
  if (range) {
    const raw = Array.isArray(value) ? value : [min, value];
    const low = clampNumber(raw[0] ?? min, min, max);
    const high = clampNumber(raw[1] ?? max, min, max);
    return low <= high ? [low, high] : [high, low];
  }
  const single = Array.isArray(value) ? (value[0] ?? min) : value;
  return [clampNumber(single, min, max)];
}

function stepDecimals(step: number) {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

/**
 * 滑块。
 * 交互优先级：键盘 > 指针。两个 thumb 互相夹紧不会越过；
 * min === max 这种退化区间也不出 NaN（所有比例按 0 处理）。
 */
export function Slider({
  value,
  defaultValue,
  range,
  min = 0,
  max = 100,
  step = 1,
  marks,
  tooltip = 'hover',
  disabled = false,
  loading = false,
  onChange,
  onChangeComplete,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ref,
  ...rest
}: SliderProps) {
  const isRange = range ?? (value !== undefined ? Array.isArray(value) : Array.isArray(defaultValue));
  const safeStep = step > 0 ? step : 1;
  const decimals = stepDecimals(safeStep);

  const initial: number | [number, number] = defaultValue ?? (isRange ? [min, max] : min);

  const [values, setValues] = useControllableState<number[]>({
    value: value === undefined ? undefined : normalize(value, isRange, min, max),
    defaultValue: normalize(initial, isRange, min, max),
  });

  const railRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [dragging, setDragging] = useState<number | null>(null);

  const percentOf = (n: number) => (max <= min ? 0 : ((n - min) / (max - min)) * 100);

  const snap = (raw: number) => {
    if (!Number.isFinite(raw)) return min;
    const steps = Math.round((raw - min) / safeStep);
    return Number((min + steps * safeStep).toFixed(10));
  };

  const toExternal = (list: number[]): number | [number, number] =>
    isRange ? [list[0] ?? min, list[1] ?? max] : (list[0] ?? min);

  const formatValue = (n: number) => n.toFixed(decimals);

  /** 落值：先吸附到步长，再夹到区间与邻居内侧 —— 这一步保证两个 thumb 永不交叉 */
  const commit = (raw: number, index: number) => {
    if (disabled || loading) return;
    // 单滑块夹在 [min, max]；双滑块再各自夹在邻居内侧
    const lower = isRange ? (index === 0 ? min : (values[0] ?? min)) : min;
    const upper = isRange ? (index === 1 ? max : (values[1] ?? max)) : max;
    const bounded = clampNumber(snap(raw), lower, upper);
    if (bounded === values[index]) return;

    const next = [...values];
    next[index] = bounded;
    setValues(next);
    onChange?.(toExternal(next));
  };

  const clientXToValue = (clientX: number) => {
    const rail = railRef.current;
    if (!rail || max <= min) return min;
    const rect = rail.getBoundingClientRect();
    if (!rect.width) return min;
    const ratio = clampNumber((clientX - rect.left) / rect.width, 0, 1);
    return min + ratio * (max - min);
  };

  const nearestIndex = (target: number) => {
    if (!isRange) return 0;
    const low = values[0] ?? min;
    const high = values[1] ?? max;
    return Math.abs(target - low) <= Math.abs(target - high) ? 0 : 1;
  };

  const handleKeyDown = (index: number) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled || loading) return;
    const current = values[index] ?? min;
    const page = safeStep * 10;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + safeStep;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - safeStep;
        break;
      case 'PageUp':
        next = current + page;
        break;
      case 'PageDown':
        next = current - page;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(next, index);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || loading) return;
    const target = event.target as HTMLElement;
    const thumbEl = target.closest<HTMLElement>('[data-thumb-index]');
    const index = thumbEl ? Number(thumbEl.dataset.thumbIndex) : nearestIndex(clientXToValue(event.clientX));

    setDragging(index);
    thumbRefs.current[index]?.focus();

    const rail = railRef.current;
    if (rail && typeof rail.setPointerCapture === 'function') {
      try {
        rail.setPointerCapture(event.pointerId);
      } catch {
        // jsdom 等环境没有指针捕获实现，忽略即可，不影响测试与降级
      }
    }

    // 点在轨道上：把最近的 thumb 直接跳过去
    if (!thumbEl) commit(clientXToValue(event.clientX), index);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    commit(clientXToValue(event.clientX), dragging);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    const rail = railRef.current;
    if (rail && typeof rail.releasePointerCapture === 'function') {
      try {
        rail.releasePointerCapture(event.pointerId);
      } catch {
        // 同上
      }
    }
    setDragging(null);
    onChangeComplete?.(toExternal(values));
  };

  // 单值滑块从轨道左端填到 thumb；双值才从下限填到上限。
  // （两者都取 values[0] 时单值宽度恒为 0，填充段会整个消失）
  const startPercent = isRange ? percentOf(values[0] ?? min) : 0;
  const endPercent = percentOf(values[values.length - 1] ?? min);

  const data = {
    'data-range': isRange ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'data-tooltip': tooltip,
    'data-dragging': dragging !== null ? '' : undefined,
  } as const;

  const thumbName = (index: number) => {
    if (isRange) return index === 0 ? '最小值' : '最大值';
    return ariaLabel ?? (ariaLabelledBy ? undefined : '滑块');
  };

  return (
    <div {...rest} {...data} ref={ref} className={cx('oui-slider', className)}>
      <div
        className="oui-slider__rail"
        ref={railRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="oui-slider__track" aria-hidden="true" />
        <div
          className="oui-slider__fill"
          aria-hidden="true"
          style={{ left: `${startPercent}%`, width: `${Math.max(0, endPercent - startPercent)}%` }}
        />

        {values.map((current, index) => (
          <div
            key={index}
            ref={(node) => {
              thumbRefs.current[index] = node;
            }}
            className="oui-slider__thumb"
            data-thumb-index={index}
            data-dragging={dragging === index ? '' : undefined}
            role="slider"
            tabIndex={disabled || loading ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={current}
            aria-label={thumbName(index)}
            aria-labelledby={isRange ? undefined : ariaLabelledBy}
            aria-disabled={disabled || loading || undefined}
            onKeyDown={handleKeyDown(index)}
            style={{ left: `${percentOf(current)}%` }}
          >
            {tooltip === 'never' ? null : (
              <span className="oui-slider__tip" aria-hidden="true">
                {formatValue(current)}
              </span>
            )}
            {loading ? <SpinnerGlyph className="oui-slider__spin" /> : null}
          </div>
        ))}
      </div>

      {marks ? (
        <div className="oui-slider__marks">
          {Object.entries(marks).map(([key, label]) => {
            const markValue = Number(key);
            const active =
              Number.isFinite(markValue) &&
              markValue >= (values[0] ?? min) &&
              markValue <= (values[values.length - 1] ?? min);
            return (
              <div
                key={key}
                className="oui-slider__mark"
                data-active={active ? '' : undefined}
                style={{ left: `${percentOf(markValue)}%` }}
              >
                {label}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}