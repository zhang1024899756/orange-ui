'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './avatar';
import { AvatarGroup } from './avatar-group';
import type { AvatarStatus } from './avatar';
import { Icon } from '../Icon';
import { Badge } from '../Badge';

/** 内联 SVG 头像，Storybook 离线也能显示 */
const SAMPLE = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#F26B21'/><stop offset='1' stop-color='#FF9F45'/></linearGradient></defs><rect width='96' height='96' fill='url(#g)'/></svg>",
)}`;

const meta = {
  title: '组件/Avatar 头像',
  component: Avatar,
  parameters: { layout: 'centered' },
  args: { name: '张三', size: 'md', shape: 'circle' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
    status: { control: 'inline-radio', options: [undefined, 'online', 'away', 'busy', 'offline'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];

/** 尺寸 × 形状 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {(['circle', 'square'] as const).map((shape) => (
        <div key={shape} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ width: 56, fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>{shape}</span>
          {SIZES.map((size) => (
            <Avatar key={size} shape={shape} size={size} name="张三" />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** 6 档哈希回退底色 */
export const Fallback: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', maxWidth: 420 }}>
      {['张三', '李四', '王五', 'Alice Wang', 'Bob', '陈六'].map((name) => (
        <Avatar key={name} name={name} />
      ))}
      <Avatar />
      <Avatar fallback={<Icon name="sparkles" />} />
    </div>
  ),
};

/** 右下角状态点 */
export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {STATUSES.map((status) => (
        <Avatar key={status} name="张三" status={status} size="lg" />
      ))}
    </div>
  ),
};

/** 图片与加载失败回退 */
export const WithImage: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar src={SAMPLE} alt="示例图片头像" size="lg" />
      <Avatar src="https://example.invalid/missing.png" alt="加载失败的头像" name="李四" size="lg" />
      <Avatar src={SAMPLE} alt="带状态" size="lg" status="online" />
    </div>
  ),
};

/** 头像组：max=4，超出折叠成 +N */
export const Group: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <AvatarGroup size="md" max={4}>
        <Avatar name="张三" />
        <Avatar name="李四" />
        <Avatar name="王五" />
        <Avatar name="陈六" />
        <Avatar name="赵七" />
        <Avatar name="孙八" />
      </AvatarGroup>
      <AvatarGroup size="lg" max={3}>
        <Avatar name="Alice" src={SAMPLE} />
        <Avatar name="Bob" />
        <Avatar name="Cindy" />
        <Avatar name="Dave" />
        <Avatar name="Eve" />
      </AvatarGroup>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Badge count={3}>
          <Avatar name="张三" size="lg" />
        </Badge>
        <Badge dot>
          <Avatar name="李四" size="lg" status="online" />
        </Badge>
      </div>
    </div>
  ),
};
