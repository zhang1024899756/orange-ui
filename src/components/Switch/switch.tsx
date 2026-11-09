'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/use-controllable-state';
import { SpinnerGlyph } from '../_internal/spinner-glyph';
import './switch.css';

export type SwitchSize = 'sm' | 'md';
export type SwitchColor = 'primary' | 'success';

export interface SwitchProps
  extends Omit<ComponentPropsWithRef<'button'>, 'onChange' | 'color' | 'type' | 'children'> {
  /** 受控选中状态 */
  checked?: boolean;
  /** 非受控初始值 */
  defaultChecked?: boolean;
  /** 状态变化回调。受控模式下只回调，不改内部状态 */
  onChange?: (checked: boolean) => void;
  /** sm 32×18 / md 40×22，默认 md */
  size?: SwitchSize;
  /** 加载中：thumb 换成转圈、保持原位置、点不动、aria-busy */
  loading?: boolean;
  /** 打开时显示在开关右侧的文案 */
  checkedChildren?: ReactNode;
  /** 关闭时显示在开关右侧的文案 */
  unCheckedChildren?: ReactNode;
  /** 打开时的轨道颜色，默认 primary */
  color?: SwitchColor;
}

/**
 * 开关。
 * 语义是真正的 <button role="switch" aria-checked>，空格 / 回车由浏览器原生按钮行为触发展开，
 * 不需要额外键盘处理，也就不会出现「按一次跳两下」的双触发。
 */
export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onChange,
  size = 'md',
  loading = false,
  checkedChildren,
  unCheckedChildren,
  color = 'primary',
  disabled = false,
  className,
  onClick,
  ref,
  ...rest
}: SwitchProps) {
  const [checked, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange,
  });

  const hasLabel = checkedChildren !== undefined || unCheckedChildren !== undefined;
  const locked = disabled || loading;

  // 只给了一侧文案时，另一侧状态的可见文字是空的，可访问名称会跟着消失。
  // 这时把那一侧的文案提成 aria-label，让名称在两个状态下都稳定。
  const textOf = (node: ReactNode) =>
    typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;
  const oneSided = (checkedChildren === undefined) !== (unCheckedChildren === undefined);
  const hasAriaName =
    rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined;
  const fallbackName = oneSided && !hasAriaName ? textOf(checkedChildren ?? unCheckedChildren) : undefined;

  const data = {
    'data-size': size,
    'data-color': color,
    'data-checked': checked ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'data-with-label': hasLabel ? '' : undefined,
  } as const;

  return (
    <button
      {...rest}
      {...data}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={fallbackName ?? (rest['aria-label'] as string | undefined)}
      aria-busy={loading || undefined}
      disabled={locked}
      className={cx('oui-switch', className)}
      onClick={(event) => {
        if (locked) {
          event.preventDefault();
          return;
        }
        setChecked(!checked);
        onClick?.(event);
      }}
    >
      <span className="oui-switch__track" aria-hidden="true">
        <span className="oui-switch__thumb">
          {loading ? <SpinnerGlyph className="oui-switch__spin" /> : null}
        </span>
      </span>
      {hasLabel ? (
        <span className="oui-switch__label">{checked ? checkedChildren : unCheckedChildren}</span>
      ) : null}
    </button>
  );
}
