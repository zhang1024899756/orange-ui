'use client';

import type { ComponentPropsWithRef, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './card.css';

export type CardVariant = 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends ComponentPropsWithRef<'div'> {
  /** 描边（默认，静态零阴影）或带阴影的浮起卡片 */
  variant?: CardVariant;
  /** 内边距档位，默认 md */
  padding?: CardPadding;
  /** 悬停时上浮 2px、边框变强 */
  hoverable?: boolean;
  /** 顶部封面，自动裁切圆角 */
  cover?: ReactNode;
  /** 头部区域，自带下分隔线 */
  header?: ReactNode;
  /** 底部区域，自带背景色与上分隔线 */
  footer?: ReactNode;
  /** 整卡骨架：屏蔽内容并显示占位块 */
  loading?: boolean;
  /** 卡片主体内容 */
  children?: ReactNode;
}

/**
 * 卡片。传了 onClick 才变成可点击容器（role=button + 键盘可达），
 * 此时内部不要再放按钮/链接等可交互元素，避免语义嵌套。
 */
export function Card({
  variant = 'outlined',
  padding = 'md',
  hoverable = false,
  cover,
  header,
  footer,
  loading = false,
  className,
  children,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: CardProps) {
  // loading 期间整卡不可交互
  const clickable = onClick !== undefined && !loading;

  const data = {
    'data-variant': variant,
    'data-padding': padding,
    'data-hoverable': hoverable ? '' : undefined,
    'data-clickable': clickable ? '' : undefined,
    'data-loading': loading ? '' : undefined,
  } as const;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!clickable || event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ') {
      // 空格默认会滚动页面，必须拦下
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  if (loading) {
    return (
      <div {...rest} {...data} ref={ref} className={cx('oui-card', className)} aria-busy="true">
        {cover !== undefined ? <div className="oui-card__placeholder-cover" aria-hidden="true" /> : null}
        <div className="oui-card__placeholder-body" aria-hidden="true">
          <span className="oui-card__placeholder-line" data-lead="" />
          <span className="oui-card__placeholder-line" />
          <span className="oui-card__placeholder-line" />
        </div>
      </div>
    );
  }

  return (
    <div
      {...rest}
      {...data}
      ref={ref}
      className={cx('oui-card', className)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
    >
      {cover !== undefined ? <div className="oui-card__cover">{cover}</div> : null}
      {header !== undefined ? <div className="oui-card__header">{header}</div> : null}
      {children !== undefined ? <div className="oui-card__body">{children}</div> : null}
      {footer !== undefined ? <div className="oui-card__footer">{footer}</div> : null}
    </div>
  );
}
