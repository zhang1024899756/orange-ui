import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import type { ButtonProps } from './button';
import { Icon } from '../Icon';

const meta = {
  title: '组件/Button 按钮',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: '按钮', variant: 'solid', color: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'outlined', 'soft', 'ghost', 'text'] },
    color: { control: 'inline-radio', options: ['primary', 'neutral', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    shape: { control: 'inline-radio', options: ['rect', 'round', 'circle'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const VARIANTS: NonNullable<ButtonProps['variant']>[] = ['solid', 'outlined', 'soft', 'ghost', 'text'];
const COLORS: NonNullable<ButtonProps['color']>[] = ['primary', 'neutral', 'success', 'warning', 'danger'];

/** 4 尺寸 × 5 形态 × 5 角色 = 完整矩阵 */
export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {COLORS.map((color) => (
        <div key={color}>
          <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginBottom: 8 }}>{color}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${VARIANTS.length}, minmax(160px, auto))`, gap: 12, alignItems: 'center' }}>
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} color={color}>
                {variant}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button size="xs">xs 24</Button>
      <Button size="sm">sm 28</Button>
      <Button size="md">md 32</Button>
      <Button size="lg">lg 40</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button loading>保存</Button>
      <Button loading loadingText="保存中…">
        保存
      </Button>
      <Button loading variant="outlined">
        提交
      </Button>
      <Button loading variant="soft" color="neutral">同步</Button>
      <Button loading icon={<Icon name="download" />} shape="circle" aria-label="下载" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button icon={<Icon name="plus" />}>新建项目</Button>
      <Button variant="outlined" iconRight={<Icon name="chevron-right" />}>查看详情</Button>
      <Button variant="ghost" icon={<Icon name="search" />} shape="circle" aria-label="搜索" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button disabled>禁用</Button>
      <Button disabled variant="outlined">禁用描边</Button>
      <Button disabled variant="soft" color="danger">禁用危险</Button>
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Button href="#detail" iconRight={<Icon name="arrow-up-right" />}>
      查看详情
    </Button>
  ),
};
