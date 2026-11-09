'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Empty } from './empty';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Card } from '../Card';

const meta = {
  title: '组件/Empty 空状态',
  component: Empty,
  parameters: { layout: 'centered' },
  args: { size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 三档尺寸 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Empty
        size="sm"
        title="暂无收藏"
        description="收藏的模型会显示在这里"
        action={<Button size="sm">去逛逛</Button>}
      />
      <Empty
        size="md"
        title="暂无数据"
        description="换一个筛选条件试试"
        action={<Button size="md">重置筛选</Button>}
      />
      <Empty
        size="lg"
        title="还没有创建任何应用"
        description="从模板开始，三步就能发布一个应用"
        action={
          <>
            <Button>新建应用</Button>
            <Button variant="outlined">查看模板</Button>
          </>
        }
      />
    </div>
  ),
};

/** 结构：图形 / 标题 / 描述 / 操作，缺一不可时自动收紧间距 */
export const Structure: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      <div style={{ width: 220 }}>
        <Empty title="只有标题" />
      </div>
      <div style={{ width: 220 }}>
        <Empty title="标题 + 描述" description="没有操作按钮时下方不会留白" />
      </div>
      <div style={{ width: 220 }}>
        <Empty title="标题 + 操作" action={<Button size="sm">刷新</Button>} />
      </div>
      <div style={{ width: 220 }}>
        <Empty icon={<Icon name="search" size={24} />} title="换个关键词" description="没有找到匹配的结果" />
      </div>
    </div>
  ),
};

/** 放进卡片这类容器里 */
export const InCard: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Card padding="none" style={{ width: 360 }}>
      <Empty
        title="暂无运行记录"
        description="调用一次模型后会在这里生成记录"
        action={
          <Button variant="outlined" size="sm" icon={<Icon name="play" />}>
            立即调用
          </Button>
        }
      />
    </Card>
  ),
};
