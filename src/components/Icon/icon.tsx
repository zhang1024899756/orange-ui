'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './icon.css';

type Node =
  | ['path', string]
  | ['circle', number, number, number]
  | ['rect', number, number, number, number, number?];

/** 内置图标集：24×24 viewBox，统一 stroke 1.75、圆头圆角，全部跟随 currentColor */
const ICONS = {
  search: [['circle', 11, 11, 6.5], ['path', 'M16 16 L20.5 20.5']],
  close: [['path', 'M6 6 L18 18 M18 6 L6 18']],
  check: [['path', 'M5 12.5 L10 17.5 L19 7']],
  plus: [['path', 'M12 5 V19 M5 12 H19']],
  minus: [['path', 'M5 12 H19']],
  'chevron-down': [['path', 'M6 9.5 L12 15.5 L18 9.5']],
  'chevron-right': [['path', 'M9.5 6 L15.5 12 L9.5 18']],
  'chevron-left': [['path', 'M14.5 6 L8.5 12 L14.5 18']],
  'chevron-up': [['path', 'M6 14.5 L12 8.5 L18 14.5']],
  'arrow-right': [['path', 'M5 12 H19 M13 6 L19 12 L13 18']],
  'arrow-up-right': [['path', 'M7 17 L17 7 M9.5 7 H17 V14.5']],
  'arrow-left': [['path', 'M19 12 H5 M11 6 L5 12 L11 18']],
  heart: [['path', 'M12 20 C12 20 4 15 4 9.5 C4 6.5 6.3 4.5 9 4.5 C10.5 4.5 11.5 5.2 12 6 C12.5 5.2 13.5 4.5 15 4.5 C17.7 4.5 20 6.5 20 9.5 C20 15 12 20 12 20 Z']],
  star: [['path', 'M12 4 L14.4 9.2 L20 10 L15.8 14 L17 19.6 L12 16.8 L7 19.6 L8.2 14 L4 10 L9.6 9.2 Z']],
  download: [['path', 'M12 4 V15 M7 11 L12 16 L17 11 M5 20 H19']],
  upload: [['path', 'M12 16 V4 M7 9 L12 4 L17 9 M5 20 H19']],
  share: [['circle', 17.5, 6, 2.5], ['circle', 6.5, 12, 2.5], ['circle', 17.5, 18, 2.5], ['path', 'M8.8 10.8 L15.2 7.2 M8.8 13.2 L15.2 16.8']],
  copy: [['rect', 9, 9, 11, 11, 2], ['path', 'M15 6.5 V5.5 A1.5 1.5 0 0 0 13.5 4 H5.5 A1.5 1.5 0 0 0 4 5.5 V13.5 A1.5 1.5 0 0 0 5.5 15 H6.5']],
  link: [['path', 'M9 15 L15 9'], ['path', 'M8.5 11.5 L6.5 13.5 A3.5 3.5 0 0 0 11.5 18.5 L13.5 16.5'], ['path', 'M15.5 12.5 L17.5 10.5 A3.5 3.5 0 0 0 12.5 5.5 L10.5 7.5']],
  'external-link': [['path', 'M14 4.5 H19.5 V10'], ['path', 'M19.5 4.5 L11.5 12.5'], ['path', 'M17.5 14 V17.5 A2 2 0 0 1 15.5 19.5 H6.5 A2 2 0 0 1 4.5 17.5 V8.5 A2 2 0 0 1 6.5 6.5 H10']],
  filter: [['path', 'M4 6 H20 L13.8 13.2 V19.5 L10.2 17.5 V13.2 Z']],
  sort: [['path', 'M7 5 V19 M4 16 L7 19 L10 16'], ['path', 'M17 19 V5 M14 8 L17 5 L20 8']],
  more: [['circle', 6, 12, 1.4], ['circle', 12, 12, 1.4], ['circle', 18, 12, 1.4]],
  fire: [['path', 'M12 3.5 C12 3.5 6.5 8.5 6.5 13.2 A5.5 5.5 0 0 0 17.5 13.2 C17.5 11.4 16.6 9.8 15.6 8.8 C15.6 10.6 14.7 11.6 13.7 11.6 C13.7 8.6 12 6.3 12 3.5 Z']],
  sparkles: [['path', 'M11 4 L12.5 8 L16.5 9.5 L12.5 11 L11 15 L9.5 11 L5.5 9.5 L9.5 8 Z'], ['path', 'M17.5 14 L18.3 16 L20.3 16.8 L18.3 17.6 L17.5 19.6 L16.7 17.6 L14.7 16.8 L16.7 16 Z']],
  eye: [['path', 'M2.5 12 C2.5 12 6 6.5 12 6.5 S21.5 12 21.5 12 S18 17.5 12 17.5 S2.5 12 2.5 12 Z'], ['circle', 12, 12, 2.8]],
  trash: [['path', 'M5 7 H19'], ['path', 'M9.5 7 V4.8 H14.5 V7'], ['path', 'M7 7 L8 20 H16 L17 7'], ['path', 'M10.5 11 V16 M13.5 11 V16']],
  edit: [['path', 'M4 20 L4.5 16 L15.5 5 L19 8.5 L8 19.5 Z'], ['path', 'M13 7.5 L16.5 11']],
  refresh: [['path', 'M20 12 A8 8 0 1 1 17.7 6.4'], ['path', 'M20 4.5 V10 H14.5']],
  info: [['circle', 12, 12, 8.5], ['path', 'M12 11 V16.5'], ['circle', 12, 8, 0.9]],
  'alert-circle': [['circle', 12, 12, 8.5], ['path', 'M12 7.5 V13'], ['circle', 12, 16.2, 0.9]],
  'check-circle': [['circle', 12, 12, 8.5], ['path', 'M8 12.3 L10.9 15.2 L16.2 9.5']],
  'x-circle': [['circle', 12, 12, 8.5], ['path', 'M9.2 9.2 L14.8 14.8 M14.8 9.2 L9.2 14.8']],
  sun: [['circle', 12, 12, 4], ['path', 'M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.2 5.2 L7 7 M17 17 L18.8 18.8 M18.8 5.2 L17 7 M7 17 L5.2 18.8']],
  moon: [['path', 'M20 14.6 A8.6 8.6 0 1 1 9.4 4 A7 7 0 0 0 20 14.6 Z']],
  user: [['circle', 12, 8, 3.6], ['path', 'M5 20.5 A7.2 7.2 0 0 1 19 20.5']],
  image: [['rect', 3.5, 5, 17, 14, 2], ['circle', 8.5, 10, 1.6], ['path', 'M4.5 17.5 L9.5 12.5 L13.5 16.5 L16.5 13.5 L20 17']],
  code: [['path', 'M9 8 L4.5 12 L9 16'], ['path', 'M15 8 L19.5 12 L15 16']],
  clock: [['circle', 12, 12, 8.5], ['path', 'M12 7.5 V12.4 L15.6 14.4']],
  lock: [['rect', 4.5, 10.5, 15, 9, 2], ['path', 'M8.2 10.5 V7.8 A3.8 3.8 0 0 1 15.8 7.8 V10.5']],
  setting: [['circle', 12, 12, 3], ['path', 'M12 3.5 V6 M12 18 V20.5 M3.5 12 H6 M18 12 H20.5 M6 6 L7.8 7.8 M16.2 16.2 L18 18 M18 6 L16.2 7.8 M7.8 16.2 L6 18']],
  bell: [['path', 'M6.5 16.5 V11 A5.5 5.5 0 0 1 17.5 11 V16.5 L19 18.5 H5 Z'], ['path', 'M10 21 H14']],
  home: [['path', 'M4 11 L12 4 L20 11 V20 H4 Z'], ['path', 'M10 20 V14.5 H14 V20']],
  tag: [['path', 'M4.5 4.5 H11 L20 13.5 L13.5 20 L4.5 11 Z'], ['circle', 8.4, 8.4, 1.3]],
  layers: [['path', 'M12 3.5 L20 8 L12 12.5 L4 8 Z'], ['path', 'M4 12.5 L12 17 L20 12.5']],
  play: [['path', 'M8 5 L19 12 L8 19 Z']],
  'log-out': [['path', 'M14 5 H18 A2 2 0 0 1 20 7 V17 A2 2 0 0 1 18 19 H14'], ['path', 'M9 12 H15'], ['path', 'M11.5 8.5 L8 12 L11.5 15.5']],
  menu: [['path', 'M4 7 H20 M4 12 H20 M4 17 H20']],
  grid: [['rect', 4, 4, 6.5, 6.5, 1.5], ['rect', 13.5, 4, 6.5, 6.5, 1.5], ['rect', 4, 13.5, 6.5, 6.5, 1.5], ['rect', 13.5, 13.5, 6.5, 6.5, 1.5]],
} as const satisfies Record<string, readonly Node[]>;

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<ComponentPropsWithRef<'svg'>, 'color'> {
  /** 内置图标名 */
  name?: IconName;
  /** 自定义图形（传了就忽略 name） */
  children?: ReactNode;
  /** 视觉尺寸，默认 16（社区站最常用的图标尺寸） */
  size?: 12 | 16 | 20 | 24 | number;
  /** 颜色：语义色或任意 CSS 颜色 */
  color?: 'current' | 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'danger' | 'cyan' | 'teal' | 'amber' | 'magenta' | (string & {});
  /** 旋转（用于 loading） */
  spin?: boolean;
  /** 给了 label 才进无障碍树，否则对读屏隐藏 */
  label?: string;
}

const COLOR_MAP: Record<string, string> = {
  primary: 'var(--oui-color-primary)',
  secondary: 'var(--oui-color-text-secondary)',
  tertiary: 'var(--oui-color-text-tertiary)',
  inverse: 'var(--oui-color-text-inverse)',
  success: 'var(--oui-color-success)',
  warning: 'var(--oui-color-warning)',
  danger: 'var(--oui-color-danger)',
  cyan: 'var(--oui-accent-cyan)',
  teal: 'var(--oui-accent-teal)',
  amber: 'var(--oui-accent-amber)',
  magenta: 'var(--oui-accent-magenta)',
};

export function Icon({
  name,
  children,
  size = 16,
  color = 'current',
  spin = false,
  label,
  className,
  style,
  ...rest
}: IconProps) {
  const nodes = name ? (ICONS[name] as readonly Node[]) : undefined;
  const resolved = color === 'current' ? undefined : (COLOR_MAP[color] ?? color);

  return (
    <svg
      {...rest}
      className={cx('oui-icon', spin && 'oui-icon--spin', className)}
      style={{ color: resolved, ...style } as CSSProperties}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      {children ??
        nodes?.map((node, i) => {
          if (node[0] === 'path') return <path key={i} d={node[1]} />;
          if (node[0] === 'circle') return <circle key={i} cx={node[1]} cy={node[2]} r={node[3]} />;
          return (
            <rect
              key={i}
              x={node[1]}
              y={node[2]}
              width={node[3]}
              height={node[4]}
              rx={node[5] ?? 0}
            />
          );
        })}
    </svg>
  );
}
