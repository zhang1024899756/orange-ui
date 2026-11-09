import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * CSS 层面的回归守卫。
 *
 * 起因：Progress 曾写过 `--oui-progress-h: var(--oui-progress-h)`。
 * 自定义属性自引用成环后计算值变成 invalid，height 退化成 auto，
 * 线形进度条整条高度为 0 —— 而 jsdom 不解析 CSS 文件，单元测试抓不到，
 * 真机上才会暴露。这里用静态扫描把它挡在提交前。
 */

const SRC = join(process.cwd(), 'src');

function collectCss(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      collectCss(full, acc);
    } else if (entry.name.endsWith('.css')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('CSS 自定义属性完整性', () => {
  const files = collectCss(SRC);

  it('至少扫描到所有样式文件', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('没有自引用的自定义属性（--x: … var(--x) …）', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      const declarations = source.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g);

      for (const [, name, value] of declarations) {
        if (!name || !value) continue;
        if (value.includes(`var(${name})`)) {
          offenders.push(`${file.replace(SRC, 'src')} → ${name}: ${value.trim()}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
