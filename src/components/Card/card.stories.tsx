'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './card';
import type { CardProps } from './card';
import { Button } from '../Button';
import { Tag } from '../Tag';
import { Avatar } from '../Avatar';

const meta = {
  title: '组件/Card 卡片',
  component: Card,
  parameters: { layout: 'centered' },
  args: { variant: 'outlined', padding: 'md', children: '卡片内容' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['outlined', 'elevated'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    hoverable: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const VARIANTS: NonNullable<CardProps['variant']>[] = ['outlined', 'elevated'];
const PADDINGS: NonNullable<CardProps['padding']>[] = ['none', 'sm', 'md', 'lg'];

/** 形态 × 内边距矩阵 */
export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {VARIANTS.map((variant) => (
        <div key={variant}>
          <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginBottom: 8 }}>{variant}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PADDINGS.length}, minmax(0, 1fr))`, gap: 16 }}>
            {PADDINGS.map((padding) => (
              <Card key={padding} variant={variant} padding={padding}>
                <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>padding={padding}</div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

/** 完整结构：封面 / 头部 / 主体 / 底部 */
export const Composite: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 320px))', gap: 16 }}>
      <Card
        hoverable
        cover={
          <div
            style={{
              height: 120,
              background: 'var(--oui-gradient-brand)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--oui-color-on-primary)',
              fontSize: 13,
            }}
          >
            封面
          </div>
        }
        header="模型详情"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>2.1k 次下载</span>
            <Button size="sm">使用</Button>
          </div>
        }
      >
        一个面向开发者的开源社区卡片示例，用于展示标题、描述与操作区。
      </Card>

      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name="张三" size="sm" status="online" />
              <span style={{ fontSize: 14 }}>张三</span>
            </div>
            <Tag color="primary" size="sm">精选</Tag>
          </div>
        }
        footer={<span style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>3 小时前更新</span>}
      >
        自定义头部与底部：head 里放头像和标签，footer 放时间戳。
      </Card>
    </div>
  ),
};

/** 可点击：悬停上浮 + 键盘可达 */
export const Clickable: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 300px))', gap: 16 }}>
      <Card hoverable onClick={() => {}}>
        点我（Tab 聚焦后按 Enter / Space 也能触发）
      </Card>
      <Card variant="elevated" hoverable onClick={() => {}}>
        浮起 + 可点击
      </Card>
    </div>
  ),
};

/** 加载中：整卡骨架，尺寸不跳 */
export const Loading: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 340 }}>
      <Card loading header="标题">
        内容
      </Card>
      <Card loading cover={<div style={{ height: 120 }} />}>
        带封面的卡片
      </Card>
    </div>
  ),
};
