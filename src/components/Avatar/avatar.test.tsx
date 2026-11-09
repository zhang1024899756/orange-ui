'use client';

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Avatar } from './avatar';
import { AvatarGroup } from './avatar-group';

describe('Avatar', () => {
  it('有 src 时渲染图片，alt 默认取 name', () => {
    render(<Avatar src="/a.png" name="张三" />);
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/a.png');
    expect(img).toHaveAttribute('alt', '张三');
  });

  it('没有 src 时回退到首字母，并对读屏保留完整名字', () => {
    const { container } = render(<Avatar name="张三" />);
    expect(container.querySelector('.oui-avatar__initials')).toHaveTextContent('张');
    expect(screen.getByText('张三')).toBeInTheDocument();
  });

  it('多词名字取首尾首字母', () => {
    const { container } = render(<Avatar name="john doe" />);
    expect(container.querySelector('.oui-avatar__initials')).toHaveTextContent('JD');
  });

  it('图片加载失败时回退到首字母', () => {
    const { container } = render(<Avatar src="/broken.png" name="李四" />);
    const img = container.querySelector('img') as HTMLImageElement;
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.oui-avatar__initials')).toHaveTextContent('李');
  });

  it('命名尺寸走 data-size，数字尺寸走行内的 --oui-avatar-size', () => {
    const { container, rerender } = render(<Avatar name="张三" size="lg" />);
    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg');

    rerender(<Avatar name="张三" size={56} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'custom');
    expect(root.style.getPropertyValue('--oui-avatar-size')).toBe('56px');
  });

  it('status 渲染状态点，并给读屏一句说明', () => {
    const { container } = render(<Avatar name="张三" status="busy" />);
    expect(container.querySelector('.oui-avatar__status')).not.toBeNull();
    expect(screen.getByText('忙碌')).toBeInTheDocument();
  });

  it('回退底色由名字哈希决定，同名稳定', () => {
    const { container: a } = render(<Avatar name="张三" />);
    const { container: b } = render(<Avatar name="张三" />);
    expect((a.firstElementChild as HTMLElement).getAttribute('data-tone')).toBe(
      (b.firstElementChild as HTMLElement).getAttribute('data-tone'),
    );
  });

  it('ref 是普通 prop，直接指向根节点', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Avatar
        name="张三"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Avatar src="/a.png" name="张三" status="online" />
        <Avatar name="李四" />
        <Avatar name="Bob Smith" size="lg" shape="square" status="away" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('AvatarGroup', () => {
  const members = ['张三', '李四', '王五', '陈六', '赵七', '孙八'];

  it('最多显示 max 个头像，其余折叠成 +N', () => {
    const { container } = render(
      <AvatarGroup max={4}>
        {members.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>,
    );
    const rendered = container.querySelectorAll('.oui-avatar-group > .oui-avatar');
    expect(rendered).toHaveLength(5);
    expect(container.querySelector('.oui-avatar-group__more')).toHaveTextContent('+2');
  });

  it('成员不超额时不渲染 +N', () => {
    const { container } = render(
      <AvatarGroup max={4}>
        <Avatar name="张三" />
        <Avatar name="李四" />
      </AvatarGroup>,
    );
    expect(container.querySelector('.oui-avatar-group__more')).toBeNull();
  });

  it('用 aria-label 说明总人数，+N 对读屏隐藏', () => {
    const { container } = render(
      <AvatarGroup max={2}>
        {members.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '共 6 位成员');
    expect(container.querySelector('.oui-avatar-group__more')).toHaveAttribute('aria-hidden', 'true');
  });

  it('支持 total 覆盖总数与自定义 label', () => {
    render(
      <AvatarGroup max={2} total={12} label="12 人在线">
        <Avatar name="张三" />
        <Avatar name="李四" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '12 人在线');
    expect(screen.getByText('+10')).toBeInTheDocument();
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <AvatarGroup max={3} size="sm">
        {members.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
