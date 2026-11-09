import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './divider';
import type { DividerProps } from './divider';

const meta = {
  title: '组件/Divider 分割线',
  component: Divider,
  parameters: { layout: 'padded' },
  args: { orientation: 'horizontal', spacing: 'md' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    spacing: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const spacings: NonNullable<DividerProps['spacing']>[] = ['sm', 'md', 'lg'];

/** 三档间距 / 虚线 / 缩进 / 带文字 */
export const Matrix: Story = {
  render: () => (
    <div>
      {spacings.map((spacing) => (
        <div key={spacing}>
          <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>spacing: {spacing}</div>
          <Divider spacing={spacing} />
        </div>
      ))}
      <Divider dashed />
      <Divider inset />
      <Divider>最近访问</Divider>
    </div>
  ),
};

/** 垂直分割线：撑满行高，用在行内信息分组 */
export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
      <span>模型</span>
      <Divider orientation="vertical" />
      <span>数据集</span>
      <Divider orientation="vertical" dashed />
      <span>创空间</span>
    </div>
  ),
};

export const Decorative: Story = {
  render: () => (
    <div>
      <span>纯装饰分割线不进无障碍树</span>
      <Divider decorative spacing="lg" />
      <span>下面的内容</span>
    </div>
  ),
};
