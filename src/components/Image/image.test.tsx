import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Image } from './image';

const root = (container: HTMLElement) => container.querySelector('.oui-image') as HTMLElement;

describe('Image', () => {
  it('渲染 img，src / alt 必填并默认懒加载', () => {
    render(<Image src="/a.png" alt="示例图" />);
    const img = screen.getByRole('img', { name: '示例图' });
    expect(img).toHaveAttribute('src', '/a.png');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('lazy=false 时立即加载', () => {
    render(<Image src="/a.png" alt="立即" lazy={false} />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
  });

  it('先显示骨架，onLoad 后进入 loaded 且骨架消失', () => {
    const { container } = render(<Image src="/a.png" alt="图" />);
    expect(root(container)).toHaveAttribute('data-status', 'loading');
    expect(root(container)).toHaveAttribute('aria-busy', 'true');

    fireEvent.load(screen.getByRole('img'));
    expect(root(container)).toHaveAttribute('data-status', 'loaded');
    expect(container.querySelector('.oui-image__skeleton')).toBeNull();
  });

  it('onError 进入失败态：图标加文案，可被 fallback 覆盖', () => {
    const { container, rerender } = render(<Image src="/bad.png" alt="坏图" />);
    fireEvent.error(screen.getByRole('img'));
    expect(root(container)).toHaveAttribute('data-status', 'error');
    expect(screen.getByText('加载失败')).toBeInTheDocument();

    rerender(<Image src="/bad.png" alt="坏图" fallback={<span>自定义占位</span>} />);
    expect(screen.getByText('自定义占位')).toBeInTheDocument();
    expect(screen.queryByText('加载失败')).toBeNull();
  });

  it('受控 loading：图片事件不改骨架，只回调 onLoadingChange', () => {
    const onLoadingChange = vi.fn();
    const { container } = render(
      <Image src="/a.png" alt="受控" loading onLoadingChange={onLoadingChange} />,
    );
    fireEvent.load(screen.getByRole('img'));
    expect(root(container)).toHaveAttribute('data-status', 'loading');
    expect(onLoadingChange).toHaveBeenCalledWith(false);
  });

  it('非受控模式下 onLoad 正常结束骨架', () => {
    const { container } = render(<Image src="/a.png" alt="非受控" />);
    fireEvent.load(screen.getByRole('img'));
    expect(root(container)).toHaveAttribute('data-status', 'loaded');
  });

  it('换 src 会回到骨架态', () => {
    const { container, rerender } = render(<Image src="/a.png" alt="换图" />);
    fireEvent.load(screen.getByRole('img'));
    expect(root(container)).toHaveAttribute('data-status', 'loaded');

    rerender(<Image src="/b.png" alt="换图" />);
    expect(root(container)).toHaveAttribute('data-status', 'loading');
  });

  it('ratio / fit / radius 落到 data 属性', () => {
    const { container } = render(
      <Image src="/a.png" alt="比例" ratio="1:1" fit="contain" radius="xl" />,
    );
    const el = root(container);
    expect(el).toHaveAttribute('data-ratio', '1:1');
    expect(el).toHaveAttribute('data-fit', 'contain');
    expect(el).toHaveAttribute('data-radius', 'xl');
  });

  it('ref 指向 img 本身', () => {
    let node: HTMLImageElement | null = null;
    render(
      <Image
        src="/a.png"
        alt="ref"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLImageElement);
  });

  it('没有可访问性违规', async () => {
    const { container } = render(
      <div>
        <Image src="/a.png" alt="正常图" />
        <Image src="/b.png" alt="带说明的图" ratio="4:3" radius="lg" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
