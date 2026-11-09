'use client';

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('没有 label 时对读屏隐藏', () => {
    const { container } = render(<Spinner />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('有 label 时是 role=status，并显示文字', () => {
    render(<Spinner label="加载中…" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('加载中…');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).not.toHaveAttribute('aria-hidden');
  });

  it('尺寸既落到 data-size，也传给内部 glyph', () => {
    const { container, rerender } = render(<Spinner size="lg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');

    const glyph = container.querySelector('.oui-spinner-glyph') as SVGElement;
    expect(glyph.getAttribute('width')).toBe('24');

    rerender(<Spinner size="xs" />);
    expect((container.querySelector('.oui-spinner-glyph') as SVGElement).getAttribute('width')).toBe('12');
  });

  it('inline / overlay / color 走 data 属性', () => {
    const { container } = render(<Spinner inline overlay color="danger" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-inline');
    expect(root).toHaveAttribute('data-overlay');
    expect(root).toHaveAttribute('data-color', 'danger');
  });

  it('复用内部 glyph，不重复画 SVG', () => {
    const { container } = render(<Spinner />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(1);
    expect(svgs[0]).toHaveClass('oui-spinner-glyph');
    expect(svgs[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('ref 是普通 prop，直接指向根节点', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Spinner
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it('透传 className 与其余属性', () => {
    const { container } = render(<Spinner className="custom" data-testid="sp" />);
    expect(container.firstElementChild).toHaveClass('oui-spinner', 'custom');
    expect(container.firstElementChild).toHaveAttribute('data-testid', 'sp');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Spinner size="sm" label="加载中…" />
        <Spinner size="lg" color="danger" label="保存失败重试中" />
        <div style={{ position: 'relative', height: 80 }}>
          <Spinner overlay label="刷新中…" />
        </div>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
