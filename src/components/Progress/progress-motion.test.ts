import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 不确定进度的动效契约：和 spinner 同一条规矩 —— 等待反馈不许被冻结。
 *
 * 0.1.x 的写法是「reduce 下 animation: none + width: 100% + opacity: .7」，
 * 看上去很「无障碍」，实际制造了两个问题：
 *   1. 用户看到的是一条快满的静态条，会以为「已经快完成了」，和真实的「不知道还要多久」相反；
 *   2. base.css 的 animation-duration: 0.001ms !important 本来就压平一切，那条 animation: none
 *      只是把「冻住的 0.001ms」换成「静态 100%」，真正的 bug 是 !important 没有放行。
 * 现在 reduce 下只降速，不放行就会被 !important 吃掉，所以下面两条必须同时成立。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const PROGRESS_CSS = readFileSync(join(HERE, '..', 'Progress', 'progress.css'), 'utf8');
const BASE_CSS = readFileSync(join(HERE, '..', '..', 'styles', 'base.css'), 'utf8');

/** 下限定在 100ms：比这更快的循环动画人眼看不出来，等同于静态。 */
const MIN_VISIBLE_MS = 100;

function compact(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\s+/g, ' ');
}

/** 取出所有 @media (prefers-reduced-motion: reduce) 块的内容。 */
function reducedMotionBlocks(css: string): string[] {
  const source = compact(css);
  const blocks: string[] = [];
  const marker = '@media (prefers-reduced-motion: reduce)';
  let index = source.indexOf(marker);
  while (index >= 0) {
    const open = source.indexOf('{', index);
    if (open < 0) break;
    let depth = 1;
    let cursor = open + 1;
    while (cursor < source.length && depth > 0) {
      if (source[cursor] === '{') depth += 1;
      else if (source[cursor] === '}') depth -= 1;
      cursor += 1;
    }
    blocks.push(source.slice(open + 1, cursor - 1));
    index = source.indexOf(marker, cursor);
  }
  return blocks;
}

/** 在一段 CSS 里取某个选择器的声明块（同名选择器可能有多段，合并返回）。 */
function declarationsOf(css: string, selector: string): string[] {
  const source = compact(css);
  const result: string[] = [];
  let index = source.indexOf(selector);
  while (index >= 0) {
    const open = source.indexOf('{', index);
    const close = source.indexOf('}', open);
    if (open < 0 || close < 0) break;
    result.push(source.slice(open + 1, close));
    index = source.indexOf(selector, close);
  }
  return result;
}

/** 从声明里取 animation-duration 的毫秒值；没声明返回 null。 */
function durationMs(declarations: string): number | null {
  const match = /animation-duration\s*:\s*([^;]+);/.exec(declarations);
  if (!match?.[1]) return null;
  const value = match[1].trim().toLowerCase();
  if (value === '0s' || value === '0ms') return 0;
  const seconds = /([\d.]+)s$/.exec(value);
  if (seconds?.[1]) return Number.parseFloat(seconds[1]) * 1000;
  const millis = /([\d.]+)ms$/.exec(value);
  if (millis?.[1]) return Number.parseFloat(millis[1]);
  return null;
}

describe('不确定进度的动效（reduce 下不许冻结）', () => {
  const blocks = reducedMotionBlocks(PROGRESS_CSS).join(' ');

  it('progress.css 有 reduce 块', () => {
    expect(blocks.length, 'progress.css 没有 prefers-reduced-motion 块，说明动画处理被删了。').toBeGreaterThan(0);
  });

  it('线形 indeterminate 降速而不是 animation: none', () => {
    const declarations = declarationsOf(blocks, '[data-indeterminate] .oui-progress__fill').join(' ');
    expect(
      declarations.length,
      'progress.css 的 reduce 块里没有 [data-indeterminate] .oui-progress__fill 规则 —— ' +
        '要么动画被整体关掉（0.1.x 的老写法），要么漏了这个元素。',
    ).toBeGreaterThan(0);
    expect(
      /animation\s*:\s*none/.test(declarations),
      'reduce 下把线形 indeterminate 的动画关掉了：等待反馈会退化成一条静态条，用户读成「快完成了」。' +
        '应当只降速（animation-duration），不停止。',
    ).toBe(false);

    const duration = durationMs(declarations);
    expect(duration, '线形 indeterminate 在 reduce 下没有声明 animation-duration，会被 base.css 的 !important 压平。').not.toBeNull();
    expect(
      duration !== null && duration >= MIN_VISIBLE_MS,
      '线形 indeterminate 在 reduce 下的 duration 是 ' + String(duration) + 'ms，低于 ' + MIN_VISIBLE_MS + 'ms 等于静止。',
    ).toBe(true);
  });

  it('环形 indeterminate 同样只降速', () => {
    const declarations = declarationsOf(blocks, '[data-indeterminate] .oui-progress__ring-fill').join(' ');
    expect(declarations.length, 'progress.css 的 reduce 块里没有环形 indeterminate 规则。').toBeGreaterThan(0);
    expect(/animation\s*:\s*none/.test(declarations), '环形 indeterminate 在 reduce 下被关掉了动画。').toBe(false);
    const duration = durationMs(declarations);
    expect(duration !== null && duration >= MIN_VISIBLE_MS, '环形 indeterminate 的 reduce 时长不达标：' + String(duration)).toBe(true);
  });

  it('base.css 的全局压制放行了这两个播放元素', () => {
    const baseBlocks = reducedMotionBlocks(BASE_CSS).join(' ');
    expect(
      baseBlocks.includes(':not([data-indeterminate] .oui-progress__fill)'),
      'base.css 的 reduce 压制规则没有排除 [data-indeterminate] .oui-progress__fill。' +
        'animation-duration: 0.001ms !important 会把上面那条降速压成死代码 —— 和 0.1.x 的 spinner 是同一个坑。',
    ).toBe(true);
    expect(
      baseBlocks.includes(':not([data-indeterminate] .oui-progress__ring-fill)'),
      'base.css 的 reduce 压制规则没有排除 [data-indeterminate] .oui-progress__ring-fill。',
    ).toBe(true);
  });
});
