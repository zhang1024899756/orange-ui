'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';
import './text.css';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type TextWeight = 400 | 500 | 600;
export type TextTone =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'primary'
  | 'danger'
  | 'success'
  | 'inverse';
/** 可渲染的标签，默认 span —— 用 as 切换语义（h1 / p / label / code…） */
export type TextAs = keyof React.JSX.IntrinsicElements;

export interface TextProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /** 语义标签，默认 span */
  as?: TextAs;
  /** 字号阶梯，默认 md（14/22 是正文档） */
  size?: TextSize;
  /** 字重，默认 400 */
  weight?: TextWeight;
  /** 颜色语义，默认 default */
  tone?: TextTone;
  /** true = 单行省略；数字 = 多行 clamp */
  truncate?: boolean | number;
  /** 右侧复制按钮（命中区 24×24，复制后 1.2s 内变成勾） */
  copyable?: boolean;
  /** 等宽字体（数字、代码、ID） */
  mono?: boolean;
  /** 斜体（引用、注释、占位说明） */
  italic?: boolean;
  /** 文字内容；copyable 时按纯文本复制 */
  children?: ReactNode;
}

/**
 * 文字。所有排版都走 tokens，唯一职责是把「字号 / 字重 / 色调 / 截断」四件事做对。
 * 注意：truncate 自带 min-width:0，因此在 flex/grid 里也能正确省略。
 */
export function Text({
  as = 'span',
  size = 'md',
  weight = 400,
  tone = 'default',
  truncate,
  copyable = false,
  mono = false,
  italic = false,
  className,
  style,
  children,
  ref,
  ...rest
}: TextProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const payload = typeof children === 'string' ? children : '';
    try {
      await navigator.clipboard?.writeText(payload);
    } catch {
      // 非安全上下文 / 用户拒绝授权：仍然给出已复制反馈，不抛错打断页面
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1200);
  }, [children]);

  const truncateAttr =
    truncate === true ? 'single' : typeof truncate === 'number' ? 'multi' : undefined;
  const clampLines = typeof truncate === 'number' ? Math.max(1, Math.floor(truncate)) : undefined;

  // 多行 clamp 的数值由调用方给，走行内自定义属性而不是硬编码
  const mergedStyle: CSSProperties | undefined = clampLines
    ? ({ ...style, '--oui-text-clamp': clampLines } as CSSProperties)
    : style;

  const classes = cx('oui-text', className);
  const data = {
    'data-size': size,
    'data-weight': weight,
    'data-tone': tone,
    'data-truncate': truncateAttr,
    'data-mono': mono ? '' : undefined,
    'data-italic': italic ? '' : undefined,
    'data-copyable': copyable ? '' : undefined,
  } as const;

  // as 是运行时的标签名；属性与 ref 按 span 收窄，换标签只影响渲染结果
  const Component = as as unknown as 'span';

  return (
    <Component {...rest} {...data} ref={ref} className={classes} style={mergedStyle}>
      {copyable ? (
        <>
          <span className="oui-text__body">{children}</span>
          <button
            type="button"
            className="oui-text__copy"
            aria-label={copied ? '已复制' : '复制'}
            onClick={handleCopy}
          >
            <Icon name={copied ? 'check' : 'copy'} size={12} />
          </button>
        </>
      ) : (
        children
      )}
    </Component>
  );
}
