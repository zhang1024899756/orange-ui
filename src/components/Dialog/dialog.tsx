'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../utils/cx';
import { splitAriaProps } from '../../utils/split-aria';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Portal } from '../_internal/portal';
import './dialog.css';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'onChange'> {
  /** 是否打开（受控） */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 标题，同时作为对话框的无障碍名称 */
  title?: ReactNode;
  /** 副标题 / 说明文字，会自动关联 aria-describedby */
  description?: ReactNode;
  /** 自定义底部；传 false 表示不渲染「确定 / 取消」，只留右上角关闭 */
  footer?: ReactNode | false;
  /** 宽度：360 / 480 / 640，默认 md */
  size?: DialogSize;
  /** 内容加载中：标题保留，内容区换骨架条，确定按钮转 loading */
  loading?: boolean;
  /** 提交中：确定按钮转 loading，并屏蔽遮罩 / ESC 关闭 */
  confirmLoading?: boolean;
  /** 点确定时触发；对话框不会自动关闭，什么时候关由你决定 */
  onConfirm?: () => void;
  /** 点取消 / 右上角关闭 / 遮罩 / ESC 时触发 */
  onCancel?: () => void;
  /** 确定按钮文案 */
  confirmText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 是否显示右上角关闭按钮 */
  closable?: boolean;
  /** 点遮罩是否关闭 */
  maskClosable?: boolean;
  /** ESC 是否关闭 */
  closeOnEsc?: boolean;
  /** 内容区；loading 时被三条骨架替换 */
  children?: ReactNode;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** 面板内可聚焦元素（不做布局可见性判断：jsdom 里没有布局，会把所有元素都判成不可见） */
function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getAttribute('aria-hidden') !== 'true' && !el.hasAttribute('hidden'),
  );
}

function assignRef<T>(target: Ref<T> | undefined, node: T | null) {
  if (typeof target === 'function') {
    target(node);
    return;
  }
  if (target) {
    (target as { current: T | null }).current = node;
  }
}

/** 内容区骨架：自己画条，不引 Skeleton 组件（那是别人的目录） */
function DialogSkeleton() {
  return (
    <div className="oui-dialog__skeleton" aria-hidden="true">
      <div className="oui-dialog__bar" />
      <div className="oui-dialog__bar" />
      <div className="oui-dialog__bar" />
    </div>
  );
}

/**
 * 对话框。
 * 焦点陷阱自己实现：打开时焦点进面板第一个可聚焦元素，Tab / Shift+Tab 在面板内循环，
 * 关闭时把焦点还给打开前的元素；confirmLoading 期间屏蔽遮罩与 ESC，避免请求中途被动关闭。
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = 'md',
  loading = false,
  confirmLoading = false,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  closable = true,
  maskClosable = true,
  closeOnEsc = true,
  className,
  children,
  ref,
  ...rest
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // 外部 ref 每次渲染同步，避免把它放进 ref 回调的依赖里导致反复抢焦点
  const externalRef = useRef(ref);
  externalRef.current = ref;

  const setPanelNode = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    assignRef(externalRef.current, node);
    if (!node) return;

    // 打开：记住焦点来源，再把焦点送进面板
    const previous = document.activeElement as HTMLElement | null;
    if (!previous || node.contains(previous)) return;
    previousFocusRef.current = previous;
    const target = getFocusable(node)[0] ?? node;
    target.focus();
  }, []);

  // 关闭 / 卸载：焦点还给打开前的元素，并解锁页面滚动
  useEffect(() => {
    if (!open) return undefined;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
      const previous = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [open]);

  if (!open) return null;

  /** 明确的用户动作（点关闭 / 点取消）—— 提交中也允许 */
  const close = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  /** 意外动作（点遮罩 / ESC）—— 提交中屏蔽 */
  const dismiss = () => {
    if (confirmLoading) return;
    close();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (!closeOnEsc || confirmLoading) return;
      event.stopPropagation();
      dismiss();
      return;
    }
    if (event.key !== 'Tab') return;

    const list = getFocusable(panelRef.current);
    if (list.length === 0) {
      event.preventDefault();
      panelRef.current?.focus();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    if (!first || !last) return;

    const active = document.activeElement;
    const inside = panelRef.current?.contains(active) ?? false;

    if (!event.shiftKey && (!inside || active === last)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && (!inside || active === first)) {
      event.preventDefault();
      last.focus();
    }
  };

  const hasHeader = title !== undefined || description !== undefined;
  const busy = loading || confirmLoading;
  // aria-* 必须落在带 role="dialog" 的 panel 上，落在最外层容器上读屏读不到
  const { aria, rest: outerRest } = splitAriaProps(rest);

  return (
    <Portal>
      <div
        {...outerRest}
        className={cx('oui-dialog', className)}
        data-size={size}
        data-has-header={hasHeader ? '' : undefined}
        data-loading={loading ? '' : undefined}
      >
        <div
          className="oui-dialog__mask"
          onClick={() => {
            if (!maskClosable) return;
            dismiss();
          }}
        />

        <div
          {...aria}
          className="oui-dialog__panel"
          ref={setPanelNode}
          role="dialog"
          aria-modal="true"
          aria-labelledby={
            (aria['aria-labelledby'] as string | undefined) ??
            (title !== undefined ? titleId : undefined)
          }
          aria-describedby={
            (aria['aria-describedby'] as string | undefined) ??
            (description !== undefined ? descriptionId : undefined)
          }
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {closable ? (
            <button type="button" className="oui-dialog__close" aria-label="关闭" onClick={close}>
              <Icon name="close" size={16} />
            </button>
          ) : null}

          {hasHeader ? (
            <header className="oui-dialog__header">
              {title !== undefined ? (
                <h2 className="oui-dialog__title" id={titleId}>
                  {title}
                </h2>
              ) : null}
              {description !== undefined ? (
                <p className="oui-dialog__description" id={descriptionId}>
                  {description}
                </p>
              ) : null}
            </header>
          ) : null}

          <div className="oui-dialog__body" aria-busy={loading || undefined}>
            {loading ? <DialogSkeleton /> : children}
          </div>

          {footer === false ? null : footer !== undefined ? (
            <footer className="oui-dialog__footer">{footer}</footer>
          ) : (
            <footer className="oui-dialog__footer">
              <Button variant="outlined" color="neutral" onClick={close}>
                {cancelText}
              </Button>
              {/* loadingText 传 confirmText：加载时保留原文字，无障碍名称不会从「确定」变成「加载中」 */}
              <Button onClick={onConfirm} loading={busy} loadingText={confirmText}>
                {confirmText}
              </Button>
            </footer>
          )}
        </div>
      </div>
    </Portal>
  );
}