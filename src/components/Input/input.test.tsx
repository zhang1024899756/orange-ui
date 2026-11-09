'use client';

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Input } from './input';

describe('Input', () => {
  it('渲染真实 input，并透传原生属性与 className', () => {
    render(<Input className="custom" placeholder="请输入" data-testid="field" name="nickname" />);
    const field = screen.getByTestId('field');
    expect(field.tagName).toBe('INPUT');
    expect(field).toHaveAttribute('placeholder', '请输入');
    expect(field).toHaveAttribute('name', 'nickname');
    expect(field.closest('.oui-input')).toHaveClass('oui-input', 'custom');
  });

  it('非受控：输入会同步值与清除按钮', async () => {
    render(<Input clearable aria-label="输入" />);
    const field = screen.getByRole('textbox');
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull();

    await userEvent.type(field, '小米');
    expect(field).toHaveValue('小米');
    expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument();
  });

  it('受控：只回调、不改显示值', async () => {
    const onChange = vi.fn();
    render(<Input value="abc" onChange={onChange} aria-label="输入" />);
    const field = screen.getByRole('textbox');

    await userEvent.type(field, 'd');
    expect(onChange).toHaveBeenCalled();
    expect(field).toHaveValue('abc');
  });

  it('点击清除按钮清空非受控值，并回调 onClear', async () => {
    const onClear = vi.fn();
    render(<Input defaultValue="hello" clearable onClear={onClear} aria-label="输入" />);
    const field = screen.getByRole('textbox');

    await userEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(field).toHaveValue('');
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull();
  });

  it('loading：aria-busy + readOnly，输入不生效，清除按钮隐藏', async () => {
    const onChange = vi.fn();
    render(<Input loading defaultValue="abc" clearable onChange={onChange} aria-label="输入" />);
    const field = screen.getByRole('textbox');

    expect(field).toHaveAttribute('aria-busy', 'true');
    expect(field).toHaveAttribute('readonly');

    await userEvent.type(field, 'x');
    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveValue('abc');
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull();
  });

  it('disabled：整块标记与原生 disabled 同步', () => {
    render(<Input disabled clearable defaultValue="abc" aria-label="输入" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox').closest('.oui-input')).toHaveAttribute('data-disabled');
  });

  it('status=error 时带 aria-invalid', () => {
    render(<Input status="error" aria-label="输入" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('showCount 显示 n/m', async () => {
    render(<Input showCount maxLength={10} aria-label="输入" />);
    expect(screen.getByTestId('oui-input-count')).toHaveTextContent('0/10');

    await userEvent.type(screen.getByRole('textbox'), 'abcd');
    expect(screen.getByTestId('oui-input-count')).toHaveTextContent('4/10');
  });

  it('前后缀插槽渲染', () => {
    render(<Input prefix={<span data-testid="pre">¥</span>} suffix={<span data-testid="suf">元</span>} aria-label="输入" />);
    expect(screen.getByTestId('pre')).toBeInTheDocument();
    expect(screen.getByTestId('suf')).toBeInTheDocument();
  });

  it('ref 直接指向内部 input 元素', () => {
    let node: HTMLInputElement | null = null;
    render(
      <Input
        ref={(el) => {
          node = el;
        }}
        aria-label="输入"
      />,
    );
    expect(node).toBeInstanceOf(HTMLInputElement);
  });

  it('style 与 className 落在同一个节点（外层容器）', () => {
    const { container } = render(
      <Input aria-label="宽度" className="my-input" style={{ width: 320 }} />,
    );
    const wrapper = container.querySelector<HTMLElement>('.oui-input');
    const field = container.querySelector<HTMLElement>('input');
    // 曾经 className 在外层、style 被原生透传带到 input 上，两者落点不一致
    expect(wrapper).toHaveClass('my-input');
    expect(wrapper?.style.width).toBe('320px');
    expect(field?.style.width).toBe('');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Input aria-label="昵称" placeholder="请输入昵称" />
        <Input aria-label="邮箱" status="error" clearable defaultValue="a@b.c" />
        <Input aria-label="加载" loading />
        <Input aria-label="字数" showCount maxLength={20} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});