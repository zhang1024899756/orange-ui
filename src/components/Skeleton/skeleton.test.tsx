'use client';

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('独立使用时对读屏隐藏', () => {
    const { container } = render(<Skeleton variant="rect" />);
    const root = container.querySelector('.oui-skeleton');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveAttribute('data-variant', 'rect');
  });

  it('text 多行按 lines 渲染，末行标记为 partial', () => {
    const { container } = render(<Skeleton variant="text" lines={4} />);
    const bars = container.querySelectorAll('.oui-skeleton__bar');
    expect(bars).toHaveLength(4);
    expect(bars[3]).toHaveAttribute('data-partial', '');
    expect(bars[0]).not.toHaveAttribute('data-partial');
  });

  it('lines 小于 1 时至少渲染一行，且单行不加 partial', () => {
    const { container, rerender } = render(<Skeleton variant="text" lines={0} />);
    expect(container.querySelectorAll('.oui-skeleton__bar')).toHaveLength(1);

    rerender(<Skeleton variant="text" lines={1} />);
    expect(container.querySelector('.oui-skeleton__bar')).not.toHaveAttribute('data-partial');
  });

  it('非 text 形态只有一块骨块', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.querySelectorAll('.oui-skeleton__bar')).toHaveLength(1);
  });

  it('width / height 数字按 px 落到行内样式', () => {
    const { container } = render(<Skeleton variant="rect" width={200} height="auto" />);
    const bar = container.querySelector('.oui-skeleton__bar') as HTMLElement;
    expect(bar.style.width).toBe('200px');
    expect(bar.style.height).toBe('auto');
  });

  it('animated 默认开启，关闭后去掉标记', () => {
    const { container, rerender } = render(<Skeleton />);
    expect(container.querySelector('.oui-skeleton')).toHaveAttribute('data-animated');

    rerender(<Skeleton animated={false} />);
    expect(container.querySelector('.oui-skeleton')).not.toHaveAttribute('data-animated');
  });

  it('包裹模式：loading 显示骨架并标记 aria-busy，非 loading 渲染 children', () => {
    const { container, rerender } = render(
      <Skeleton loading>
        <span>真实内容</span>
      </Skeleton>,
    );
    const root = container.querySelector('.oui-skeleton') as HTMLElement;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('真实内容')).toBeNull();

    rerender(
      <Skeleton loading={false}>
        <span>真实内容</span>
      </Skeleton>,
    );
    expect(root).not.toHaveAttribute('aria-busy');
    expect(screen.getByText('真实内容')).toBeInTheDocument();
    expect(container.querySelector('.oui-skeleton__bar')).toBeNull();
  });

  it('ref 是普通 prop，直接指向根节点', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Skeleton
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it('透传 className 与其余属性', () => {
    const { container } = render(<Skeleton className="custom" data-testid="sk" />);
    const root = container.querySelector('.oui-skeleton') as HTMLElement;
    expect(root).toHaveClass('oui-skeleton', 'custom');
    expect(root).toHaveAttribute('data-testid', 'sk');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Skeleton variant="text" lines={3} />
        <Skeleton variant="circle" />
        <Skeleton loading>
          <p>加载完成后显示的内容</p>
        </Skeleton>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
