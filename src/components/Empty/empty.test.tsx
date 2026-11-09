'use client';

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Empty } from './empty';

describe('Empty', () => {
  it('默认标题是「暂无数据」，并渲染内置插画', () => {
    const { container } = render(<Empty />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
    expect(container.querySelector('.oui-empty__glyph')).not.toBeNull();
  });

  it('title / description / action 结构齐全', () => {
    const { container } = render(
      <Empty title="暂无收藏" description="收藏的模型会显示在这里" action={<button type="button">去逛逛</button>} />,
    );
    expect(container.querySelector('.oui-empty__title')).toHaveTextContent('暂无收藏');
    expect(container.querySelector('.oui-empty__description')).toHaveTextContent('收藏的模型会显示在这里');
    expect(container.querySelector('.oui-empty__action')).toContainElement(screen.getByRole('button'));
  });

  it('没有描述和操作时不渲染对应区域', () => {
    const { container } = render(<Empty />);
    expect(container.querySelector('.oui-empty__description')).toBeNull();
    expect(container.querySelector('.oui-empty__action')).toBeNull();
  });

  it('自定义 icon 替换默认插画', () => {
    const { container } = render(<Empty icon={<span data-testid="my-icon" />} />);
    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
    expect(container.querySelector('.oui-empty__glyph')).toBeNull();
  });

  it('size 走 data-size，图形对读屏隐藏', () => {
    const { container, rerender } = render(<Empty size="lg" />);
    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg');

    const iconBox = container.querySelector('.oui-empty__icon') as HTMLElement;
    expect(iconBox).toHaveAttribute('aria-hidden', 'true');

    rerender(<Empty size="sm" />);
    expect(container.firstElementChild).toHaveAttribute('data-size', 'sm');
  });

  it('ref 是普通 prop，直接指向根节点', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Empty
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it('透传 className 与其余属性', () => {
    const { container } = render(<Empty className="custom" data-testid="empty" />);
    expect(container.firstElementChild).toHaveClass('oui-empty', 'custom');
    expect(container.firstElementChild).toHaveAttribute('data-testid', 'empty');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Empty />
        <Empty title="暂无结果" description="换个关键词试试" action={<button type="button">重置</button>} />
        <Empty size="lg" title="还没有应用" description="从模板开始" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
