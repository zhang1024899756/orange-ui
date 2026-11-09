'use client';

import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import './link.css';

export type LinkColor = 'primary' | 'neutral' | 'danger';
export type LinkUnderline = 'hover' | 'always' | 'none';
export type LinkSize = 'xs' | 'sm' | 'md' | 'lg';

export interface LinkProps extends Omit<ComponentPropsWithRef<'a'>, 'color'> {
  /** 只在角色色里选：primary 走 primary-ink（白底 5.29:1），不用本色 3.04:1 */
  color?: LinkColor;
  /** 下划线行为，默认 hover */
  underline?: LinkUnderline;
  /** 外部链接：自动 target=_blank + rel + 右上箭头 */
  external?: boolean;
  /** 禁用：aria-disabled + 移出 tab 序 + 拦截点击 */
  disabled?: boolean;
  /** 字号档，默认 sm（14/22） */
  size?: LinkSize;
  /** 前置图标 */
  icon?: ReactNode;
  /** 链接文字 */
  children?: ReactNode;
}

export function Link({
  color = 'primary',
  underline = 'hover',
  external = false,
  disabled = false,
  size = 'sm',
  icon,
  href,
  target,
  rel,
  className,
  children,
  onClick,
  ref,
  ...rest
}: LinkProps) {
  // 只要声明了 external，无论调用方是否自己给了 target，都要补 noopener noreferrer：
  // 少了它，target=_blank 打开的页面能通过 window.opener 反向操作当前页（tabnabbing）。
  const isExternal = Boolean(external);

  // 外链必须带 noopener noreferrer；调用方自己写了 rel 就合并，不覆盖
  const mergedRel = [isExternal ? 'noopener noreferrer' : undefined, rel]
    .filter(Boolean)
    .join(' ');

  const classes = cx('oui-link', className);
  const data = {
    'data-color': color,
    'data-underline': underline,
    'data-size': size,
    'data-disabled': disabled ? '' : undefined,
    'data-external': external ? '' : undefined,
  } as const;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <a
      {...rest}
      {...data}
      ref={ref}
      className={classes}
      // 禁用时摘掉 href：键盘和脚本都跳不过去，而不是只靠 CSS 假装
      href={disabled ? undefined : href}
      target={target ?? (external ? '_blank' : undefined)}
      rel={mergedRel || undefined}
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : rest.tabIndex}
      onClick={handleClick}
    >
      {icon ? (
        <span className="oui-link__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="oui-link__label">{children}</span>
      {external ? (
        <>
          <Icon name="arrow-up-right" size={12} className="oui-link__external" />
          <span className="oui-sr-only">（在新窗口打开）</span>
        </>
      ) : null}
    </a>
  );
}
