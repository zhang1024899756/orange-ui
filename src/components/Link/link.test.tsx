import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Link } from './link';

describe('Link', () => {
  it('渲染成 a，href 与文字都在', () => {
    render(<Link href="/docs">文档</Link>);
    const link = screen.getByRole('link', { name: '文档' });
    expect(link).toHaveAttribute('href', '/docs');
  });

  it('external 且调用方自己给了 target 时，仍然补 noopener noreferrer', () => {
    render(
      <Link href="https://example.com" external target="_blank">
        外部文档
      </Link>,
    );
    const link = screen.getByRole('link', { name: /外部文档/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('external 自动加 target/rel/箭头与读屏提示', () => {
    render(
      <Link href="https://example.com" external>
        外部文档
      </Link>,
    );
    const link = screen.getByRole('link', { name: /外部文档/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('（在新窗口打开）')).toHaveClass('oui-sr-only');
  });

  it('external 合并调用方自己的 rel，不覆盖', () => {
    render(
      <Link href="https://example.com" external rel="nofollow">
        外链
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer nofollow');
  });

  it('disabled：aria-disabled、移出 tab 序、摘掉 href、点击被拦截', async () => {
    const onClick = vi.fn();
    render(
      <Link href="/a" disabled onClick={onClick}>
        不可点
      </Link>,
    );
    const link = screen.getByText('不可点').closest('a') as HTMLAnchorElement;
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(link).not.toHaveAttribute('href');

    await userEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('color / underline / size 落到 data 属性', () => {
    render(
      <Link href="/a" color="danger" underline="always" size="lg">
        危险链接
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-color', 'danger');
    expect(link).toHaveAttribute('data-underline', 'always');
    expect(link).toHaveAttribute('data-size', 'lg');
  });

  it('前置图标与点击回调', async () => {
    const onClick = vi.fn();
    render(
      <Link
        href="/a"
        icon={<span data-testid="ico" />}
        onClick={(event) => {
          event.preventDefault();
          onClick(event);
        }}
      >
        带图标
      </Link>,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ref 直接拿到 a 节点', () => {
    let node: HTMLAnchorElement | null = null;
    render(
      <Link
        href="/a"
        ref={(el) => {
          node = el;
        }}
      >
        链接
      </Link>,
    );
    expect(node).toBeInstanceOf(HTMLAnchorElement);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Link href="/a">普通链接</Link>
        <Link href="/b" color="neutral" underline="always">
          中性链接
        </Link>
        <Link href="https://example.com" external>
          外链
        </Link>
        <Link href="/c" disabled>
          禁用链接
        </Link>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
