'use client';

import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Dialog } from './dialog';
import type { DialogProps } from './dialog';

function Demo(props: Partial<DialogProps>) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        打开对话框
      </button>
      <Dialog {...props} open={open} onOpenChange={setOpen}>
        {props.children ?? '对话框内容'}
      </Dialog>
    </div>
  );
}

const openDialog = async () => {
  await userEvent.click(screen.getByRole('button', { name: '打开对话框' }));
  return screen.findByRole('dialog');
};

describe('Dialog', () => {
  it('open=false 时不渲染任何内容', () => {
    render(
      <Dialog open={false} title="标题">
        内容
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('打开后通过 Portal 挂到 body，并带 role/aria-modal/标题关联', async () => {
    render(
      <Dialog open title="删除确认" description="删除后不可恢复">
        内容
      </Dialog>,
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('删除确认');
    expect(dialog).toHaveAccessibleDescription('删除后不可恢复');
    expect(document.body.contains(dialog)).toBe(true);
    expect(document.body.contains(dialog.parentElement)).toBe(true);
  });

  it('点击关闭按钮与取消按钮都会回调 onCancel / onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    render(
      <Dialog open title="标题" onOpenChange={onOpenChange} onCancel={onCancel}>
        内容
      </Dialog>,
    );
    await screen.findByRole('dialog');

    await userEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    await userEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('点击确定回调 onConfirm', async () => {
    const onConfirm = vi.fn();
    render(
      <Dialog open title="标题" onConfirm={onConfirm}>
        内容
      </Dialog>,
    );
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('ESC 关闭；closeOnEsc=false 时不关闭', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog open title="标题" onOpenChange={onOpenChange}>
        内容
      </Dialog>,
    );
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    rerender(
      <Dialog open title="标题" onOpenChange={onOpenChange} closeOnEsc={false}>
        内容
      </Dialog>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('点遮罩关闭；maskClosable=false 时不关闭', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog open title="标题" onOpenChange={onOpenChange}>
        内容
      </Dialog>,
    );
    await screen.findByRole('dialog');
    fireEvent.click(document.querySelector('.oui-dialog__mask') as HTMLElement);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    rerender(
      <Dialog open title="标题" onOpenChange={onOpenChange} maskClosable={false}>
        内容
      </Dialog>,
    );
    fireEvent.click(document.querySelector('.oui-dialog__mask') as HTMLElement);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('confirmLoading 期间遮罩与 ESC 都不能关闭，确定按钮转 loading', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open title="标题" confirmLoading onOpenChange={onOpenChange}>
        内容
      </Dialog>,
    );
    await screen.findByRole('dialog');

    fireEvent.click(document.querySelector('.oui-dialog__mask') as HTMLElement);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();

    const confirm = screen.getByRole('button', { name: /确定/ });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('aria-busy', 'true');
  });

  it('loading：标题保留、内容区换成骨架条', async () => {
    render(
      <Dialog open loading title="加载中的标题">
        真实内容
      </Dialog>,
    );
    await screen.findByRole('dialog');
    expect(screen.getByText('加载中的标题')).toBeInTheDocument();
    expect(screen.queryByText('真实内容')).toBeNull();
    expect(document.querySelectorAll('.oui-dialog__bar').length).toBeGreaterThan(0);
  });

  it('焦点陷阱：打开后进入第一个可聚焦元素，Tab / Shift+Tab 在面板内循环', async () => {
    render(<Demo title="标题" />);
    await openDialog();

    const close = screen.getByRole('button', { name: '关闭' });
    const cancel = screen.getByRole('button', { name: '取消' });
    const confirm = screen.getByRole('button', { name: '确定' });

    expect(close).toHaveFocus();

    await userEvent.tab();
    expect(cancel).toHaveFocus();

    await userEvent.tab();
    expect(confirm).toHaveFocus();

    // 最后一个之后回到第一个
    await userEvent.tab();
    expect(close).toHaveFocus();

    // 第一个之前回到最后一个
    await userEvent.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it('关闭后焦点还给打开前的元素', async () => {
    render(<Demo title="标题" />);
    const trigger = screen.getByRole('button', { name: '打开对话框' });

    await openDialog();
    expect(trigger).not.toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('footer=false 时不渲染默认按钮，只留关闭按钮', async () => {
    render(
      <Dialog open title="标题" footer={false}>
        内容
      </Dialog>,
    );
    await screen.findByRole('dialog');
    expect(screen.queryByRole('button', { name: '确定' })).toBeNull();
    expect(screen.queryByRole('button', { name: '取消' })).toBeNull();
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
  });

  it('尺寸通过 data-size 暴露，ref 指向面板', async () => {
    let node: HTMLDivElement | null = null;
    render(
      <Dialog
        open
        title="标题"
        size="lg"
        ref={(el) => {
          node = el;
        }}
      >
        内容
      </Dialog>,
    );
    const dialog = await screen.findByRole('dialog');
    expect(document.querySelector('.oui-dialog')).toHaveAttribute('data-size', 'lg');
    expect(node).toBe(document.querySelector('.oui-dialog__panel'));
    expect(dialog).toBe(node);
  });

  it('没有 title 时，aria-label 落在 role="dialog" 的节点上', async () => {
    render(<Dialog open aria-label="发布设置">内容</Dialog>);
    // 曾经 {...rest} 落在最外层 .oui-dialog 上，role="dialog" 的 panel 反而没有名字
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveClass('oui-dialog__panel');
    expect(dialog).toHaveAccessibleName('发布设置');
  });

  it('调用方传入的 aria-labelledby 优先于内部标题关联', async () => {
    render(
      <>
        <span id="外部标题">外部标题</span>
        <Dialog open aria-labelledby="外部标题">
          内容
        </Dialog>
      </>,
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', '外部标题');
    expect(dialog).toHaveAccessibleName('外部标题');
  });

  it('没有可访问性违规', async () => {
    render(
      <>
        <Dialog open title="删除确认" description="删除后不可恢复">
          内容
        </Dialog>
      </>,
    );
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});