import type { Meta, StoryObj } from '@storybook/react-vite';
import { Number } from './number';
import type { NumberProps } from './number';

const meta = {
  title: '组件/Number 数值',
  component: Number,
  parameters: { layout: 'padded' },
  args: { value: 128460, size: 'md', mono: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Number>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 普通 / 千分位 / 紧凑 / 带单位 */
export const Formats: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Number value={1234567} />
      <Number value={1234.5} precision={2} />
      <Number value={14000} compact suffix="次" />
      <Number value={1200} compact />
      <Number value={98} suffix="%" prefix="约" />
    </div>
  ),
};

const sizes: NonNullable<NumberProps['size']>[] = ['xs', 'sm', 'md', 'lg'];

/** 四档字号 × 涨跌 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
        {sizes.map((size) => (
          <Number key={size} value={8862} size={size} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
        <Number value={12.4} precision={1} trend={1} suffix="%" />
        <Number value={-3.8} precision={1} trend={-1} suffix="%" />
        <Number value={0} precision={1} trend={0} suffix="%" />
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
      <Number value={1} size="sm" loading />
      <Number value={1} size="md" loading />
      <Number value={1} size="lg" loading />
    </div>
  ),
};
