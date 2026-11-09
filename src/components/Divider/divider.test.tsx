import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Divider } from './divider';

describe('Divider', () => {
  it('水平是 separator，横向读屏语义正确', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el).toHaveAttribute('aria-orientation', 'horizontal');
    expect(el).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('垂直带 aria-orientation=vertical', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('dashed / spacing / inset 落到 data 属性', () => {
    render(<Divider dashed spacing="lg" inset />);
    const el = screen.getByRole('separator');
    expect(el).toHaveAttribute('data-dashed', '');
    expect(el).toHaveAttribute('data-spacing', 'lg');
    expect(el).toHaveAttribute('data-inset', '');
  });

  it('带文字时渲染文字并标记 with-text', () => {
    render(<Divider>最近访问</Divider>);
    expect(screen.getByText('最近访问')).toHaveClass('oui-divider__text');
    expect(screen.getByRole('separator')).toHaveAttribute('data-with-text', '');
  });

  it('decorative 时不进无障碍树', () => {
    const { container } = render(<Divider decorative />);
    const el = container.querySelector('.oui-divider') as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('role');
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('ref 直接拿到 DOM 节点', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Divider
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
        <Divider />
        <Divider dashed spacing="sm" />
        <Divider>分组</Divider>
        <Divider orientation="vertical" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
