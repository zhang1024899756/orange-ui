import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Number } from './number';

describe('Number', () => {
  it('默认千分位整数', () => {
    render(<Number value={1234567} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('precision 控制小数位', () => {
    render(<Number value={1234.5} precision={2} />);
    expect(screen.getByText('1,234.50')).toBeInTheDocument();
  });

  it('compact：小于一万用 k，大于等于一万用 万，整数不带 .0', () => {
    const { rerender } = render(<Number value={1200} compact />);
    expect(screen.getByText('1.2k')).toBeInTheDocument();

    rerender(<Number value={14000} compact />);
    expect(screen.getByText('1.4万')).toBeInTheDocument();

    rerender(<Number value={20000} compact />);
    expect(screen.getByText('2万')).toBeInTheDocument();
  });

  it('负数的符号与紧凑档一起处理', () => {
    const { rerender } = render(<Number value={-1234} />);
    expect(screen.getByText('-1,234')).toBeInTheDocument();

    rerender(<Number value={-14000} compact />);
    expect(screen.getByText('-1.4万')).toBeInTheDocument();
  });

  it('trend：正数绿向上、负数红向下、零中性且不画箭头', () => {
    const { container, rerender } = render(<Number value={10} trend={3} />);
    expect(screen.getByText('上升')).toHaveClass('oui-sr-only');
    expect(container.querySelector('.oui-number__trend')).not.toBeNull();

    rerender(<Number value={-3} trend={-3} />);
    expect(screen.getByText('下降')).toBeInTheDocument();
    expect(container.querySelector('.oui-number')).toHaveAttribute('data-trend', 'down');

    rerender(<Number value={0} trend={0} />);
    expect(container.querySelector('.oui-number')).toHaveAttribute('data-trend', 'flat');
    expect(container.querySelector('.oui-number__trend')).toBeNull();
    expect(screen.queryByText('上升')).toBeNull();
  });

  it('prefix / suffix 与正文一起渲染', () => {
    const { container } = render(<Number value={98} suffix="%" prefix="约" />);
    expect(screen.getByText('98')).toHaveClass('oui-number__value');
    expect(container.querySelectorAll('.oui-number__affix')).toHaveLength(2);
  });

  it('loading 时只出骨架，不渲染数字', () => {
    const { container } = render(<Number value={1234} loading />);
    expect(container.querySelector('.oui-number')).toHaveAttribute('data-loading', '');
    expect(container.querySelector('.oui-number')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('加载中')).toHaveClass('oui-sr-only');
    expect(screen.queryByText('1,234')).toBeNull();
  });

  it('mono 默认开启，可关闭', () => {
    const { container, rerender } = render(<Number value={1} />);
    expect(container.querySelector('.oui-number')).toHaveAttribute('data-mono', '');

    rerender(<Number value={1} mono={false} />);
    expect(container.querySelector('.oui-number')).not.toHaveAttribute('data-mono');
  });

  it('animated：数值变化后最终显示新值', async () => {
    const { rerender } = render(<Number value={10} animated />);
    expect(screen.getByText('10')).toBeInTheDocument();

    rerender(<Number value={20} animated />);
    await waitFor(() => expect(screen.getByText('20')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('ref 直接拿到 DOM 节点', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Number
        value={1}
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
        <Number value={1234} suffix="次" />
        <Number value={-8.4} trend={-1} precision={1} suffix="%" />
        <Number value={14000} compact />
        <Number value={0} loading />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
