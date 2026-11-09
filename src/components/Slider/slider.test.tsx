'use client';

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Slider } from './slider';

function mockRailRect(container: HTMLElement, width = 200) {
  const rail = container.querySelector('.oui-slider__rail');
  if (!rail) throw new Error('找不到轨道');
  vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    right: width,
    top: 0,
    bottom: 24,
    width,
    height: 24,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

describe('Slider', () => {
  it('渲染 role=slider 并暴露完整 aria 数值', () => {
    render(<Slider defaultValue={25} />);
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuenow', '25');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-label', '滑块');
    expect(thumb).toHaveAttribute('tabindex', '0');
  });

  it('键盘：方向键步进、Home/End 到两端、PageUp/PageDown 大步', async () => {
    const onChange = vi.fn();
    render(<Slider defaultValue={50} step={5} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '55');

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(thumb).toHaveAttribute('aria-valuenow', '45');

    await userEvent.keyboard('{PageUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '95');

    await userEvent.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');

    await userEvent.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');

    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('受控：只回调不改自身数值', async () => {
    const onChange = vi.fn();
    render(<Slider value={40} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(41);
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
  });

  it('range：两个 thumb 各自带 aria-label，且互相不能越过', async () => {
    const onChange = vi.fn();
    render(<Slider range defaultValue={[20, 60]} onChange={onChange} />);
    const [low, high] = screen.getAllByRole('slider');

    expect(low).toHaveAttribute('aria-label', '最小值');
    expect(high).toHaveAttribute('aria-label', '最大值');
    expect(low).toHaveAttribute('aria-valuenow', '20');
    expect(high).toHaveAttribute('aria-valuenow', '60');

    // 下限 thumb 顶不到上限之外
    low!.focus();
    await userEvent.keyboard('{End}');
    expect(low).toHaveAttribute('aria-valuenow', '60');
    await userEvent.keyboard('{ArrowRight}');
    expect(low).toHaveAttribute('aria-valuenow', '60');
    expect(high).toHaveAttribute('aria-valuenow', '60');

    // 上限 thumb 也压不到下限之下
    high!.focus();
    await userEvent.keyboard('{Home}');
    expect(high).toHaveAttribute('aria-valuenow', '60');
    expect(onChange).toHaveBeenLastCalledWith([60, 60]);
  });

  it('指针拖动：拖动过程触发 onChange，松手触发 onChangeComplete', () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    const { container } = render(
      <Slider defaultValue={10} onChange={onChange} onChangeComplete={onChangeComplete} />,
    );
    mockRailRect(container, 200);

    const thumb = container.querySelector('.oui-slider__thumb') as HTMLElement;
    const rail = container.querySelector('.oui-slider__rail') as HTMLElement;

    fireEvent.pointerDown(thumb, { clientX: 20, pointerId: 1 });
    fireEvent.pointerMove(rail, { clientX: 100, pointerId: 1 });

    expect(onChange).toHaveBeenLastCalledWith(50);

    fireEvent.pointerUp(rail, { clientX: 100, pointerId: 1 });
    expect(onChangeComplete).toHaveBeenCalledWith(50);
  });

  it('点击轨道把最近的 thumb 跳过去（range）', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider range defaultValue={[20, 60]} onChange={onChange} />);
    mockRailRect(container, 100);

    const rail = container.querySelector('.oui-slider__rail') as HTMLElement;
    fireEvent.pointerDown(rail, { clientX: 80, pointerId: 1 });

    // 80 更接近上限 thumb（60），于是动的是它而不是下限
    expect(onChange).toHaveBeenLastCalledWith([20, 80]);
  });

  it('disabled / loading：不可操作且 aria-disabled', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Slider defaultValue={30} disabled onChange={onChange} />);
    let thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-disabled', 'true');
    expect(thumb).toHaveAttribute('tabindex', '-1');

    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
    expect(thumb).toHaveAttribute('aria-valuenow', '30');

    rerender(<Slider defaultValue={30} loading onChange={onChange} />);
    thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('min === max 时不死循环也不出 NaN', () => {
    const { container } = render(<Slider min={5} max={5} defaultValue={5} />);
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuenow', '5');
    expect(thumb.style.left).toBe('0%');
    expect(container.querySelector('.oui-slider__fill')).not.toBeNull();
  });

  it('marks 渲染刻度文案', () => {
    render(<Slider defaultValue={50} marks={{ 0: '0', 50: '半程', 100: '100' }} />);
    expect(screen.getByText('半程')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('ref 直接指向根元素', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Slider
        defaultValue={10}
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
    expect((node as unknown as HTMLDivElement | null)?.className).toContain('oui-slider');
  });

  it('单值滑块从轨道左端填充到当前值（不是 0 宽）', () => {
    const { container } = render(<Slider defaultValue={30} aria-label="音量" />);
    const fill = container.querySelector<HTMLElement>('.oui-slider__fill');
    expect(fill).not.toBeNull();
    // 曾经 startPercent 与 endPercent 都取 values[0]，单值宽度恒为 0，填充段整个消失
    expect(fill?.style.left).toBe('0%');
    expect(parseFloat(fill?.style.width ?? '0')).toBeGreaterThan(0);
  });

  it('双值滑块填充在两枚 thumb 之间', () => {
    const { container } = render(<Slider range defaultValue={[20, 60]} />);
    const fill = container.querySelector<HTMLElement>('.oui-slider__fill');
    expect(parseFloat(fill?.style.left ?? '0')).toBeCloseTo(20, 5);
    expect(parseFloat(fill?.style.width ?? '0')).toBeCloseTo(40, 5);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Slider defaultValue={30} aria-label="音量" />
        <Slider range defaultValue={[20, 60]} />
        <Slider defaultValue={10} disabled aria-label="禁用" />
        <Slider defaultValue={10} loading aria-label="加载中" />
        <Slider defaultValue={50} marks={{ 0: '0', 100: '100' }} aria-label="带刻度" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});