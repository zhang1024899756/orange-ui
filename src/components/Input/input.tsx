'use client';

import { useRef, type ComponentPropsWithRef, type ReactNode, type Ref } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/use-controllable-state';
import { Icon } from '../Icon';
import { SpinnerGlyph } from '../_internal/spinner-glyph';
import './input.css';

export type InputSize = 'xs' | 'sm' | 'md' | 'lg';
export type InputStatus = 'default' | 'error';
export type InputType = 'text' | 'password' | 'search';

export interface InputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'size' | 'prefix' | 'type'> {
  /** 尺寸：24 / 28 / 32 / 40，默认 md */
  size?: InputSize;
  /** 校验状态：default 常态，error 描边转危险色 */
  status?: InputStatus;
  /** 前置内容（图标、货币符号等） */
  prefix?: ReactNode;
  /** 后置内容（单位、图标等） */
  suffix?: ReactNode;
  /** 有值时显示清除按钮 */
  clearable?: boolean;
  /** 加载中：右侧转圈、readOnly、不清空、aria-busy */
  loading?: boolean;
  /** 右下角显示 n/m 字数统计，配合 maxLength 使用 */
  showCount?: boolean;
  /** 输入类型，search 时用胶囊圆角 */
  type?: InputType;
  /** 点击清除按钮时触发。受控模式下本组件不会改值，请在这里自行更新 value */
  onClear?: () => void;
}

/** 把 ref（函数 / 对象 / 空）统一挂到内部 input 上，React 19 不需要 forwardRef */
function assignRef<T>(target: Ref<T> | undefined, node: T | null) {
  if (typeof target === 'function') {
    target(node);
    return;
  }
  if (target) {
    (target as { current: T | null }).current = node;
  }
}

/**
 * 输入框。
 * 外层 .oui-input 只负责视觉（底色 / 描边 / 圆角），内层是真正的 <input>；
 * 原生属性（id、name、form、aria-*）全部透传到 input，标签关联不会失效。
 */
export function Input({
  size = 'md',
  status = 'default',
  prefix,
  suffix,
  clearable = false,
  loading = false,
  showCount = false,
  type = 'text',
  className,
  style,
  value: valueProp,
  defaultValue,
  readOnly,
  disabled = false,
  onClear,
  ref,
  ...rest
}: InputProps) {
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const controlled = valueProp !== undefined;

  // 受控 / 非受控统一：受控只回调不改内部状态（onChange 由调用方传入原生事件回调）
  const [current, setCurrent] = useControllableState<string>({
    value: controlled ? String(valueProp) : undefined,
    defaultValue: defaultValue === undefined ? '' : String(defaultValue),
  });

  const hasValue = current.length > 0;
  const showClear = clearable && hasValue && !disabled && !loading;

  const data = {
    'data-size': size,
    'data-status': status,
    'data-search': type === 'search' ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'data-clearable': clearable ? '' : undefined,
  } as const;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 非受控时同步内部镜像，用来驱动清除按钮与字数统计
    setCurrent(event.target.value);
    rest.onChange?.(event);
  };

  const handleClear = () => {
    if (!controlled) {
      setCurrent('');
      // 非受控输入由 DOM 自己持值，必须手动清掉，否则视觉上不会消失
      if (fieldRef.current) fieldRef.current.value = '';
    }
    onClear?.();
    fieldRef.current?.focus();
  };

  return (
    <div className={cx('oui-input', className)} style={style} {...data}>
      {prefix !== undefined ? <span className="oui-input__prefix">{prefix}</span> : null}

      <input
        {...rest}
        ref={(node) => {
          fieldRef.current = node;
          assignRef(ref, node);
        }}
        className="oui-input__field"
        type={type}
        value={valueProp}
        defaultValue={defaultValue}
        onChange={handleChange}
        readOnly={readOnly || loading}
        disabled={disabled}
        aria-busy={loading || undefined}
        aria-invalid={status === 'error' || undefined}
      />

      {suffix !== undefined ? <span className="oui-input__suffix">{suffix}</span> : null}

      {loading ? (
        <span className="oui-input__spin" aria-hidden="true">
          <SpinnerGlyph />
        </span>
      ) : null}

      {showClear ? (
        <button
          type="button"
          className="oui-input__clear"
          aria-label="清除"
          // 防止点击清除时输入框先失焦、焦点跳走
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClear}
        >
          <Icon name="close" size={12} />
        </button>
      ) : null}

      {showCount ? (
        <span className="oui-input__count" data-testid="oui-input-count">
          {current.length}
          {rest.maxLength !== undefined ? `/${rest.maxLength}` : null}
        </span>
      ) : null}
    </div>
  );
}