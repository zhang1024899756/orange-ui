import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  deriveSolidColor,
  mixBlack,
  parseColor,
  relativeLuminance,
  toHex,
  WHITE,
} from './color';

/**
 * 这里守的是「自定义品牌色 → 实心档」这一条运行时链路。
 * 静态令牌由 solid-contrast.test.ts 守；本文件管的是 ThemeProvider 现算的那部分。
 */
describe('parseColor', () => {
  it('解析 6 位 / 3 位 hex、rgb()、具名黑白', () => {
    expect(parseColor('#F26B21')).toEqual({ r: 242, g: 107, b: 33 });
    expect(parseColor('#f26b21')).toEqual({ r: 242, g: 107, b: 33 });
    expect(parseColor('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('rgb(14, 147, 132)')).toEqual({ r: 14, g: 147, b: 132 });
    expect(parseColor('rgb(14 147 132)')).toEqual({ r: 14, g: 147, b: 132 });
    expect(parseColor('white')).toEqual(WHITE);
    expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('不是颜色就返回 null（CSS 变量名、空串、乱写）', () => {
    expect(parseColor('var(--oui-color-primary)')).toBeNull();
    expect(parseColor('')).toBeNull();
    expect(parseColor('transparent')).toBeNull();
    expect(parseColor('rebeccapurple')).toBeNull();
  });
});

describe('对比度', () => {
  it('黑白是 21:1，同色是 1:1', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, WHITE)).toBeCloseTo(21, 5);
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5);
  });

  it('与令牌里的实测值对齐（#F26B21 压白 3.04）', () => {
    expect(contrastRatio({ r: 242, g: 107, b: 33 }, WHITE)).toBeCloseTo(3.04, 1);
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 5);
  });
});

describe('deriveSolidColor', () => {
  it('已经达标的颜色原样返回（violet #624AFF 是 5.33）', () => {
    expect(deriveSolidColor('#624AFF')).toBe('#624AFF');
  });

  it('压到刚好 >= 4.5:1，且色相不变（蜜橘仍偏橙，不会变灰）', () => {
    const solid = deriveSolidColor('#F26B21');
    expect(solid).not.toBeNull();
    const rgb = parseColor(solid ?? '');
    expect(rgb).not.toBeNull();
    if (!rgb) return;
    expect(contrastRatio(rgb, WHITE)).toBeGreaterThanOrEqual(4.5);
    // 橙色：R 明显大于 G 大于 B
    expect(rgb.r).toBeGreaterThan(rgb.g);
    expect(rgb.g).toBeGreaterThan(rgb.b);
    // 不会压得过头（>8:1 说明降太狠了）
    expect(contrastRatio(rgb, WHITE)).toBeLessThan(8);
  });

  it('自定义品牌色 #0EA5E9 会得到一条白字达标的深一档', () => {
    const solid = deriveSolidColor('#0EA5E9');
    const rgb = parseColor(solid ?? '');
    expect(rgb).not.toBeNull();
    if (!rgb) return;
    expect(contrastRatio(rgb, WHITE)).toBeGreaterThanOrEqual(4.5);
  });

  it('深色本身也能处理：黑色返回黑色', () => {
    expect(deriveSolidColor('#000000')).toBe('#000000');
  });

  it('解析不了就返回 null，不猜', () => {
    expect(deriveSolidColor('var(--oui-color-primary)')).toBeNull();
  });
});

describe('mixBlack', () => {
  it('按比例压暗，保持 hex 大小写与长度', () => {
    expect(mixBlack('#C74F0A', 0.92)).toBe('#B74909');
    expect(mixBlack('#FFFFFF', 0.5)).toBe('#808080');
    expect(mixBlack('nope', 0.9)).toBeNull();
  });

  it('与 tokens.css 里写死的 hover / active 一致（这就是那两档的算法）', () => {
    expect(mixBlack('#C74F0A', 0.92)).toBe('#B74909');
    expect(mixBlack('#C74F0A', 0.86)).toBe('#AB4409');
    expect(mixBlack('#0C8376', 0.92)).toBe('#0B796D');
  });
});

describe('toHex', () => {
  it('补零并大写', () => {
    expect(toHex({ r: 5, g: 123, b: 185 })).toBe('#057BB9');
  });
});
