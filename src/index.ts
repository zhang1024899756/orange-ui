/**
 * orange-ui 公共出口。
 * 每个组件在 src/components/<Name>/index.ts 单独导出，这里做汇总；
 * 子路径（orange-ui/button）由 tsup 多入口自动产出，无需在此声明。
 */
'use client';

import './styles/index.css';

export type { Size, Color, Variant, OuiTheme, OuiScheme } from './types';

export { ThemeProvider } from './theme/theme-provider';
export type { ThemeProviderProps } from './theme/theme-provider';

export { Button } from './components/Button';
export type { ButtonProps, ButtonShape } from './components/Button';

export { Icon } from './components/Icon';
export type { IconProps, IconName } from './components/Icon';

export { Link } from './components/Link';
export type { LinkProps, LinkColor, LinkUnderline } from './components/Link';

export { Image } from './components/Image';
export type { ImageProps, ImageRatio, ImageFit, ImageRadius } from './components/Image';

export { Number } from './components/Number';
export type { NumberProps } from './components/Number';

export { Text } from './components/Text';
export type { TextProps, TextSize, TextTone, TextWeight } from './components/Text';

export { Tag } from './components/Tag';
export type { TagProps, TagColor } from './components/Tag';

export { Input } from './components/Input';
export type { InputProps, InputSize, InputStatus, InputType } from './components/Input';

export { Switch } from './components/Switch';
export type { SwitchProps, SwitchSize, SwitchColor } from './components/Switch';

export { Slider } from './components/Slider';
export type { SliderProps, SliderTooltip } from './components/Slider';

export { Dialog } from './components/Dialog';
export type { DialogProps } from './components/Dialog';

export { Progress } from './components/Progress';
export type { ProgressProps } from './components/Progress';

export { Card } from './components/Card';
export type { CardProps, CardVariant, CardPadding } from './components/Card';

export { Avatar, AvatarGroup } from './components/Avatar';
export type { AvatarProps, AvatarSize, AvatarGroupProps } from './components/Avatar';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export { Skeleton } from './components/Skeleton';
export type { SkeletonProps, SkeletonVariant } from './components/Skeleton';

export { Spinner } from './components/Spinner';
export type { SpinnerProps, SpinnerSize } from './components/Spinner';

export { Empty } from './components/Empty';
export type { EmptyProps } from './components/Empty';

export { Tooltip } from './components/Tooltip';
export type { TooltipProps, TooltipPlacement } from './components/Tooltip';

export { Divider } from './components/Divider';
export type { DividerProps } from './components/Divider';
