/**
 * 颜色工具。只服务于「实心档派生」这一件事，不是通用色彩库：
 * 组件库的令牌全部是明文值，唯一的运行时要算颜色场景是
 * 「调用方给了自定义品牌色 → 实心按钮该用哪一档深色」。
 *
 * 判据与 tokens.css 一致：白色文字对比度 >= 4.5:1（WCAG 2.x AA）。
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX6 = /^#([0-9a-f]{6})$/i;
const HEX3 = /^#([0-9a-f]{3})$/i;
const RGB_FN = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i;

export const WHITE: Rgb = { r: 255, g: 255, b: 255 };

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

/** 解析 #rgb / #rrggbb / rgb() / rgba()（忽略 alpha，只取色相）/ white / black。失败返回 null。 */
export function parseColor(input: string): Rgb | null {
  const value = input.trim();
  if (value === '') return null;

  const hex6 = HEX6.exec(value);
  if (hex6?.[1]) {
    const digits = hex6[1];
    return {
      r: Number.parseInt(digits.slice(0, 2), 16),
      g: Number.parseInt(digits.slice(2, 4), 16),
      b: Number.parseInt(digits.slice(4, 6), 16),
    };
  }

  const hex3 = HEX3.exec(value);
  if (hex3?.[1]) {
    const digits = hex3[1];
    const pick = (index: number): number => {
      const char = digits[index] ?? '0';
      return Number.parseInt(char + char, 16);
    };
    return { r: pick(0), g: pick(1), b: pick(2) };
  }

  const fn = RGB_FN.exec(value);
  if (fn?.[1] !== undefined && fn[2] !== undefined && fn[3] !== undefined) {
    return {
      r: clampChannel(Number.parseFloat(fn[1])),
      g: clampChannel(Number.parseFloat(fn[2])),
      b: clampChannel(Number.parseFloat(fn[3])),
    };
  }

  if (/^white$/i.test(value)) return WHITE;
  if (/^black$/i.test(value)) return { r: 0, g: 0, b: 0 };

  return null;
}

export function toHex({ r, g, b }: Rgb): string {
  const part = (value: number): string => clampChannel(value).toString(16).padStart(2, '0').toUpperCase();
  return '#' + part(r) + part(g) + part(b);
}

/** WCAG 2.x 相对亮度（sRGB 线性化后加权）。 */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** 对比度，1–21。参数顺序无关。 */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

function rgbToHsl({ r, g, b }: Rgb): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return [0, 0, lightness];

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  if (max === rn) hue = (gn - bn) / delta + (gn < bn ? 6 : 0);
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;

  return [hue * 60, saturation, lightness];
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const h = ((hue % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: clampChannel((r + m) * 255),
    g: clampChannel((g + m) * 255),
    b: clampChannel((b + m) * 255),
  };
}

/**
 * 把任意强调色派生成「实心档」：保持色相与饱和度，逐步降低明度，
 * 直到白色文字对比度 >= minContrast。已经达标的颜色原样返回。
 *
 * 返回 null 表示这个字符串不是可解析的颜色（例如 CSS 变量名），调用方应保持不设置。
 */
export function deriveSolidColor(color: string, minContrast = 4.5): string | null {
  const base = parseColor(color);
  if (!base) return null;

  if (contrastRatio(base, WHITE) >= minContrast) return toHex(base);

  const [hue, saturation, lightness] = rgbToHsl(base);
  // 步长 0.004：从原明度往下最多 250 次，开销在微秒级，结果与原色视觉上连续。
  for (let step = 1; step <= 250; step += 1) {
    const candidateLightness = lightness - step * 0.004;
    if (candidateLightness < 0) break;
    const candidate = hslToRgb(hue, saturation, candidateLightness);
    if (contrastRatio(candidate, WHITE) >= minContrast) return toHex(candidate);
  }

  return '#000000';
}

/** 与黑色混合，keep 是保留原色的比例（0.92 = 压暗 8%）。用于实心档的 hover / active。 */
export function mixBlack(color: string, keep: number): string | null {
  const base = parseColor(color);
  if (!base) return null;
  const ratio = Math.min(1, Math.max(0, keep));
  return toHex({
    r: clampChannel(base.r * ratio),
    g: clampChannel(base.g * ratio),
    b: clampChannel(base.b * ratio),
  });
}
