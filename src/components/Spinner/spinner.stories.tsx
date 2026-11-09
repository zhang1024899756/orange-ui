'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './spinner';
import { Button } from '../Button';

const meta = {
  title: '组件/Spinner 加载指示器',
  component: Spinner,
  parameters: { layout: 'centered' },
  args: { size: 'md', color: 'primary' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    color: { control: 'inline-radio', options: ['primary', 'neutral', 'success', 'warning', 'danger', 'current'] },
    inline: { control: 'boolean' },
    overlay: { control: 'boolean' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 四档尺寸 12 / 16 / 20 / 24 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

/** 有 label 才进无障碍树（role=status），适合首次加载 */
export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Spinner size="sm" label="加载中…" />
      <Spinner size="lg" label="正在拉取模型列表…" color="neutral" />
    </div>
  ),
};

/** 与文字同行 */
export const Inline: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Spinner size="sm" inline />
        正在同步 3 个文件
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button loading loadingText="保存中…">
          保存
        </Button>
        <span style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>按钮内复用同一个 glyph</span>
      </div>
    </div>
  ),
};

/** 区域级遮罩：父容器需要 position: relative */
export const Overlay: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: 320,
        padding: 16,
        border: '1px solid var(--oui-color-border)',
        borderRadius: 8,
        background: 'var(--oui-color-bg)',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>本月调用量</div>
      <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>
        1,204 / 5,000 次
        <br />
        剩余 3,796 次
      </div>
      <Spinner overlay label="刷新中…" />
    </div>
  ),
};
