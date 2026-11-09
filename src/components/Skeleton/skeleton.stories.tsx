'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton';
import { Button } from '../Button';

const meta = {
  title: '组件/Skeleton 骨架屏',
  component: Skeleton,
  parameters: { layout: 'centered' },
  args: { variant: 'text', lines: 3 },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'rect', 'circle', 'button'] },
    animated: { control: 'boolean' },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 四种形态 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: 320 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginBottom: 8 }}>text · 三行，末行 60%</div>
        <Skeleton variant="text" lines={3} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginBottom: 8 }}>rect · 封面</div>
        <Skeleton variant="rect" height={96} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginBottom: 8 }}>circle · 头像</div>
        <Skeleton variant="circle" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginBottom: 8 }}>button · 按钮</div>
        <Skeleton variant="button" />
      </div>
    </div>
  ),
};

/** 一条常见的「列表项」骨架组合 */
export const Composite: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, width: 360, alignItems: 'flex-start' }}>
      <Skeleton variant="circle" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  ),
};

/** 包裹模式：loading 切换时布局不跳 */
export const Wrapper: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 320 }}>
      <Skeleton loading>
        <div>内容区（加载中时被骨架替代）</div>
      </Skeleton>
      <Skeleton loading={false}>
        <Button block>真实内容</Button>
      </Skeleton>
    </div>
  ),
};

/** 关闭扫光 = 静态灰块 */
export const Static: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Skeleton variant="text" lines={3} animated={false} />
    </div>
  ),
};
