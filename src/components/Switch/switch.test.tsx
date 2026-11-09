'use client';

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Switch } from './switch';

describe('Switch', () => {
  it('渲染成 role=switch 的按钮，默认关闭', () => {
    render(<Switch aria-label="通知" />);
    const sw = screen.getByRole('switch', { name: '通知' });
    expect(sw.tagName).toBe('BUTTON');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAttribute('type', 'button');
  });

  it('非受控：点击切换状态并回调', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="通知" onChange={onChange} />);
    const sw = screen.getByRole('switch');

    await userEvent.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(sw).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('受控：只回调、不改自身状态', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="通知" checked={false} onChange={onChange} />);
    const sw = screen.getByRole('switch');

    await userEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('键盘空格与回车都能切换', async () => {
    render(<Switch aria-label="通知" defaultChecked />);
    const sw = screen.getByRole('switch');
    sw.focus();

    await userEvent.keyboard('{Enter}');
    expect(sw).toHaveAttribute('aria-checked', 'false');

    await userEvent.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('选中/未选中文案跟随状态', async () => {
    render(<Switch aria-label="开关" checkedChildren="开" unCheckedChildren="关" />);
    expect(screen.getByText('关')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByText('开')).toBeInTheDocument();
  });

  it('loading：aria-busy、不可点、thumb 换成转圈且保持原选中位置', async () => {
    const onChange = vi.fn();
    const { container } = render(<Switch aria-label="通知" loading defaultChecked onChange={onChange} />);
    const sw = screen.getByRole('switch');

    expect(sw).toHaveAttribute('aria-busy', 'true');
    expect(sw).toBeDisabled();
    expect(sw).toHaveAttribute('data-checked');
    expect(container.querySelector('.oui-spinner-glyph')).not.toBeNull();

    await userEvent.click(sw);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled：点击不回调', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="通知" disabled onChange={onChange} />);
    const sw = screen.getByRole('switch');
    expect(sw).toBeDisabled();

    await userEvent.click(sw);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ref 直接指向 button 元素', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <Switch
        aria-label="通知"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });

  it('只给单侧文案时，两个状态都有可访问名称', () => {
    render(
      <div>
        <Switch checkedChildren="开" />
        <Switch checkedChildren="开" defaultChecked />
      </div>,
    );
    for (const node of screen.getAllByRole('switch')) {
      // 未选中时可见文字为空，名称必须由 aria-label 兜住
      expect(node).toHaveAccessibleName('开');
    }
  });

  it('两侧文案都给时不额外注入 aria-label，名称跟随可见文字', () => {
    render(<Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />);
    const node = screen.getByRole('switch');
    expect(node).not.toHaveAttribute('aria-label');
    expect(node).toHaveAccessibleName('开');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Switch aria-label="通知" />
        <Switch aria-label="自动保存" defaultChecked color="success" />
        <Switch aria-label="加载中" loading />
        <Switch aria-label="禁用" disabled />
        <Switch aria-label="带文案" checkedChildren="开" unCheckedChildren="关" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});