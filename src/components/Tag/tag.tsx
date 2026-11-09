'use client';

import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import './tag.css';

export type TagColor =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'cyan'
  | 'teal'
  | 'amber'
  | 'magenta';

export interface TagProps extends Omit<ComponentPropsWithRef<'span'>, 'color' | 'onClick'> {
  /** 三种形态，默认 subtle（社区站使用最多的形态） */
  variant?: 'subtle' | 'outlined' | 'solid';
  /** 角色色或装饰色，默认 neutral */
  color?: TagColor;
  /** 两档高度：sm 20 / md 24，默认 sm */
  size?: 'sm' | 'md';
  /** 16px 彩色图标 —— 「活泼」只允许出现在这里 */
  icon?: ReactNode;
  /** 可选中（chip），选中后带勾 */
  selected?: boolean;
  /** 右侧显示关闭按钮（12px 图标，命中区 24×24） */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 有 onClick 才渲染成按钮，自动获得键盘可达性 */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** 禁用：不响应点击与关闭，保持原语义色 */
  disabled?: boolean;
  /** 标签文字 */
  children?: ReactNode;
}

export function Tag({
  variant = 'subtle',
  color = 'neutral',
  size = 'sm',
  icon,
  selected = false,
  closable = false,
  onClose,
  onClick,
  disabled = false,
  className,
  children,
  ref,
  ...rest
}: TagProps) {
  const interactive = onClick !== undefined && !disabled;

  const classes = cx('oui-tag', className);
  const data = {
    'data-variant': variant,
    'data-color': color,
    'data-size': size,
    'data-selected': selected ? '' : undefined,
    'data-interactive': interactive ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
  } as const;

  const inner = (
    <>
      {selected ? <Icon name="check" size={12} className="oui-tag__check" /> : icon ? (
        <span className="oui-tag__icon">{icon}</span>
      ) : null}
      <span className="oui-tag__label">{children}</span>
      {closable ? (
        <button
          type="button"
          className="oui-tag__close"
          aria-label={`移除 ${typeof children === 'string' ? children : ''}`.trim()}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onClose?.();
          }}
        >
          <Icon name="close" size={12} />
        </button>
      ) : null}
    </>
  );

  if (!interactive) {
    return (
      <span {...rest} {...data} ref={ref} className={classes}>
        {inner}
      </span>
    );
  }

  // 可点选 + 可关闭时，容器不能用 <button>：关闭按钮本身就是 <button>，
  // 嵌套交互元素在 HTML 里是非法结构（React 19 会在水合时报错）。
  // 此时退化成 role="button" 的 span，键盘行为由 onKeyDown 补齐。
  if (closable) {
    return (
      <span
        {...(rest as ComponentPropsWithRef<'span'>)}
        {...data}
        ref={ref as unknown as ComponentPropsWithRef<'span'>['ref']}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-pressed={selected}
        className={classes}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onClick?.(event as unknown as React.MouseEvent<HTMLElement>);
        }}
      >
        {inner}
      </span>
    );
  }

  return (
    <button
      {...(rest as ComponentPropsWithRef<'button'>)}
      {...data}
      ref={ref as unknown as ComponentPropsWithRef<'button'>['ref']}
      type="button"
      className={classes}
      aria-pressed={selected}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}
