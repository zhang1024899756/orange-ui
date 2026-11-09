/**
 * jest-axe 的 toHaveNoViolations 只有 jest 的类型声明，
 * vitest 下通过「模块增强」补上。
 * 注意：文件里必须先 import 一次，否则 declare module 会被当成新的环境声明而遮蔽真实模块。
 */
import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
