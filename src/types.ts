/** 全部组件共用的公共类型。三维正交：size × variant × color */
export type Size = 'xs' | 'sm' | 'md' | 'lg';

export type Color = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';

export type Variant = 'solid' | 'outlined' | 'soft' | 'ghost' | 'text';

/** 主题名。用 (string & {}) 保留使用方注册私有主题的扩展能力 */
export type OuiTheme = 'orange' | 'violet' | 'teal' | 'rose' | (string & {});

export type OuiScheme = 'light' | 'dark' | 'system';
