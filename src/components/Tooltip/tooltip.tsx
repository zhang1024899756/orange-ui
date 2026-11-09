'use client';

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/use-controllable-state';
import { Portal } from '../_internal/portal';
import { SpinnerGlyph } from '../_internal/spinner-glyph';
import './tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** 提示内容 */
  content: ReactNode;
  /** 方位，v1 只做四向，不做自动翻转 */
  placement?: TooltipPlacement;
  /** 鼠标进入后的延迟（ms），默认 120；键盘聚焦不延迟 */
  delay?: number;
  /** 禁用后不显示，也不改触发元素 */
  disabled?: boolean;
  /** 是否显示小箭头，默认 true */
  arrow?: boolean;
  /** 必须是单个可接收 ref 的元素 */
  children: ReactElement;
  /** 受控的显示状态 */
  open?: boolean;
  /** 非受控时的初始显示状态 */
  defaultOpen?: boolean;
  /** 显示状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 内容还在异步取时显示加载态 */
  loading?: boolean;
  /** 覆写提示框的类名 */
  className?: string;
  /** 覆写浮层的内联样式 */
  style?: CSSProperties;
}

interface Point {
  top: number;
  left: number;
}

/** 触发元素上由 Tooltip 接管的事件与属性 */
interface TriggerProps {
  ref?: Ref<unknown>;
  onMouseEnter?: (event: ReactMouseEvent) => void;
  onMouseLeave?: (event: ReactMouseEvent) => void;
  onFocus?: (event: ReactFocusEvent) => void;
  onBlur?: (event: ReactFocusEvent) => void;
  onKeyDown?: (event: ReactKeyboardEvent) => void;
  'aria-describedby'?: string;
}

/**
 * 文字提示。
 * 浮层挂在 body 上、用 fixed + getBoundingClientRect 定位，所以不会被父级 overflow 裁掉。
 * 滚动与窗口尺寸变化时直接关闭（不做跟随），避免位置漂移导致的「错位提示」。
 */
export function Tooltip({
  content,
  placement = 'top',
  delay = 120,
  disabled = false,
  arrow = true,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  loading = false,
  className,
  style,
}: TooltipProps) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [point, setPoint] = useState<Point | null>(null);

  const hasContent = content !== undefined && content !== null;

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // 卸载时清掉待触发的延迟
  useEffect(() => clearTimer, [clearTimer]);

  const show = useCallback(() => {
    if (disabled || !hasContent) return;
    clearTimer();
    if (delay <= 0) {
      setOpen(true);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      setOpen(true);
    }, delay);
  }, [clearTimer, delay, disabled, hasContent, setOpen]);

  const showNow = useCallback(() => {
    if (disabled || !hasContent) return;
    clearTimer();
    setOpen(true);
  }, [clearTimer, disabled, hasContent, setOpen]);

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer, setOpen]);

  // 打开后量一次位置；transform 交给 CSS，箭头偏移也由 CSS 决定
  useEffect(() => {
    if (!open) {
      setPoint(null);
      return;
    }
    const node = triggerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setPoint({
      top:
        placement === 'top'
          ? rect.top
          : placement === 'bottom'
            ? rect.bottom
            : rect.top + rect.height / 2,
      left:
        placement === 'left'
          ? rect.left
          : placement === 'right'
            ? rect.right
            : rect.left + rect.width / 2,
    });
  }, [open, placement]);

  // 滚动 / 窗口变化时关闭（捕获阶段，容器内滚动也能收到）
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open, setOpen]);

  // 关闭后把 trigger 上的 aria-describedby 还原，避免指向不存在的节点
  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = (child.props ?? {}) as TriggerProps;

  // 子元素自己的 ref 要一起保住：渲染期存一份最新的，回调 ref 保持稳定
  const externalRef = useRef(childProps.ref);
  externalRef.current = childProps.ref;

  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
    const external = externalRef.current;
    if (typeof external === 'function') external(node);
    else if (external && typeof external === 'object') {
      (external as { current: HTMLElement | null }).current = node;
    }
  }, []);

  if (disabled) return children;

  const describedBy = childProps['aria-describedby'];
  const openProps = open
    ? { 'aria-describedby': describedBy ? `${describedBy} ${tooltipId}` : tooltipId }
    : {};

  const trigger = cloneElement(child, {
    ref: setTriggerRef,
    onMouseEnter: (event: ReactMouseEvent) => {
      childProps.onMouseEnter?.(event);
      show();
    },
    onMouseLeave: (event: ReactMouseEvent) => {
      childProps.onMouseLeave?.(event);
      hide();
    },
    onFocus: (event: ReactFocusEvent) => {
      childProps.onFocus?.(event);
      showNow();
    },
    onBlur: (event: ReactFocusEvent) => {
      childProps.onBlur?.(event);
      hide();
    },
    onKeyDown: (event: ReactKeyboardEvent) => {
      childProps.onKeyDown?.(event);
      if (event.key === 'Escape') hide();
    },
    ...openProps,
  } as Record<string, unknown>);

  return (
    <>
      {trigger}
      {open && point ? (
        <Portal>
          <div
            className={cx('oui-tooltip', className)}
            style={{ ...style, top: point.top, left: point.left }}
            data-placement={placement}
            data-arrow={arrow ? '' : undefined}
            role="tooltip"
            id={tooltipId}
            aria-busy={loading || undefined}
          >
            {loading ? (
              <span className="oui-tooltip__loading">
                <SpinnerGlyph size={12} />
                加载中…
              </span>
            ) : (
              content
            )}
            {arrow ? <span className="oui-tooltip__arrow" aria-hidden="true" /> : null}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
