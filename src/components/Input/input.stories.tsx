'use client';

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';
import { Icon } from '../Icon';

const meta = {
  title: '组件/Input 输入框',
  component: Input,
  parameters: { layout: 'padded' },
  args: { placeholder: '请输入内容', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    status: { control: 'inline-radio', options: ['default', 'error'] },
    type: { control: 'inline-radio', options: ['text', 'password', 'search'] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 四档尺寸：24 / 28 / 32 / 40，全部落在控件网格上 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <Input size="xs" placeholder="xs 24" aria-label="xs" />
      <Input size="sm" placeholder="sm 28" aria-label="sm" />
      <Input size="md" placeholder="md 32" aria-label="md" />
      <Input size="lg" placeholder="lg 40" aria-label="lg" />
    </div>
  ),
};

/** 形态矩阵：类型 × 状态 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <Input type="text" placeholder="文本" aria-label="文本" />
      <Input type="password" placeholder="密码" aria-label="密码" defaultValue="123456" />
      <Input type="search" placeholder="搜索（胶囊）" aria-label="搜索" />
      <Input status="error" placeholder="错误态" aria-label="错误" defaultValue="格式不对" />
      <Input prefix={<Icon name="user" />} placeholder="带前置图标" aria-label="带前置图标" />
      <Input suffix={<span>元</span>} placeholder="带后缀" aria-label="带后缀" />
    </div>
  ),
};

/** 关键状态：清除 / 加载 / 禁用 / 字数 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <Input clearable defaultValue="可以清除的内容" aria-label="可清除" />
      <Input loading defaultValue="加载中不可编辑" aria-label="加载中" />
      <Input disabled defaultValue="禁用" aria-label="禁用" />
      <Input showCount maxLength={30} placeholder="最多 30 字" aria-label="字数" />
      <Input status="error" showCount maxLength={30} defaultValue="错误 + 计数" aria-label="错误计数" />
    </div>
  ),
};

/** 搜索框：胶囊圆角 + 前置图标 + 可清除 */
export const Search: Story = {
  render: () => {
    const [keyword, setKeyword] = useState('组件库');
    return (
      <div style={{ maxWidth: 420 }}>
        <Input
          type="search"
          prefix={<Icon name="search" />}
          clearable
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onClear={() => setKeyword('')}
          placeholder="搜索组件"
          aria-label="搜索组件"
        />
        <p style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginTop: 8 }}>当前关键词：{keyword || '（空）'}</p>
      </div>
    );
  },
};