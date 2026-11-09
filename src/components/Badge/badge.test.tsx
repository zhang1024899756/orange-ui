'use client';

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Badge } from './badge';

describe('Badge', () => {
  it('渲染计数值，并给出默认读屏文案', () => {
    render(<Badge count={3} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '3 条未读');
    expect(screen.getByRole('img')).toHaveTextContent('3');
  });

  it('超过 max 显示 max+', () => {
    const { rerender } = render(<Badge count={100} />);
    expect(screen.getByRole('img')).toHaveTextContent('99+');

    rerender(<Badge count={520} max={999} />);
    expect(screen.getByRole('img')).toHaveTextContent('520');
  });

  it('dot 模式是纯圆点，读屏仍有说明', () => {
    const { container } = render(<Badge dot />);
    const bubble = container.querySelector('.oui-badge__bubble') as HTMLElement;
    expect(bubble).toHaveAttribute('data-kind', 'dot');
    expect(bubble).toBeEmptyDOMElement();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '有未读内容');
  });

  it('content 文字徽章直接可读，不再套 role=img', () => {
    render(<Badge content="NEW" />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('count=0 默认不显示，showZero 时显示', () => {
    const { rerender, container } = render(<Badge count={0} />);
    expect(container.querySelector('.oui-badge__bubble')).toBeNull();

    rerender(<Badge count={0} showZero />);
    expect(screen.getByRole('img')).toHaveTextContent('0');
  });

  it('有 children 时绝对定位到右上角，无 children 时独立显示', () => {
    const { container, rerender } = render(
      <Badge count={1}>
        <span>收件箱</span>
      </Badge>,
    );
    expect(screen.getByText('收件箱')).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute('data-standalone');

    rerender(<Badge count={1} />);
    expect(container.firstElementChild).toHaveAttribute('data-standalone');
  });

  it('label 覆盖默认读屏文案，offset 落到 CSS 变量', () => {
    const { container } = render(<Badge count={3} label="3 条新回复" offset={[4, -2]} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '3 条新回复');

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--oui-badge-offset-x')).toBe('4px');
    expect(root.style.getPropertyValue('--oui-badge-offset-y')).toBe('-2px');
  });

  it('ref 是普通 prop，直接指向根节点', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Badge
        count={1}
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Badge count={3} />
        <Badge dot color="danger" />
        <Badge content="BETA" color="warning" />
        <Badge count={12}>
          <button type="button">消息</button>
        </Badge>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
