'use client';

import { Children, type CSSProperties, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { AvatarShape, AvatarSize } from './avatar';
import './avatar.css';

export interface AvatarGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 头像列表，通常是若干个 <Avatar /> */
  children?: ReactNode;
  /** 最多显示几个，超出折叠成 +N，默认 4 */
  max?: number;
  /** 统一尺寸（会覆盖子头像自己的 size） */
  size?: AvatarSize;
  /** 统一形状 */
  shape?: AvatarShape;
  /** 成员总数；缺省时按 children 数量推断 */
  total?: number;
  /** 自定义读屏说明，缺省为「共 N 位成员」 */
  label?: string;
}

/** 头像组。视觉上叠放，语义上是一个 group，由 aria-label 说明总人数。 */
export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  shape = 'circle',
  total,
  label,
  className,
  style,
  ref,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children);
  const limit = Math.max(1, Math.floor(max));
  const count = total ?? items.length;
  const visible = items.slice(0, limit);
  const hidden = Math.max(0, count - visible.length);

  const styleWithSize = (
    typeof size === 'number' ? { ...style, '--oui-avatar-group-size': `${size}px` } : style
  ) as CSSProperties;

  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={label ?? `共 ${count} 位成员`}
      className={cx('oui-avatar-group', className)}
      data-size={typeof size === 'number' ? 'custom' : size}
      style={styleWithSize}
    >
      {visible}
      {hidden > 0 ? (
        <span
          className="oui-avatar oui-avatar-group__more"
          data-shape={shape}
          data-tone="5"
          aria-hidden="true"
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  );
}
