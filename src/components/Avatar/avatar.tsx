'use client';

import { useEffect, useState, type CSSProperties, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import './avatar.css';

export type AvatarSize = number | 'xs' | 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** 图片地址；加载失败自动回退到首字母 */
  src?: string;
  /** 图片的替代文本，缺省时用 name */
  alt?: string;
  /** 名字：用于取首字母回退，并参与回退底色的哈希 */
  name?: string;
  /** 尺寸：xs 24 / sm 28 / md 32 / lg 40，或直接给数字（px） */
  size?: AvatarSize;
  /** 形状：circle 圆形（默认）/ square 方形（6px 圆角） */
  shape?: AvatarShape;
  /** 右下角状态点 */
  status?: AvatarStatus;
  /** 自定义回退内容，优先于首字母 */
  fallback?: ReactNode;
}

/** 回退底色只有 6 档，靠名字哈希稳定落位：同一个人每次都是同一个颜色 */
const TONE_COUNT = 6;

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: '在线',
  away: '离开',
  busy: '忙碌',
  offline: '离线',
};

/** 取首字母：多词取首尾首字母，单词取第一个字符（中文即首字） */
function getInitials(name?: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts[parts.length - 1]?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  }

  const chars = Array.from(trimmed);
  return (chars[0] ?? '').toUpperCase();
}

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100000;
  }
  return hash;
}

/** 头像。图片失败自动回退到首字母 + 固定装饰底色。 */
export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  fallback,
  className,
  style,
  onError,
  ref,
  ...rest
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  // 换了图片地址就重新尝试加载
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = src !== undefined && src !== '' && !failed;
  const initials = getInitials(name);
  const label = alt ?? name ?? '';
  const tone = name ? hashName(name) % TONE_COUNT : 0;

  const styleWithSize = (
    typeof size === 'number' ? { ...style, '--oui-avatar-size': `${size}px` } : style
  ) as CSSProperties;

  return (
    <span
      {...rest}
      ref={ref}
      className={cx('oui-avatar', className)}
      data-size={typeof size === 'number' ? 'custom' : size}
      data-shape={shape}
      data-tone={tone}
      data-status={status}
      style={styleWithSize}
    >
      {showImage ? (
        <img
          className="oui-avatar__img"
          src={src}
          alt={label}
          draggable={false}
          onError={(event) => {
            setFailed(true);
            onError?.(event);
          }}
        />
      ) : fallback !== undefined ? (
        <span className="oui-avatar__fallback">{fallback}</span>
      ) : initials ? (
        <>
          <span className="oui-avatar__initials" aria-hidden="true">
            {initials}
          </span>
          <span className="oui-sr-only">{label || initials}</span>
        </>
      ) : (
        <>
          <Icon name="user" className="oui-avatar__icon" />
          <span className="oui-sr-only">{label || '头像'}</span>
        </>
      )}

      {status ? (
        <>
          <span className="oui-avatar__status" aria-hidden="true" />
          <span className="oui-sr-only">{STATUS_LABEL[status]}</span>
        </>
      ) : null}
    </span>
  );
}
