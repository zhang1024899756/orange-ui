'use client';

import { useEffect, useState, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/use-controllable-state';
import { Icon } from '../Icon';
import './image.css';

export type ImageRatio = '1:1' | '4:3' | '16:9' | '3:4' | 'auto';
export type ImageFit = 'cover' | 'contain';
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ImageProps
  extends Omit<
    ComponentPropsWithRef<'img'>,
    'src' | 'alt' | 'loading' | 'onLoad' | 'onError' | 'width' | 'height'
  > {
  /** 图片地址，必填 */
  src: string;
  /** 必填：刻意不提供缺省，强制调用方为每张图写清楚（无障碍红线） */
  alt: string;
  /** 固定比例容器，默认 16:9；auto 表示跟随图片自身比例 */
  ratio?: ImageRatio;
  /** 填充方式：cover 裁切填满 / contain 完整显示，默认 cover */
  fit?: ImageFit;
  /** 圆角档，默认 md */
  radius?: ImageRadius;
  /** 加载失败时替换默认占位 */
  fallback?: ReactNode;
  /** 原生 loading=lazy 懒加载，默认 true */
  lazy?: boolean;
  /** 受控骨架态：给了就以它为准，图片事件不再改状态 */
  loading?: boolean;
  /** 受控骨架态变化回调 */
  onLoadingChange?: (loading: boolean) => void;
  /** 加载完成回调（内部先结束骨架，再调用它） */
  onLoad?: ComponentPropsWithRef<'img'>['onLoad'];
  /** 加载失败回调（内部先切到失败态，再调用它） */
  onError?: ComponentPropsWithRef<'img'>['onError'];
}

/**
 * 图片。三态：加载中（骨架、占位不塌陷）/ 成功 / 失败（灰底 + 图标 + 文案）。
 * 容器用 aspect-ratio 先占位，所以无论图片多大、加载多久，布局都不会跳。
 */
export function Image({
  src,
  alt,
  ratio = '16:9',
  fit = 'cover',
  radius = 'md',
  fallback,
  lazy = true,
  loading,
  onLoadingChange,
  onLoad,
  onError,
  className,
  style,
  ref,
  ...rest
}: ImageProps) {
  const [isLoading, setIsLoading] = useControllableState<boolean>({
    value: loading,
    defaultValue: true,
    onChange: onLoadingChange,
  });
  const [failed, setFailed] = useState(false);

  // 换图就回到骨架态（受控时只回调，不动内部状态）
  useEffect(() => {
    setFailed(false);
    if (loading === undefined) setIsLoading(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const status = failed ? 'error' : isLoading ? 'loading' : 'loaded';

  const classes = cx('oui-image', className);
  const data = {
    'data-ratio': ratio,
    'data-fit': fit,
    'data-radius': radius,
    'data-status': status,
  } as const;

  return (
    <div {...data} className={classes} style={style as CSSProperties} aria-busy={isLoading || undefined}>
      <img
        {...rest}
        ref={ref}
        className="oui-image__img"
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={(event) => {
          setFailed(false);
          setIsLoading(false);
          onLoad?.(event);
        }}
        onError={(event) => {
          setFailed(true);
          setIsLoading(false);
          onError?.(event);
        }}
      />

      {isLoading ? <span className="oui-image__skeleton" aria-hidden="true" /> : null}

      {status === 'error' ? (
        fallback ?? (
          <span className="oui-image__error">
            <Icon name="image" size={20} />
            <span className="oui-image__error-text">加载失败</span>
          </span>
        )
      ) : null}
    </div>
  );
}
