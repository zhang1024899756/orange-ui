import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * v0.2.0 契约：加载指示器在 prefers-reduced-motion: reduce 下只降速，不许冻结。
 *
 * 这道守卫守的是一个**静默失效的真 bug**，而且它天生测不出来：
 *   0.1.x 里 base.css 的 reduce 块写着
 *     animation-duration: 0.001ms !important;
 *     animation-iteration-count: 1 !important;
 *   两条都对（对装饰性动画而言），但它们命中的是 :where(.oui-root) * —— 包括 spinner。
 *   !important 的优先级高于一切普通声明，于是 spinner-glyph.css 里那句
 *   「reduce 下 animation-duration: 1.6s」从未生效；再加上 tokens.css 把
 *   --oui-spin-duration 设成 0ms，加载图标就彻底静止了。
 *
 *   为什么单元测试抓不到：jsdom 不执行 CSS 动画，getComputedStyle 也不会告诉你
 *   动画是不是在转；真实浏览器里它只是「看起来卡住了」，没有任何异常、没有报错、
 *   没有失败的快照 —— 只有用户以为页面挂了。所以这里只能静态断言三件套：
 *   动画声明还在 + 时长不是 0 + 压制规则显式排除了 spinner。
 *
 * 断言写法都是「按实际代码读，不写死 1.6s」：哪天真改成 2s，只要仍是正数就不误报，
 * 但退回 0ms / 删掉 :not() 一定会红。
 */

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * 转一圈的可视化下限（毫秒）。
 *
 * 只断言「> 0」不够：0.001ms 也是正数，而它和 0 在视觉上完全一样 ——
 * base.css 那条 animation-duration: 0.001ms !important 就是这类值的原型，
 * 正是它把 0.1.x 的 spinner 冻成了静止图标。所以下限取 100ms：
 * 比任何合理的「降速」都低（当前约定 1600ms，正常速度 800ms），
 * 但足以把「0.001ms / 1ms / 10ms」这一类假旋转挡在外面。
 */
const MIN_VISIBLE_MS = 100;

const SPINNER_CSS_PATH = join(HERE, 'spinner-glyph.css');
const TOKENS_CSS_PATH = join(HERE, '../../styles/tokens.css');
const BASE_CSS_PATH = join(HERE, '../../styles/base.css');
const ICON_CSS_PATH = join(HERE, '../Icon/icon.css');

/** 注释里写着 0ms、1.6s、:not(.oui-spinner-glyph) 这些字样，不剥离会把注释当代码读。 */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '));
}

const SPINNER_CSS = stripComments(readFileSync(SPINNER_CSS_PATH, 'utf8'));
const TOKENS_CSS = stripComments(readFileSync(TOKENS_CSS_PATH, 'utf8'));
const BASE_CSS = stripComments(readFileSync(BASE_CSS_PATH, 'utf8'));
const ICON_CSS = stripComments(readFileSync(ICON_CSS_PATH, 'utf8'));

interface CssRange {
  start: number;
  end: number;
}

/** 用花括号配对找出所有 prefers-reduced-motion: reduce 媒体块的字符区间。 */
function reducedMotionRanges(css: string): CssRange[] {
  const ranges: CssRange[] = [];
  const pattern = /@media[^{]*prefers-reduced-motion\s*:\s*reduce[^{]*\{/gi;

  for (const match of css.matchAll(pattern)) {
    const start = match.index ?? 0;
    let index = start + match[0].length;
    let depth = 1;
    while (index < css.length && depth > 0) {
      if (css[index] === '{') depth += 1;
      else if (css[index] === '}') depth -= 1;
      index += 1;
    }
    ranges.push({ start, end: index });
  }

  return ranges;
}

/** 每个 reduce 块的花括号内部文本。 */
function reducedMotionBlocks(css: string): string[] {
  return reducedMotionRanges(css).map((range) => {
    const openBrace = css.indexOf('{', range.start);
    return css.slice(openBrace + 1, range.end - 1);
  });
}

/** 去掉 reduce 块之后的文本，剩下的就是「默认（不降速）」规则。 */
function withoutReducedMotion(css: string): string {
  let output = '';
  let cursor = 0;
  for (const range of reducedMotionRanges(css)) {
    output += css.slice(cursor, range.start);
    cursor = range.end;
  }
  return output + css.slice(cursor);
}

/** 取某个选择器在文本里出现的所有声明块内容（不含嵌套块的情况）。 */
function declarationBlocks(css: string, selector: string): string[] {
  const escaped = selector.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped + '\\s*\\{([^{}]*)\\}', 'g');
  const blocks: string[] = [];

  for (const match of css.matchAll(pattern)) {
    blocks.push(match[1] ?? '');
  }

  return blocks;
}

/** 把 "1.6s" / "1600ms" / "0ms" 换算成毫秒；解析不了返回 null。 */
function parseDuration(raw: string): number | null {
  const matched = /^([\d.]+)\s*(ms|s)$/i.exec(raw.trim());
  if (!matched) return null;
  const amount = Number.parseFloat(matched[1] ?? '');
  if (Number.isNaN(amount)) return null;
  return (matched[2] ?? '').toLowerCase() === 's' ? amount * 1000 : amount;
}

/** 取一条声明的值，如 animation-duration: 1.6s; 里的 1.6s。 */
function declarationValue(block: string, property: string): string | null {
  const pattern = new RegExp('(?:^|;)\\s*' + property + '\\s*:\\s*([^;]+)', 'i');
  const matched = pattern.exec(block);
  return matched ? (matched[1] ?? '').trim() : null;
}

/** 选择器比较前先抹掉空白，容忍 :not( .oui-spinner-glyph ) 这种写法。 */
function compact(text: string): string {
  return text.replace(/\s+/g, '');
}

describe('加载指示器动效契约：reduce 下只降速，不许冻结（v0.2.0）', () => {
  describe('spinner-glyph.css：旋转动画本身', () => {
    it('.oui-spinner-glyph 声明了 oui-spin 的无限循环动画，且时长取自令牌', () => {
      const blocks = declarationBlocks(withoutReducedMotion(SPINNER_CSS), '.oui-spinner-glyph');
      expect(
        blocks.length,
        'spinner-glyph.css 里找不到 .oui-spinner-glyph 的默认规则块。' +
          '\n没有这条规则，下面的 reduce 断言全是空转。',
      ).toBeGreaterThan(0);

      const animation = blocks
        .map((block) => declarationValue(block, 'animation'))
        .find((value): value is string => value !== null);

      expect(
        animation ?? null,
        '.oui-spinner-glyph 缺少 animation 声明 —— 加载图标彻底不转，比「冻结」更严重。',
      ).not.toBeNull();

      const value = compact(animation ?? '');

      expect(
        value.includes('oui-spin'),
        '.oui-spinner-glyph 的 animation 没有引用 oui-spin（实际："' + (animation ?? '') + '"）。' +
          '\n@keyframes 名字对不上时动画不会报错，只是什么都不发生。',
      ).toBe(true);

      // 关键：必须是 infinite。iteration-count 为 1 时转完一圈就停在终点，
      // 视觉上与「冻住」完全一样，而 CSS 不会给任何警告。
      expect(
        value.includes('infinite'),
        '.oui-spinner-glyph 的 animation 不是 infinite（实际："' + (animation ?? '') + '"）。' +
          '\n只转一圈同样等于冻结，加载态会看起来像卡死。',
      ).toBe(true);

      // 时长走令牌：tokens.css 在 reduce 下改 --oui-spin-duration 才有意义。
      expect(
        value.includes('var(--oui-spin-duration)'),
        '.oui-spinner-glyph 的 animation 没把时长接到 var(--oui-spin-duration)（实际："' + (animation ?? '') + '"）。' +
          '\n令牌不参与时，tokens.css 里 reduce 的降速值就是死配置。',
      ).toBe(true);
    });

    it('存在 @keyframes oui-spin 定义', () => {
      expect(
        /@keyframes\s+oui-spin\b/.test(SPINNER_CSS),
        'spinner-glyph.css 里没有 @keyframes oui-spin。animation 引用了不存在的关键帧，' +
          '浏览器会静默跳过动画，加载图标一动不动。',
      ).toBe(true);
    });

    it('reduce 块把旋转降速成正数，而不是停转', () => {
      const blocks = reducedMotionBlocks(SPINNER_CSS);
      expect(
        blocks.length,
        'spinner-glyph.css 没有 prefers-reduced-motion: reduce 块 —— 那 reduce 下就只剩令牌值，' +
          '本文件该负责的降速兜底消失了。',
      ).toBeGreaterThan(0);

      const reduceText = blocks.join('\n');
      const spinnerBlocks = declarationBlocks(reduceText, '.oui-spinner-glyph');
      expect(
        spinnerBlocks.length,
        'reduce 块里没有针对 .oui-spinner-glyph 的规则。',
      ).toBeGreaterThan(0);

      const block = spinnerBlocks.join('\n');
      expect(
        /animation\s*:\s*none/i.test(block),
        'reduce 块里把 spinner 写成了 animation: none —— 这正是本轮要修的 bug（冻结加载反馈）。',
      ).toBe(false);

      const raw = declarationValue(block, 'animation-duration');
      expect(raw ?? null, 'reduce 块里的 .oui-spinner-glyph 没有 animation-duration 声明。').not.toBeNull();

      const duration = parseDuration(raw ?? '');
      expect(
        duration ?? null,
        'reduce 块里的 animation-duration 解析不了（实际："' + (raw ?? '') + '"），应是 1.6s / 1600ms 这种时长。',
      ).not.toBeNull();

      expect(
        (duration ?? 0) >= MIN_VISIBLE_MS,
        'reduce 块把 spinner 的 animation-duration 设成了 ' + (raw ?? '') + '。' +
          '\n减少动态偏好（WCAG 2.2.2）要求的是「别晃眼」，不是「别动」：' +
          '超过 5 秒的等待需要持续反馈，冻住的转圈会让用户分不清「在加载」和「卡死了」。' +
          '\n注意 0.001ms 这类「近似冻结」也算冻结 —— 下限是 ' + MIN_VISIBLE_MS + 'ms。',
      ).toBe(true);
    });
  });

  describe('tokens.css：--oui-spin-duration 在 reduce 下必须是正数', () => {
    it('reduce 块里 --oui-spin-duration 存在且大于 0', () => {
      const blocks = reducedMotionBlocks(TOKENS_CSS);
      expect(
        blocks.length,
        'tokens.css 没有 prefers-reduced-motion: reduce 块 —— 装饰动画的归零逻辑不见了，' +
          '本文件此前负责的「骨架屏静音」设计需要确认。',
      ).toBeGreaterThan(0);

      const reduceText = blocks.join('\n');
      const matched = /--oui-spin-duration\s*:\s*([^;}]+)/.exec(reduceText);
      expect(
        matched ? (matched[1] ?? '').trim() : null,
        'reduce 块里没有 --oui-spin-duration。如果不打算降速，至少要让 1.6s 这个决定可见地写在令牌里，' +
          '而不是依赖组件各自兜底。',
      ).not.toBeNull();

      const raw = (matched?.[1] ?? '').trim();
      const duration = parseDuration(raw);
      expect(
        duration ?? null,
        'tokens.css 的 reduce 里 --oui-spin-duration = "' + raw + '"，解析不了时长（期望 1600ms / 1.6s）。',
      ).not.toBeNull();

      expect(
        (duration ?? 0) >= MIN_VISIBLE_MS,
        'tokens.css 的 reduce 里 --oui-spin-duration = ' + raw + '，等于把加载图标冻住了（下限 ' + MIN_VISIBLE_MS + 'ms）。' +
          '\n这正是 0.1.x 的 bug 来源之一（再叠加 base.css 的 0.001ms !important，spinner 完全静止）。' +
          '\nreduce 的含义是「放缓」，所以这里必须是正数（当前约定 1600ms = 1.6s/圈）。',
      ).toBe(true);
    });
  });

  describe('base.css：全局压制规则必须放行加载指示器', () => {
    /** 找出 reduce 块里所有「带 !important 的 animation-duration」规则及其选择器。 */
    function suppressionRules(): Array<{ selector: string; declarations: string }> {
      const blocks = reducedMotionBlocks(BASE_CSS);
      const rules: Array<{ selector: string; declarations: string }> = [];

      for (const block of blocks) {
        const pattern = /([^{}]+)\{([^{}]*)\}/g;
        for (const match of block.matchAll(pattern)) {
          const selector = match[1] ?? '';
          const declarations = match[2] ?? '';
          if (/animation-duration\s*:[^;]*!important/i.test(declarations)) {
            rules.push({ selector, declarations });
          }
        }
      }

      return rules;
    }

    it('那条 animation-duration: … !important 的规则确实存在（否则本守卫失去对象）', () => {
      const rules = suppressionRules();
      expect(
        rules.length,
        'base.css 的 reduce 块里已经没有 animation-duration: … !important 的全局压制规则。' +
          '\n如果是有意整体删除（改为逐组件降速），请同步删掉本条测试；' +
          '\n如果是重构时误删，装饰动画（骨架屏、过渡）会在 reduce 下继续全速播放。',
      ).toBeGreaterThan(0);
    });

    it('压制规则用 :not(.oui-spinner-glyph) 显式排除加载指示器', () => {
      const rules = suppressionRules();
      const excluded = rules.filter((rule) => compact(rule.selector).includes(':not(.oui-spinner-glyph)'));

      expect(
        excluded.length,
        'base.css 的 reduce 压制规则没有排除 .oui-spinner-glyph。' +
          '\n这正是本轮 bug 的根因：!important 会盖过 spinner-glyph.css 里的 animation-duration: 1.6s，' +
          '\n而且在浏览器里完全静默 —— 没有报错、没有警告，测试也测不出（jsdom 不跑动画），' +
          '\n只有用户看到「加载图标不动」。现有选择器：' +
          rules.map((rule) => rule.selector.replace(/\s+/g, ' ').trim()).join(' | ') +
          '\n修法：在 :where(*:not(.oui-spinner-glyph)) 这类结构里把 spinner 摘出去。',
      ).toBeGreaterThan(0);

      // 排除必须挂在「真正带 !important 的那条规则」上，而不是写在注释里或别的块里。
      for (const rule of excluded) {
        expect(
          /animation-iteration-count\s*:\s*1\s*!important/i.test(rule.declarations) ||
            /animation-duration\s*:[^;]*!important/i.test(rule.declarations),
          '排除 spinner 的那条规则里没有实际的压制声明，排了个寂寞。',
        ).toBe(true);
      }
    });

    it('图标旋转同样被放行（与 icon.css 的降速声明配套）', () => {
      // Icon 的旋转图标和 spinner 是同一类「状态指示器」，处理方式必须一致：
      // icon.css 在 reduce 里声明了降速，base.css 的 !important 就必须放行它，
      // 否则那条声明是死代码（和 0.1.x 的 spinner 一模一样）。
      const iconBlocks = reducedMotionBlocks(ICON_CSS);
      expect(iconBlocks.length, 'icon.css 没有 reduce 块，Icon 的旋转在 reduce 下会被全局压制冻结。').toBeGreaterThan(0);

      const iconRule = declarationBlocks(iconBlocks.join('\n'), '.oui-icon--spin');
      expect(iconRule.length, 'icon.css 的 reduce 块里没有针对 .oui-icon--spin 的规则。').toBeGreaterThan(0);

      const raw = declarationValue(iconRule.join('\n'), 'animation-duration');
      const duration = raw === null ? null : parseDuration(raw);
      expect(
        duration ?? null,
        'icon.css 的 reduce 块里 .oui-icon--spin 的 animation-duration 解析不了（实际：' + (raw ?? '未声明') + '）。',
      ).not.toBeNull();
      expect(
        (duration ?? 0) >= MIN_VISIBLE_MS,
        'icon.css 的 reduce 块把 .oui-icon--spin 的 animation-duration 设成了 ' + (raw ?? '') + '，旋转图标被冻住。' +
          '\n下限 ' + MIN_VISIBLE_MS + 'ms：比这更快的旋转人眼看不出来，等同于静态图标。',
      ).toBe(true);

      const rules = suppressionRules();
      const exclusions = rules.filter((rule) => compact(rule.selector).includes(':not(.oui-icon--spin)'));
      expect(
        exclusions.length,
        'base.css 的 reduce 压制规则没有排除 .oui-icon--spin。' +
          '\nicon.css 里那句 animation-duration 降速会被 !important 盖掉，等于死代码。',
      ).toBeGreaterThan(0);
    });
  });
});
