import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * v0.2.0 契约：实心背景 + 白字必须 >= 4.5:1。
 *
 * 为什么是「读源文件 + 自己算」，而不是渲染出来量 computed style：
 *   1. jsdom 不算颜色。getComputedStyle 对 var() 链、color-mix() 一律返回原文字符串，
 *      也不做 hex 亮度换算 —— 拿它做对比度断言等于没测。
 *   2. 这是设计令牌层的契约，不是某个组件的渲染结果。按钮、徽章、Tag、头像都只是
 *      「取 --oui-color-*-solid 当背景、--oui-color-on-solid 当文字」，所以真正的
 *      回归点是那四十多个变量本身。盯住令牌，换组件时忘了跟随也能立刻发现。
 *   3. 4 套主题 x 明暗 = 8 个作用域，真要渲染得挂 8 次 DOM；静态解析是一次性的。
 *
 * 解析器必须模拟的层叠规则（tokens.css 全部选择器同权重，所以「文件出现顺序」即优先级）：
 *   :root                        默认值，等价于 [data-oui-theme="orange"] + 亮色
 *   [data-oui-theme="x"]         只改强调色
 *   [data-oui-scheme="dark"]     只改中性色 / 语义色 / 浮层
 *   :root[data-oui-scheme="dark"]、[data-oui-theme="x"][data-oui-scheme="dark"]
 *                                组合选择器，两者同时成立才命中
 *   @media 里的声明（reduce-motion 的时长）不参与配色，跳过
 *   后面的规则覆盖前面的同名变量
 */

// ---------------------------------------------------------------- 契约常量

const THEMES = ['orange', 'violet', 'teal', 'rose'] as const;
type ThemeName = (typeof THEMES)[number];

const SCHEMES = ['light', 'dark'] as const;
type Scheme = (typeof SCHEMES)[number];

const SEMANTIC_ROLES = ['success', 'warning', 'danger', 'info'] as const;
const ACCENT_ROLES = ['cyan', 'teal', 'amber', 'magenta'] as const;

/** 实心背景的三个档位：静止 / hover / active，三者都要能承载白字。 */
const TIERS = ['solid', 'solid-hover', 'solid-active'] as const;
type Tier = (typeof TIERS)[number];

/** WCAG 2.x AA 对正文的最低要求。 */
const MIN_CONTRAST = 4.5;

/**
 * 浮点容差。判定标准仍然是「>= 4.5」，只是不拿 4.4999999 当失败：
 * 线性化公式里有 pow(x, 2.4)，同一个设计值在不同 V8 版本下最后一位可能抖动。
 */
const FLOAT_EPSILON = 0.005;

const WHITE = '#FFFFFF';

interface Scene {
  theme: ThemeName;
  scheme: Scheme;
  title: string;
}

const SCENES: Scene[] = THEMES.flatMap((theme) =>
  SCHEMES.map((scheme) => ({
    theme,
    scheme,
    title: '主题 ' + theme + ' · ' + (scheme === 'light' ? '亮色' : '暗色'),
  })),
);

const SEMANTIC_SCENES = SEMANTIC_ROLES.flatMap((role) =>
  SCENES.map((scene) => ({ ...scene, role, title: scene.title + ' · ' + role })),
);

const ACCENT_SCENES = ACCENT_ROLES.flatMap((role) =>
  SCENES.map((scene) => ({ ...scene, role, title: scene.title + ' · accent-' + role })),
);

// ---------------------------------------------------------------- CSS 解析

interface Decl {
  name: string;
  value: string;
  /** 源文件行号，报错时直接指过去。 */
  line: number;
}

interface Rule {
  selectors: string[];
  decls: Decl[];
  /** 所在的 @media / @supports 条件；空串表示无条件规则。 */
  media: string;
}

const CSS_PATH = join(dirname(fileURLToPath(import.meta.url)), 'tokens.css');
const SOURCE = readFileSync(CSS_PATH, 'utf8');

/**
 * 注释必须最先抹掉，而且要等长替换（保留换行）：
 * tokens.css 的注释里写着「0ms」「--oui-color-on-primary」这些字样，
 * 不剥离的话解析器会把注释当成声明读进来。
 */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '));
}

const CLEAN = stripComments(SOURCE);

const LINE_STARTS: number[] = (() => {
  const starts = [0];
  for (let index = 0; index < CLEAN.length; index += 1) {
    if (CLEAN[index] === '\n') starts.push(index + 1);
  }
  return starts;
})();

function lineAt(offset: number): number {
  let low = 0;
  let high = LINE_STARTS.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const start = LINE_STARTS[middle];
    if (start !== undefined && start <= offset) low = middle;
    else high = middle - 1;
  }
  return low + 1;
}

function splitSelectors(prelude: string): string[] {
  return prelude
    .split(',')
    .map((selector) => selector.trim())
    .filter((selector) => selector !== '');
}

function findTopLevelColon(segment: string): number {
  let depth = 0;
  for (let index = 0; index < segment.length; index += 1) {
    const char = segment[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ':' && depth === 0) return index;
  }
  return -1;
}

function parseDeclarations(body: string, bodyStart: number): Decl[] {
  const decls: Decl[] = [];
  let depth = 0;
  let segmentStart = 0;

  const flush = (from: number, to: number): void => {
    const segment = body.slice(from, to);
    const colon = findTopLevelColon(segment);
    if (colon < 0) return;
    const name = segment.slice(0, colon).trim();
    const value = segment.slice(colon + 1).trim();
    if (!name.startsWith('--') || value === '') return;
    decls.push({ name, value, line: lineAt(bodyStart + from + segment.indexOf(name)) });
  };

  for (let index = 0; index <= body.length; index += 1) {
    const char = body[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if ((char === ';' && depth === 0) || index === body.length) {
      flush(segmentStart, index);
      segmentStart = index + 1;
    }
  }

  return decls;
}

function parseRules(css: string): Rule[] {
  const rules: Rule[] = [];

  const walk = (start: number, end: number, media: string): void => {
    let cursor = start;
    while (cursor < end) {
      let probe = cursor;
      while (probe < end && css[probe] !== '{' && css[probe] !== '}' && css[probe] !== ';') probe += 1;
      if (probe >= end) return;

      const delimiter = css[probe];
      if (delimiter === ';' || delimiter === '}') {
        // @import / @charset 之类没有块体的 at-rule，直接跳过。
        cursor = probe + 1;
        continue;
      }

      const prelude = css.slice(cursor, probe).trim();

      let close = probe + 1;
      let depth = 1;
      while (close < end && depth > 0) {
        if (css[close] === '{') depth += 1;
        else if (css[close] === '}') depth -= 1;
        close += 1;
      }

      if (prelude.startsWith('@')) {
        const conditional = /^@(media|supports)\b/i.test(prelude);
        const grouping = /^@layer\b/i.test(prelude);
        if (conditional || grouping) walk(probe + 1, close - 1, conditional ? prelude : media);
        // @keyframes / @font-face 之类与配色无关，跳过。
      } else {
        rules.push({
          selectors: splitSelectors(prelude),
          decls: parseDeclarations(css.slice(probe + 1, close - 1), probe + 1),
          media,
        });
      }

      cursor = close;
    }
  };

  walk(0, css.length, '');
  return rules;
}

const RULES = parseRules(CLEAN);

// ---------------------------------------------------------------- 作用域合并

interface ScopeState {
  theme: ThemeName;
  scheme: Scheme;
}

/**
 * 把一个复合选择器拆成「data 属性条件」。
 * 返回 null 表示这个选择器含有本文件不建模的部分（类名、后代、伪元素…），
 * 一律视为不命中 —— tokens.css 里只有 :root 与 data 属性两种形态，
 * 出现别的东西说明令牌文件结构变了，宁可漏算也不要瞎算。
 */
function selectorConditions(selector: string): Array<[string, string]> | null {
  const conditions: Array<[string, string]> = [];
  const rest = selector
    .replace(/\[\s*data-oui-(theme|scheme)\s*=\s*"([^"]*)"\s*\]/g, (_match, key: string, value: string) => {
      conditions.push([key, value]);
      return '';
    })
    .replace(/:root\b/g, '')
    .replace(/^html\b/, '')
    .replace(/\*/g, '')
    .trim();

  if (rest !== '') return null;
  return conditions;
}

function matchesScope(selector: string, state: ScopeState): boolean {
  const conditions = selectorConditions(selector);
  if (conditions === null) return false;
  return conditions.every(([key, value]) => (key === 'theme' ? value === state.theme : value === state.scheme));
}

function scopeLabel(state: ScopeState): string {
  return state.theme + '/' + (state.scheme === 'light' ? '亮色' : '暗色');
}

/** 按文件顺序把命中的规则叠成一张变量表，后写的覆盖先写的。 */
function buildScope(state: ScopeState): Map<string, Decl> {
  const scoped = new Map<string, Decl>();
  for (const rule of RULES) {
    if (rule.media !== '') continue; // 媒体查询里的声明（动效时长等）不参与配色
    if (!rule.selectors.some((selector) => matchesScope(selector, state))) continue;
    for (const decl of rule.decls) scoped.set(decl.name, decl);
  }
  return scoped;
}

// ---------------------------------------------------------------- 取值与颜色

class TokenError extends Error {}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const NAMED_COLORS: Record<string, Rgb> = {
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
};

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function parseColor(raw: string, label: string): Rgb {
  const value = raw.trim().toLowerCase();

  const named = NAMED_COLORS[value];
  if (named) return named;

  if (value === 'transparent') {
    throw new TokenError(label + ' 的值是 transparent —— 透明背景无法计算对比度');
  }

  const short = /^#([0-9a-f]{3})$/.exec(value);
  if (short) {
    const digits = short[1] ?? '';
    // 用 slice 而不是 digits[i]：#RRGGBB 展开成 #RRGGBB 时需要同字符重复，
    // 且 noUncheckedIndexedAccess 下下标访问是 string | undefined。
    const red = digits.slice(0, 1);
    const green = digits.slice(1, 2);
    const blue = digits.slice(2, 3);
    return {
      r: Number.parseInt(red + red, 16),
      g: Number.parseInt(green + green, 16),
      b: Number.parseInt(blue + blue, 16),
    };
  }

  const full = /^#([0-9a-f]{6})$/.exec(value);
  if (full) {
    const digits = full[1] ?? '';
    return {
      r: Number.parseInt(digits.slice(0, 2), 16),
      g: Number.parseInt(digits.slice(2, 4), 16),
      b: Number.parseInt(digits.slice(4, 6), 16),
    };
  }

  const withAlpha = /^#([0-9a-f]{8})$/.exec(value);
  if (withAlpha) {
    const digits = withAlpha[1] ?? '';
    const alpha = digits.slice(6, 8);
    if (alpha !== 'ff') {
      throw new TokenError(label + ' 带半透明（#' + digits + '）—— 半透明颜色无法直接计算对比度');
    }
    return {
      r: Number.parseInt(digits.slice(0, 2), 16),
      g: Number.parseInt(digits.slice(2, 4), 16),
      b: Number.parseInt(digits.slice(4, 6), 16),
    };
  }

  const functional = /^rgba?\(([^)]+)\)$/.exec(value);
  if (functional) {
    const parts = (functional[1] ?? '')
      .split(/[\s,/]+/)
      .map((part) => part.trim())
      .filter((part) => part !== '');
    const [r, g, b, alpha] = parts;
    if (r !== undefined && g !== undefined && b !== undefined) {
      if (alpha !== undefined && alpha !== '1') {
        throw new TokenError(label + ' 带半透明（' + value + '）—— 半透明颜色无法直接计算对比度');
      }
      return {
        r: clampChannel(Number.parseFloat(r)),
        g: clampChannel(Number.parseFloat(g)),
        b: clampChannel(Number.parseFloat(b)),
      };
    }
  }

  throw new TokenError(label + ' 的颜色值 "' + raw.trim() + '" 解析不了（只支持 #hex / rgb() / 具名黑白）');
}

/** 按顶层逗号切分，color-mix() 的参数里含逗号。 */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts.map((part) => part.trim()).filter((part) => part !== '');
}

/**
 * color-mix(in srgb, A p%, B) —— 只支持不透明色。
 * 中性色的 hover / active 实心档就是靠它做出来的，所以这里必须真算，不能跳过。
 */
function evaluateColorMix(value: string, scoped: Map<string, Decl>, chain: string[], label: string): Rgb {
  const inner = value.slice(value.indexOf('(') + 1, value.lastIndexOf(')'));
  const parts = splitTopLevel(inner);
  const space = (parts[0] ?? '').toLowerCase();
  if (!/^in\s+srgb$/.test(space)) {
    throw new TokenError(label + ' 的 color-mix 用了不支持的色彩空间（' + space + '），只支持 in srgb');
  }

  const operands = parts.slice(1);
  if (operands.length !== 2) {
    throw new TokenError(label + ' 的 color-mix 参数个数不对：' + value);
  }

  const parsed = operands.map((operand) => {
    const matched = /^(.*?)\s*([\d.]+)%$/.exec(operand);
    const colorText = matched ? (matched[1] ?? '') : operand;
    const weightText = matched ? matched[2] : undefined;
    return {
      rgb: evaluateValue(colorText, scoped, chain, label),
      weight: weightText === undefined ? null : Number.parseFloat(weightText),
    };
  });

  const first = parsed[0];
  const second = parsed[1];
  if (!first || !second) throw new TokenError(label + ' 的 color-mix 缺少操作数：' + value);

  let ratio: number;
  if (first.weight !== null && second.weight !== null) ratio = first.weight / (first.weight + second.weight);
  else if (first.weight !== null) ratio = first.weight / 100;
  else if (second.weight !== null) ratio = 1 - second.weight / 100;
  else ratio = 0.5;

  return {
    r: clampChannel(first.rgb.r * ratio + second.rgb.r * (1 - ratio)),
    g: clampChannel(first.rgb.g * ratio + second.rgb.g * (1 - ratio)),
    b: clampChannel(first.rgb.b * ratio + second.rgb.b * (1 - ratio)),
  };
}

function evaluateValue(raw: string, scoped: Map<string, Decl>, chain: string[], label: string): Rgb {
  const value = raw.trim().replace(/!important$/i, '').trim();

  const varCall = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(value);
  if (varCall) {
    const name = varCall[1] ?? '';
    const fallback = varCall[2];
    const decl = scoped.get(name);
    if (!decl) {
      if (fallback !== undefined && fallback.trim() !== '') return evaluateValue(fallback, scoped, chain, label);
      throw new TokenError(label + ' 引用的 ' + name + ' 在当前作用域没有定义（变量链断了）');
    }
    if (chain.includes(name)) {
      throw new TokenError(label + ' 出现变量循环引用：' + [...chain, name].join(' -> '));
    }
    return evaluateValue(decl.value, scoped, [...chain, name], label);
  }

  if (/^color-mix\(/i.test(value)) return evaluateColorMix(value, scoped, chain, label);

  if (/gradient\(/i.test(value)) {
    throw new TokenError(label + ' 的值是渐变（' + value + '）—— 渐变背景不能当作单色算对比度');
  }

  return parseColor(value, label);
}

interface Resolved {
  name: string;
  rgb: Rgb;
}

/**
 * 依次尝试候选变量名，取第一个存在的。
 * 之所以给多个候选：契约只规定「存在 solid 三档」，没规定 hover 是
 * -solid-hover 还是 -hover-solid。命名换过也不会误报，但变量真缺了一定报。
 */
function resolveFirst(candidates: readonly string[], scoped: Map<string, Decl>, label: string, state: Scene): Resolved {
  for (const name of candidates) {
    const decl = scoped.get(name);
    if (!decl) continue;
    return {
      name,
      rgb: evaluateValue(decl.value, scoped, [name], name + '（' + scopeLabel(state) + '，tokens.css:' + decl.line + '）'),
    };
  }

  throw new TokenError(
    scopeLabel(state) + ' · ' + label + '：候选变量 ' + candidates.join(' / ') + ' 在 tokens.css 里一个都找不到。' +
      '\n如果是新契约还没落地，这就是「值未就绪」；如果变量改名了，请同步 solid-contrast.test.ts 的候选清单。',
  );
}

function tierNames(prefix: string, tier: Tier): string[] {
  if (tier === 'solid') return [prefix + '-solid'];
  const side = tier === 'solid-hover' ? 'hover' : 'active';
  return [prefix + '-solid-' + side, prefix + '-' + side + '-solid'];
}

function accentNames(role: string, tier: Tier): string[] {
  return [...tierNames('--oui-accent-' + role, tier), ...tierNames('--oui-color-accent-' + role, tier)];
}

// ---------------------------------------------------------------- WCAG

/** sRGB 单通道线性化（WCAG 2.x 相对亮度）。 */
function linearize(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: Rgb): number {
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

function contrastRatio(foreground: Rgb, background: Rgb): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function toHex(color: Rgb): string {
  const channel = (value: number): string => clampChannel(value).toString(16).padStart(2, '0').toUpperCase();
  return '#' + channel(color.r) + channel(color.g) + channel(color.b);
}

/**
 * 核心断言：背景变量 + 文字变量算对比度，失败时把变量名、实际色值、实际比值全打出来，
 * 而不是只丢一个 expect(false)。
 */
function expectReadable(
  state: Scene,
  scoped: Map<string, Decl>,
  background: readonly string[],
  foreground: readonly string[],
  label: string,
): void {
  const back = resolveFirst(background, scoped, label + ' 的背景', state);
  const front = resolveFirst(foreground, scoped, label + ' 的文字色', state);
  const ratio = contrastRatio(front.rgb, back.rgb);

  const message =
    scopeLabel(state) + ' · ' + label + ' 对比度不足：' +
    '文字 ' + front.name + ' = ' + toHex(front.rgb) + '，背景 ' + back.name + ' = ' + toHex(back.rgb) + '，' +
    '实测 ' + ratio.toFixed(3) + ':1，要求 >= ' + MIN_CONTRAST + ':1。' +
    '（实心档只会越调越深：把 ' + back.name + ' 压深一档，或把该档的 solid 值换掉）';

  expect(ratio, message).toBeGreaterThanOrEqual(MIN_CONTRAST - FLOAT_EPSILON);
}

const ON_SOLID = '--oui-color-on-solid';

/** 每个作用域都解析一次，拿到「按层叠合并好的变量表」供后续断言复用。 */
function sceneScope(state: Scene): Map<string, Decl> {
  return buildScope({ theme: state.theme, scheme: state.scheme });
}

// ---------------------------------------------------------------- 测试

describe('tokens.css · 实心色档压白字的对比度契约（v0.2.0）', () => {
  describe('解析器自检：先保证红灯是真红，不是解析器自己坏了', () => {
    it('能按作用域解析出足够的变量声明', () => {
      expect(RULES.length, 'tokens.css 里连 10 条规则都解析不到，解析器坏了').toBeGreaterThan(10);
      const orange = sceneScope({ theme: 'orange', scheme: 'light', title: '' });
      expect(orange.size, '亮色作用域合并出来的变量少于 100 个，解析器坏了').toBeGreaterThan(100);
    });

    it('WCAG 亮度公式与公认数值一致（黑/白 = 21:1，中性灰 #767676 压白 ≈ 4.54）', () => {
      const black = parseColor('#000000', '黑');
      const white = parseColor('#FFFFFF', '白');
      const grey = parseColor('#767676', '灰');
      expect(contrastRatio(black, white), '黑压白必须是 21:1，否则线性化公式写错了').toBeCloseTo(21, 5);
      expect(contrastRatio(grey, white), '#767676 压白是 WCAG 计算器的标准参照值 4.54').toBeCloseTo(4.54, 1);
    });

    it('层叠顺序生效：暗色覆盖亮色，后面的主题覆盖 :root', () => {
      const orangeLight: Scene = { theme: 'orange', scheme: 'light', title: '' };
      const orangeDark: Scene = { theme: 'orange', scheme: 'dark', title: '' };
      const violetLight: Scene = { theme: 'violet', scheme: 'light', title: '' };

      const lightText = resolveFirst(['--oui-color-text'], sceneScope(orangeLight), '正文字色', orangeLight);
      const darkText = resolveFirst(['--oui-color-text'], sceneScope(orangeDark), '正文字色', orangeDark);
      expect(toHex(lightText.rgb), '亮色正文 #27254C 没解析对，说明 :root 作用域没读到').toBe('#27254C');
      expect(toHex(darkText.rgb), '暗色正文 #F2F3F8 没解析对，说明 [data-oui-scheme="dark"] 没命中').toBe('#F2F3F8');

      const orangePrimary = resolveFirst(['--oui-color-primary'], sceneScope(orangeLight), '主色', orangeLight);
      const violetPrimary = resolveFirst(['--oui-color-primary'], sceneScope(violetLight), '主色', violetLight);
      expect(toHex(orangePrimary.rgb), 'orange 主色 #F26B21 没解析对').toBe('#F26B21');
      expect(toHex(violetPrimary.rgb), 'violet 主色 #624AFF 没解析对，说明后面的主题没覆盖 :root').toBe('#624AFF');
    });
  });

  describe('变量存在性：solid 三档必须真的定义出来', () => {
    it.each(SCENES)('$title 下实心色与 on-* 变量齐备', (scene) => {
      const scoped = sceneScope(scene);
      const groups: Array<{ label: string; candidates: string[] }> = [];

      for (const tier of TIERS) {
        groups.push({ label: 'primary ' + tier, candidates: tierNames('--oui-color-primary', tier) });
      }
      for (const role of SEMANTIC_ROLES) {
        for (const tier of TIERS) {
          groups.push({ label: role + ' ' + tier, candidates: tierNames('--oui-color-' + role, tier) });
        }
      }
      for (const role of ACCENT_ROLES) {
        for (const tier of TIERS) {
          groups.push({ label: 'accent-' + role + ' ' + tier, candidates: accentNames(role, tier) });
        }
      }
      for (const tier of TIERS) {
        groups.push({ label: 'neutral ' + tier, candidates: ['--oui-color-neutral-' + tier] });
      }
      groups.push({ label: 'on-neutral', candidates: ['--oui-color-on-neutral'] });
      groups.push({ label: 'on-solid', candidates: [ON_SOLID] });
      groups.push({ label: 'on-primary', candidates: ['--oui-color-on-primary'] });
      groups.push({ label: 'on-accent', candidates: ['--oui-color-on-accent'] });
      for (const role of SEMANTIC_ROLES) {
        groups.push({ label: 'on-' + role, candidates: ['--oui-color-on-' + role] });
      }

      const missing = groups
        .filter((group) => !group.candidates.some((name) => scoped.has(name)))
        .map((group) => group.label + '（试过 ' + group.candidates.join(' / ') + '）');

      expect(
        missing,
        scopeLabel(scene) + ' 作用域缺这些变量：\n  ' + missing.join('\n  ') +
          '\n如果整批都缺，说明 solid 档还没写进 tokens.css（值未就绪）；只缺个别则可能是改名。',
      ).toEqual([]);
    });
  });

  describe('primary 实心三档 x 白字', () => {
    it.each(SCENES)('$title：primary solid / hover / active 都能承载白字', (scene) => {
      const scoped = sceneScope(scene);
      for (const tier of TIERS) {
        expectReadable(scene, scoped, tierNames('--oui-color-primary', tier), [ON_SOLID], 'primary ' + tier);
      }
    });
  });

  describe('语义色实心三档 x 白字', () => {
    it.each(SEMANTIC_SCENES)('$title：solid / hover / active 都能承载白字', (scene) => {
      const scoped = sceneScope(scene);
      for (const tier of TIERS) {
        expectReadable(scene, scoped, tierNames('--oui-color-' + scene.role, tier), [ON_SOLID], scene.role + ' ' + tier);
      }
    });
  });

  describe('装饰色实心三档 x 白字', () => {
    it.each(ACCENT_SCENES)('$title：solid / hover / active 都能承载白字', (scene) => {
      const scoped = sceneScope(scene);
      for (const tier of TIERS) {
        expectReadable(scene, scoped, accentNames(scene.role, tier), [ON_SOLID], 'accent-' + scene.role + ' ' + tier);
      }
    });
  });

  describe('实心背景上的字只有一种取值：--oui-color-on-solid = #FFFFFF', () => {
    it.each(SCENES)('$title：on-solid 及其全部别名都解析为纯白', (scene) => {
      const scoped = sceneScope(scene);
      const onSolid = resolveFirst([ON_SOLID], scoped, 'on-solid', scene);
      expect(
        toHex(onSolid.rgb),
        scopeLabel(scene) + ' 的 ' + ON_SOLID + ' 是 ' + toHex(onSolid.rgb) + '，实心档上的字必须是 #FFFFFF',
      ).toBe(WHITE);

      const aliases = [
        '--oui-color-on-primary',
        '--oui-color-on-success',
        '--oui-color-on-warning',
        '--oui-color-on-danger',
        '--oui-color-on-info',
        '--oui-color-on-accent',
      ];
      for (const alias of aliases) {
        const resolved = resolveFirst([alias], scoped, alias, scene);
        expect(
          toHex(resolved.rgb),
          scopeLabel(scene) + ' 的 ' + alias + ' 解析为 ' + toHex(resolved.rgb) + '，必须与 ' + ON_SOLID + '（#FFFFFF）同源',
        ).toBe(WHITE);
      }
    });

    it.each(SCENES)('$title：on-primary 的有效值等于 on-solid（允许写成 var() 别名）', (scene) => {
      const scoped = sceneScope(scene);
      const onSolid = resolveFirst([ON_SOLID], scoped, 'on-solid', scene);
      const onPrimary = resolveFirst(['--oui-color-on-primary'], scoped, 'on-primary', scene);
      expect(
        toHex(onPrimary.rgb),
        scopeLabel(scene) + ' 的 on-primary = ' + toHex(onPrimary.rgb) + '（来自 ' + onPrimary.name + '），' +
          'on-solid = ' + toHex(onSolid.rgb) + '；两者必须相等，否则 primary 实心档会出现第二种文字色',
      ).toBe(toHex(onSolid.rgb));
    });
  });

  describe('中性色的例外：反转配色，同样要 >= 4.5', () => {
    it.each(SCENES)('$title：neutral solid 三档上的 on-neutral 可读', (scene) => {
      const scoped = sceneScope(scene);
      // 亮色 = 深底白字；暗色 = 浅底深字。中性色不参与「一律白字」，
      // 但它仍然是一个实心背景（Button solid neutral / Avatar 回退底色），对比度红线一样要过。
      expectReadable(scene, scoped, ['--oui-color-neutral-solid', '--oui-color-neutral'], ['--oui-color-on-neutral'], 'neutral solid');
      expectReadable(scene, scoped, ['--oui-color-neutral-solid-hover'], ['--oui-color-on-neutral'], 'neutral solid-hover');
      expectReadable(scene, scoped, ['--oui-color-neutral-solid-active'], ['--oui-color-on-neutral'], 'neutral solid-active');
    });
  });
});
