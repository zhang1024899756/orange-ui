'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';
import type { Color } from '../../types';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Avatar } from '../Avatar';

const meta = {
  title: '组件/Badge 徽章',
  component: Badge,
  parameters: { layout: 'centered' },
  args: { count: 3, color: 'primary', size: 'sm' },
  argTypes: {
    color: { control: 'inline-radio', options: ['primary', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const COLORS: Color[] = ['primary', 'neutral', 'success', 'warning', 'danger'];

/** 5 个角色色 × 3 种徽章形态，独立显示 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {COLORS.map((color) => (
        <div key={color} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ width: 56, fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>{color}</span>
          <Badge count={3} color={color} />
          <Badge count={128} color={color} />
          <Badge dot color={color} />
          <Badge content="NEW" color={color} />
        </div>
      ))}
    </div>
  ),
};

/** 贴在元素右上角 */
export const WithChildren: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge count={3}>
        <Button variant="soft">消息</Button>
      </Badge>
      <Badge dot color="danger">
        <Button variant="ghost" shape="circle" aria-label="通知">
          <Icon name="bell" />
        </Button>
      </Badge>
      <Badge content="NEW" color="success">
        <Avatar name="张三" size="lg" />
      </Badge>
      <Badge count={12} color="warning">
        <Avatar name="李四" size="lg" shape="square" />
      </Badge>
    </div>
  ),
};

/** 溢出显示 max+，以及 md 尺寸 */
export const Overflow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Badge count={99} />
      <Badge count={100} />
      <Badge count={520} max={999} />
      <Badge count={8} size="md" />
      <Badge count={0} showZero />
    </div>
  ),
};

/** 偏移：把徽章挪到更靠外或更靠内 */
export const Offset: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge count={2}>
        <Avatar name="张三" size="lg" />
      </Badge>
      <Badge count={2} offset={[6, -4]}>
        <Avatar name="张三" size="lg" />
      </Badge>
      <Badge count={2} offset={[-6, 4]}>
        <Avatar name="张三" size="lg" />
      </Badge>
    </div>
  ),
};
