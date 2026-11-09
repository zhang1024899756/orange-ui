import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tag } from './tag';

describe('Tag', () => {
  it('渲染文字与角色属性', () => {
    render(<Tag color="primary">模型</Tag>);
    const tag = screen.getByText('模型').closest('.oui-tag') as HTMLElement;
    expect(tag).toHaveAttribute('data-color', 'primary');
    expect(tag).toHaveAttribute('data-variant', 'subtle');
  });

  it('有 onClick 时渲染成按钮，可用键盘触发', async () => {
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>筛选项</Tag>);
    const btn = screen.getByRole('button', { name: '筛选项' });
    await userEvent.tab();
    expect(btn).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  it('可点选 + 可关闭时不产生嵌套 button，关闭仍可单独触发', async () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <Tag onClick={onClick} closable onClose={onClose}>
        筛选项
      </Tag>,
    );
    // 容器必须是 span[role=button]：<button> 里嵌关闭按钮是非法 HTML
    const container = document.querySelector('.oui-tag') as HTMLElement;
    expect(container.tagName).toBe('SPAN');
    expect(container).toHaveAttribute('role', 'button');
    expect(container).toHaveAttribute('tabindex', '0');
    const close = screen.getByRole('button', { name: '移除 筛选项' });
    expect(close.tagName).toBe('BUTTON');
    expect(container.querySelectorAll('button button')).toHaveLength(0);

    await userEvent.click(close);
    expect(onClose).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled(); // 关闭不能顺带把选中也触发
  });

  it('没有 onClick 时是普通 span，不进入 tab 序列', () => {
    const { container } = render(<Tag>模型</Tag>);
    expect(container.querySelector('.oui-tag')?.tagName).toBe('SPAN');
  });

  it('selected 时 aria-pressed 为 true 并显示勾', () => {
    const { container } = render(
      <Tag onClick={() => {}} selected>
        已选
      </Tag>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('.oui-tag__check')).not.toBeNull();
  });

  it('closable 点击关闭只触发一次 onClose，不冒泡到 onClick', async () => {
    const onClose = vi.fn();
    const onClick = vi.fn();
    render(
      <Tag closable onClose={onClose} onClick={onClick}>
        模型
      </Tag>,
    );
    await userEvent.click(screen.getByRole('button', { name: '移除 模型' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled 时不可点击', async () => {
    const onClick = vi.fn();
    render(
      <Tag disabled onClick={onClick}>
        模型
      </Tag>,
    );
    await userEvent.click(screen.getByText('模型'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('ref 直接是普通 prop', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Tag
        ref={(el) => {
          node = el;
        }}
      >
        模型
      </Tag>,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Tag>普通</Tag>
        <Tag color="primary" variant="solid">实心</Tag>
        <Tag closable onClose={() => {}}>可关闭</Tag>
        <Tag color="cyan" icon={<span aria-hidden="true">*</span>}>带图标</Tag>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
