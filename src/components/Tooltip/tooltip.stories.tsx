'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './tooltip';
import { Button } from '../Button';
import { Icon } from '../Icon';

const meta = {
  title: '组件/Tooltip 文字提示',
  component: Tooltip,
  parameters: { layout: 'centered' },
  args: {
    content: '这是一条文字提示',
    placement: 'top',
    delay: 120,
    arrow: true,
    // children 是必填的单元素，给个默认值，其余 story 就不用各自补
    children: <Button variant="outlined">悬停或聚焦我</Button>,
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    delay: { control: { type: 'number', min: 0, max: 1000, step: 20 } },
    arrow: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 四个方位（v1 不做自动翻转） */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 56, padding: 40 }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Tooltip key={placement} content={`placement="${placement}"`} placement={placement}>
          <Button variant="soft">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/** 显示延迟与箭头开关 */
export const Delay: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tooltip content="立即出现（delay=0）" delay={0}>
        <Button variant="outlined">0ms</Button>
      </Tooltip>
      <Tooltip content="默认 120ms" delay={120}>
        <Button variant="outlined">120ms</Button>
      </Tooltip>
      <Tooltip content="慢一点，500ms" delay={500}>
        <Button variant="outlined">500ms</Button>
      </Tooltip>
      <Tooltip content="没有箭头" arrow={false}>
        <Button variant="outlined">无箭头</Button>
      </Tooltip>
    </div>
  ),
};

/** 异步内容：内容还没到先显示加载态 */
export const Loading: Story = {
  render: () => (
    <Tooltip content="" loading>
      <Button variant="soft">悬停查看异步提示</Button>
    </Tooltip>
  ),
};

/** 键盘可达：Tab 聚焦即出现，Esc 关闭 */
export const Keyboard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Tooltip content="Tab 到这里就会出现，按 Esc 关闭">
        <Button variant="outlined">聚焦我</Button>
      </Tooltip>
      <Tooltip content="图标按钮">
        <Button shape="circle" variant="ghost" aria-label="设置" icon={<Icon name="setting" />} />
      </Tooltip>
      <Tooltip content="禁用后完全没有提示" disabled>
        <Button variant="text">disabled</Button>
      </Tooltip>
    </div>
  ),
};

/** 长文本会自动换行，最大宽度由 --oui-tooltip-max 控制 */
export const LongContent: Story = {
  render: () => (
    <Tooltip content="这条提示比较长，用来验证最大宽度与自动换行行为，超过最大宽度后会折成多行显示。">
      <Button variant="soft">长文本</Button>
    </Tooltip>
  ),
};
