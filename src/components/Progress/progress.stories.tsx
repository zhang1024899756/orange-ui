import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './progress';

const meta = {
  title: '组件/Progress 进度条',
  component: Progress,
  parameters: { layout: 'padded' },
  args: { value: 60, type: 'line', size: 'sm', color: 'primary', showLabel: true },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    type: { control: 'inline-radio', options: ['line', 'circle'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md'] },
    color: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'danger', 'neutral'] },
    status: { control: 'inline-radio', options: ['normal', 'success', 'error'] },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Line: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
      <Progress value={0} showLabel />
      <Progress value={35} showLabel />
      <Progress value={70} showLabel />
      <Progress value={100} showLabel gradient />
    </div>
  ),
};

export const Circle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Progress type="circle" value={25} showLabel />
      <Progress type="circle" value={62} showLabel color="success" />
      <Progress type="circle" value={88} showLabel color="danger" size="md" />
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
      <Progress indeterminate />
      <Progress indeterminate gradient />
      <Progress indeterminate type="circle" />
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
      <Progress value={100} status="success" showLabel />
      <Progress value={45} status="error" showLabel />
    </div>
  ),
};
