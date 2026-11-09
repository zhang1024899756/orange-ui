'use client';

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('鼠标进入后显示，移出后消失', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="提示内容" delay={0}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('提示内容');

    await user.unhover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('显示时把 id 挂到触发元素的 aria-describedby 上', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="提示内容" delay={0}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button');
    expect(trigger).not.toHaveAttribute('aria-describedby');

    await user.hover(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('键盘聚焦立即显示（不受 delay 影响），Esc 关闭', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="键盘提示" delay={5000}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    await user.tab();
    expect(screen.getByRole('tooltip')).toHaveTextContent('键盘提示');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('鼠标进入要等 delay 到点才显示', async () => {
    render(
      <Tooltip content="稍后出现" delay={150}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    // mouseOver 是同步的，此刻延迟还没到点
    fireEvent.mouseOver(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).toBeNull();

    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('稍后出现'));
  });

  it('disabled 时不接管触发元素，也不显示', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="不该出现" delay={0} disabled>
        <button type="button">触发</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
  });

  it('受控模式只回调，不改内部状态', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Tooltip content="受控提示" delay={0} open={false} onOpenChange={onOpenChange}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('异步内容：loading 时显示加载态并标记 aria-busy', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="" loading delay={0}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('aria-busy', 'true');
    expect(tooltip).toHaveTextContent('加载中');
  });

  it('滚动时关闭，避免提示与元素错位', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="滚一下就关闭" delay={0}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.scroll(window);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('触发元素自己的 ref 与事件不会被吞掉', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    let node: HTMLButtonElement | null = null;

    render(
      <Tooltip content="提示" delay={0}>
        <button
          type="button"
          onClick={onClick}
          ref={(el) => {
            node = el;
          }}
        >
          触发
        </button>
      </Tooltip>,
    );

    expect(node).toBeInstanceOf(HTMLButtonElement);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('没有可访问性违规', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Tooltip content="提示内容" delay={0}>
          <button type="button">有提示</button>
        </Tooltip>
        <Tooltip content="另一个提示" placement="bottom" delay={0}>
          <button type="button">另一个</button>
        </Tooltip>
      </div>,
    );

    await user.hover(screen.getByRole('button', { name: '有提示' }));
    // 提示框通过 Portal 挂在 body 上，测试文档里没有 landmark 容器，
    // 所以这里关掉 page-level 的 region 规则（组件自身仍按全量规则检查）
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
