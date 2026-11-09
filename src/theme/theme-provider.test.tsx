import { describe, expect, it } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';
import { contrastRatio, parseColor, WHITE } from '../utils/color';

/**
 * 自定义品牌色的闭环：只给一个 primary，实心按钮也必须拿到「白字 ≥4.5:1」的底。
 * 这是 0.2.0 之前不存在的保证——那时实心档写死在 tokens.css，自定义色会串回默认主题。
 */
function solidOf(element: HTMLElement): string {
  return element.style.getPropertyValue('--oui-color-primary-solid');
}

function assertContrast(hex: string): void {
  const rgb = parseColor(hex);
  expect(rgb, '派生出来的实心档必须是可解析的颜色：' + hex).not.toBeNull();
  if (!rgb) return;
  expect(contrastRatio(rgb, WHITE)).toBeGreaterThanOrEqual(4.5);
}

describe('ThemeProvider 自定义品牌色', () => {
  it('只给 primary 时自动派生实心档与 hover / active', () => {
    const { container } = render(
      <ThemeProvider primary="#0EA5E9">
        <span />
      </ThemeProvider>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--oui-color-primary')).toBe('#0EA5E9');
    assertContrast(solidOf(root));
    expect(root.style.getPropertyValue('--oui-color-primary-solid-hover')).not.toBe('');
    expect(root.style.getPropertyValue('--oui-color-primary-solid-active')).not.toBe('');
    cleanup();
  });

  it('primary 本身已达标时实心档就是原色（不无谓压深）', () => {
    const { container } = render(
      <ThemeProvider primary="#624AFF">
        <span />
      </ThemeProvider>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(solidOf(root)).toBe('#624AFF');
    cleanup();
  });

  it('显式给 primarySolid 时优先用它', () => {
    const { container } = render(
      <ThemeProvider primary="#0EA5E9" primarySolid="#0378B4">
        <span />
      </ThemeProvider>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(solidOf(root)).toBe('#0378B4');
    cleanup();
  });

  it('什么都不给时不写任何颜色变量（完全交给主题）', () => {
    const { container } = render(
      <ThemeProvider>
        <span />
      </ThemeProvider>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(solidOf(root)).toBe('');
    expect(root.style.getPropertyValue('--oui-color-primary')).toBe('');
    cleanup();
  });

  it('无法解析的颜色（CSS 变量名）不写实心档，不瞎猜', () => {
    const { container } = render(
      <ThemeProvider primary="var(--brand)">
        <span />
      </ThemeProvider>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(solidOf(root)).toBe('');
    cleanup();
  });

  it('global 模式写到 documentElement，卸载时清干净', () => {
    const { unmount } = render(
      <ThemeProvider global primary="#F26B21">
        <span />
      </ThemeProvider>,
    );
    const solid = document.documentElement.style.getPropertyValue('--oui-color-primary-solid');
    assertContrast(solid);
    expect(document.documentElement.getAttribute('data-oui-theme')).toBe('orange');
    unmount();
    expect(document.documentElement.style.getPropertyValue('--oui-color-primary-solid')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--oui-color-primary')).toBe('');
  });
});
