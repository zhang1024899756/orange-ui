/**
 * 把 aria-* 从透传 props 里拆出来。
 *
 * 复合组件常见的一处错误：{...rest} 落在最外层容器上，而 role="dialog" / role="switch"
 * 在内层节点上，于是调用方写的 aria-label 永远贴不到真正被读屏的那一层。
 * 用它把 aria 属性单独摘出来，挂到带 role 的节点上。
 */
export function splitAriaProps<T extends object>(props: T): {
  aria: Record<string, unknown>;
  rest: T;
} {
  const aria: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('aria-')) {
      aria[key] = value;
    } else {
      rest[key] = value;
    }
  }

  return { aria, rest: rest as T };
}
