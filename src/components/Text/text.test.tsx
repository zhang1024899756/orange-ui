import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Text } from './text';

afterEach(() => {
  vi.useRealTimers();
});

describe('Text', () => {
  it('默认渲染 span 并输出文字', () => {
    render(<Text>正文内容</Text>);
    const el = screen.getByText('正文内容');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('oui-text');
  });

  it('as 可以换成语义标签', () => {
    render(<Text as="h2">区块标题</Text>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('区块标题');
  });

  it('字号 / 字重 / 色调落到 data 属性上', () => {
    render(
      <Text size="xl" weight={600} tone="danger">
        警告
      </Text>,
    );
    const el = screen.getByText('警告');
    expect(el).toHaveAttribute('data-size', 'xl');
    expect(el).toHaveAttribute('data-weight', '600');
    expect(el).toHaveAttribute('data-tone', 'danger');
  });

  it('truncate=true 是单行省略，数字是多行 clamp 且带行数变量', () => {
    const { rerender } = render(<Text truncate>很长很长的一句话</Text>);
    expect(screen.getByText('很长很长的一句话')).toHaveAttribute('data-truncate', 'single');

    rerender(<Text truncate={3}>很长很长的一句话</Text>);
    const el = screen.getByText('很长很长的一句话');
    expect(el).toHaveAttribute('data-truncate', 'multi');
    expect(el.style.getPropertyValue('--oui-text-clamp')).toBe('3');
  });

  it('copyable 点击后变成已复制，1.2s 后恢复', async () => {
    vi.useFakeTimers();
    render(<Text copyable>复制这一段</Text>);

    const button = screen.getByRole('button', { name: '复制' });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute('aria-label', '已复制');

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(button).toHaveAttribute('aria-label', '复制');
  });

  it('copyable 不改变文本内容，只多一个按钮', () => {
    const { container } = render(<Text copyable>一段文字</Text>);
    expect(screen.getByText('一段文字')).toHaveClass('oui-text__body');
    expect(container.querySelectorAll('button')).toHaveLength(1);
  });

  it('ref 直接拿到 DOM 节点', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Text
        ref={(el) => {
          node = el;
        }}
      >
        引用
      </Text>,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  it('透传 className 与其它属性', () => {
    render(
      <Text className="custom" data-testid="t" title="提示">
        文字
      </Text>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveClass('oui-text', 'custom');
    expect(el).toHaveAttribute('title', '提示');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Text as="h1" size="2xl" weight={600}>
          标题
        </Text>
        <Text tone="secondary" truncate copyable>
          可复制的正文
        </Text>
        <Text tone="disabled">禁用文字</Text>
        <Text mono>ABCD-1234</Text>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
