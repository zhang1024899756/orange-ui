'use client';

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './switch';

const meta = {
  title: '组件/Switch 开关',
  component: Switch,
  parameters: { layout: 'padded' },
  args: { 'aria-label': '开关', size: 'md', color: 'primary' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    color: { control: 'inline-radio', options: ['primary', 'success'] },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 尺寸 × 颜色矩阵 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['primary', 'success'] as const).map((color) => (
        <div key={color} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', width: 56 }}>{color}</span>
          <Switch aria-label={`${color}-sm-关`} color={color} size="sm" />
          <Switch aria-label={`${color}-sm-开`} color={color} size="sm" defaultChecked />
          <Switch aria-label={`${color}-md-关`} color={color} />
          <Switch aria-label={`${color}-md-开`} color={color} defaultChecked />
        </div>
      ))}
    </div>
  ),
};

/** 关键状态：选中 / 加载 / 禁用 / 带文案 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Switch aria-label="关" />
        <Switch aria-label="开" defaultChecked />
        <Switch aria-label="加载-关" loading />
        <Switch aria-label="加载-开" loading defaultChecked />
        <Switch aria-label="禁用-关" disabled />
        <Switch aria-label="禁用-开" disabled defaultChecked />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Switch aria-label="带文案关" checkedChildren="开" unCheckedChildren="关" />
        <Switch aria-label="带文案开" checkedChildren="开" unCheckedChildren="关" defaultChecked />
        <Switch aria-label="邮件通知" checkedChildren="接收邮件" unCheckedChildren="不接收" defaultChecked />
      </div>
    </div>
  ),
};

/** 受控用法：状态由外部持有 */
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Switch aria-label="自动更新" checked={checked} onChange={setChecked} checkedChildren="自动更新已开启" unCheckedChildren="自动更新已关闭" />
        <span style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>aria-checked = {String(checked)}</span>
      </div>
    );
  },
};