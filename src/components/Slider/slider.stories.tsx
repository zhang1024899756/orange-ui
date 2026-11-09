'use client';

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './slider';

const meta = {
  title: '组件/Slider 滑块',
  component: Slider,
  parameters: { layout: 'padded' },
  args: { defaultValue: 40, min: 0, max: 100, step: 1, tooltip: 'hover' },
  argTypes: {
    tooltip: { control: 'inline-radio', options: ['hover', 'always', 'never'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 双滑块：两个 thumb 各自带「最小值 / 最大值」标签，碰面后不再越过 */
export const Range: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <Slider range defaultValue={[20, 60]} aria-label="价格区间" />
      <Slider range defaultValue={[0, 100]} tooltip="always" aria-label="全区间" />
    </div>
  ),
};

/** 刻度：marks 的键是数值，值可以是任意节点 */
export const WithMarks: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 40 }}>
      <Slider defaultValue={40} marks={{ 0: '0℃', 25: '25℃', 50: '50℃', 75: '75℃', 100: '100℃' }} aria-label="温度" />
      <Slider range defaultValue={[30, 70]} marks={{ 0: '0', 50: '50', 100: '100' }} aria-label="区间刻度" />
    </div>
  ),
};

/** 三种提示：hover 悬停显示 / always 常显 / never 不显示 */
export const Tooltips: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <Slider tooltip="hover" defaultValue={30} aria-label="悬停显示" />
      <Slider tooltip="always" defaultValue={60} aria-label="常显" />
      <Slider tooltip="never" defaultValue={90} aria-label="不显示" />
    </div>
  ),
};

/** 关键状态：禁用 / 加载中 / 极小步长 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <Slider disabled defaultValue={30} aria-label="禁用" />
      <Slider loading defaultValue={70} aria-label="加载中" />
      <Slider defaultValue={0.3} min={0} max={1} step={0.1} tooltip="always" aria-label="0-1 步长 0.1" />
    </div>
  ),
};

/** 受控用法：拖动回调里改 state，外部也能驱动滑块 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <Slider
          value={value}
          onChange={(next) => setValue(next as number)}
          onChangeComplete={(next) => console.log('拖动结束', next)}
          tooltip="always"
          aria-label="音量"
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setValue(0)}>
            静音
          </button>
          <button type="button" onClick={() => setValue(100)}>
            最大
          </button>
          <span style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>当前值：{value}</span>
        </div>
      </div>
    );
  },
};