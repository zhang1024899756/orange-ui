import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Icon } from './icon';

describe('Icon', () => {
  it('内置图标渲染成 svg 且对读屏隐藏', () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('给了 label 才进入无障碍树', () => {
    render(<Icon name="heart" label="收藏" />);
    expect(screen.getByRole('img', { name: '收藏' })).toBeInTheDocument();
  });

  it('size 与 color 落到 svg 尺寸与样式上', () => {
    const { container } = render(<Icon name="star" size={24} color="primary" />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg).toHaveAttribute('width', '24');
    expect(svg.style.color).toBe('var(--oui-color-primary)');
  });

  it('可以传自定义图形替代内置图标', () => {
    const { container } = render(
      <Icon label="自定义">
        <path d="M4 4 L20 20" />
      </Icon>,
    );
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('透传 className 与尺寸相关属性', () => {
    const { container } = render(<Icon name="bell" className="custom" />);
    expect(container.querySelector('svg')).toHaveClass('oui-icon', 'custom');
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Icon name="search" />
        <Icon name="heart" label="收藏" />
        <Icon name="refresh" spin />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
