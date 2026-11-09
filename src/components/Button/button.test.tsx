import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button } from './button';

describe('Button', () => {
  it('渲染文字并响应点击', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>保存</Button>);
    const btn = screen.getByRole('button', { name: '保存' });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('默认 type=button，避免在表单里意外提交', () => {
    render(<Button>保存</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('loading 时禁用、带 aria-busy，并给读屏一句提示', () => {
    render(<Button loading>保存</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveTextContent('加载中');
  });

  it('loading + loadingText 时文字换成 loadingText', () => {
    render(
      <Button loading loadingText="保存中…">
        保存
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('保存中…');
  });

  it('loading 时点击不触发 onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        保存
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('href 时渲染成链接，禁用后不可聚焦且不跳转', async () => {
    const { rerender } = render(<Button href="/a">去</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('href', '/a');

    rerender(
      <Button href="/a" disabled>
        去
      </Button>,
    );
    const link = screen.getByRole('button');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('ref 直接是普通 prop（React 19 无需 forwardRef）', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(el) => {
          node = el;
        }}
      >
        保存
      </Button>,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });

  it('透传 className 与 data 属性', () => {
    render(
      <Button className="custom" data-testid="b">
        保存
      </Button>,
    );
    const btn = screen.getByTestId('b');
    expect(btn).toHaveClass('oui-button', 'custom');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Button>保存</Button>
        <Button variant="outlined" color="danger">
          删除
        </Button>
        <Button loading>加载中</Button>
        <Button icon={<span aria-hidden="true">+</span>} shape="circle" aria-label="新建" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
