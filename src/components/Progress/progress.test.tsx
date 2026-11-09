import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Progress } from './progress';

describe('Progress', () => {
  it('线形渲染出正确的 aria 数值', () => {
    render(<Progress value={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('超出范围会夹到 0–100', () => {
    const { rerender } = render(<Progress value={-20} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    rerender(<Progress value={180} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('不确定态不报数值，只用 aria-busy 表达加载', () => {
    render(<Progress indeterminate />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-busy', 'true');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('显示百分比标签，并可用 format 覆盖', () => {
    const { rerender } = render(<Progress value={37} showLabel />);
    expect(screen.getByText('37%')).toBeInTheDocument();
    rerender(<Progress value={37} showLabel format={(p) => `${p}/100`} />);
    expect(screen.getByText('37/100')).toBeInTheDocument();
  });

  it('环形用 SVG，且状态色优先级高于 color', () => {
    const { container } = render(<Progress type="circle" value={50} status="success" />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-color', 'success');
  });

  it('ref 直接是普通 prop', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Progress
        value={10}
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Progress value={60} showLabel />
        <Progress indeterminate />
        <Progress type="circle" value={30} showLabel />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
