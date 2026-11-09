import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './tag';
import type { TagColor } from './tag';
import { Icon } from '../Icon';

const meta = {
  title: '组件/Tag 标签',
  component: Tag,
  parameters: { layout: 'padded' },
  args: { children: '对话模型', variant: 'subtle', color: 'neutral', size: 'sm' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['subtle', 'outlined', 'solid'] },
    color: {
      control: 'inline-radio',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'cyan', 'teal', 'amber', 'magenta'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const COLORS: TagColor[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'cyan', 'teal', 'amber', 'magenta'];
const VARIANTS = ['subtle', 'outlined', 'solid'] as const;

export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {COLORS.map((color) => (
        <div key={color} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ width: 72, fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>{color}</span>
          {VARIANTS.map((variant) => (
            <Tag key={variant} color={color} variant={variant}>
              对话模型
            </Tag>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag color="cyan" icon={<Icon name="sparkles" size={14} />}>文本生成</Tag>
      <Tag color="teal" icon={<Icon name="image" size={14} />}>图像生成</Tag>
      <Tag color="amber" icon={<Icon name="fire" size={14} />}>热门</Tag>
      <Tag color="magenta" icon={<Icon name="heart" size={14} />}>收藏</Tag>
    </div>
  ),
};

export const Closable: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tag color="primary" closable>Qwen3-8B</Tag>
      <Tag closable>Apache-2.0</Tag>
    </div>
  ),
};

export const Chip: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tag color="primary" selected>已选中</Tag>
      <Tag color="primary">未选中</Tag>
      <Tag color="primary" variant="solid" selected>实心选中</Tag>
      <Tag disabled>禁用</Tag>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Tag size="sm">sm · 20</Tag>
      <Tag size="md">md · 24</Tag>
    </div>
  ),
};
