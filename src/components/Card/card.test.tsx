'use client';

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Card } from './card';

describe('Card', () => {
  it('渲染主体内容，并带上形态与内边距的 data 属性', () => {
    const { container } = render(<Card>内容</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(screen.getByText('内容')).toBeInTheDocument();
    expect(card).toHaveClass('oui-card');
    expect(card).toHaveAttribute('data-variant', 'outlined');
    expect(card).toHaveAttribute('data-padding', 'md');
  });

  it('header / footer / cover 各自渲染成对应区域', () => {
    const { container } = render(
      <Card cover={<span>封面图</span>} header="标题" footer="页脚">
        主体
      </Card>,
    );
    expect(container.querySelector('.oui-card__cover')).toContainElement(screen.getByText('封面图'));
    expect(container.querySelector('.oui-card__header')).toHaveTextContent('标题');
    expect(container.querySelector('.oui-card__footer')).toHaveTextContent('页脚');
    expect(container.querySelector('.oui-card__body')).toHaveTextContent('主体');
  });

  it('没有 onClick 时不是可交互元素', () => {
    const { container } = render(<Card>内容</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
  });

  it('有 onClick 时变成可点击容器，键盘 Enter / Space 都能触发', async () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>可点击</Card>);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('data-clickable');

    await userEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);

    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);

    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('hoverable 只加视觉标记，不改变语义', () => {
    const { container } = render(<Card hoverable>内容</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveAttribute('data-hoverable');
    expect(card).not.toHaveAttribute('role');
  });

  it('loading 时显示骨架、标记 aria-busy，且不可点击', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Card loading cover={<span>封面</span>} onClick={onClick}>
        真实内容
      </Card>,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('真实内容')).toBeNull();
    expect(container.querySelectorAll('.oui-card__placeholder-line').length).toBeGreaterThan(0);
    expect(container.querySelector('.oui-card__placeholder-cover')).not.toBeNull();
    expect(card).not.toHaveAttribute('role');

    await userEvent.click(card);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('ref 是普通 prop，直接指向根节点', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Card
        ref={(el) => {
          node = el;
        }}
      >
        内容
      </Card>,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Card header="标题" footer="页脚">
          普通卡片
        </Card>
        <Card variant="elevated" hoverable onClick={() => {}}>
          可点击卡片
        </Card>
        <Card loading>加载中的卡片</Card>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
