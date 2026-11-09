'use client';

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './dialog';
import type { DialogProps } from './dialog';
import { Button } from '../Button';

const meta = {
  title: '组件/Dialog 对话框',
  component: Dialog,
  parameters: { layout: 'centered' },
  args: { open: false, title: '对话框标题', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 受控用法：状态放在外部，Dialog 自己只管渲染 */
function Demo({ buttonText = '打开对话框', ...props }: Partial<DialogProps> & { buttonText?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{buttonText}</Button>
      <Dialog {...props} open={open} onOpenChange={setOpen} onConfirm={() => setOpen(false)}>
        <p style={{ margin: 0, color: 'var(--oui-color-text-secondary)' }}>
          这里是对话框的内容区域。对话框负责焦点陷阱、ESC / 遮罩关闭，内容由使用方决定。
        </p>
      </Dialog>
    </>
  );
}

export const Playground: Story = {
  render: () => <Demo title="创建项目" description="填写项目名称后即可开始协作" />,
};

/** 三档宽度：360 / 480 / 640 */
export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Demo buttonText="sm 360" size="sm" title="小号对话框" />
      <Demo buttonText="md 480" size="md" title="中号对话框" />
      <Demo buttonText="lg 640" size="lg" title="大号对话框" />
    </div>
  ),
};

/** 关键状态：加载中 / 提交中 / 无默认底部 */
export const States: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Demo buttonText="内容加载中" title="正在加载" loading />
      <Demo buttonText="提交中（锁定关闭）" title="保存中" confirmLoading description="提交期间遮罩与 ESC 都被屏蔽" />
      <Demo buttonText="不要默认底部" title="纯自定义底部" footer={false} />
      <Demo buttonText="无标题（只有内容）" title={undefined} description={undefined} />
    </div>
  ),
};

/** 自定义底部：自己决定按钮组合 */
export const CustomFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>打开（自定义底部）</Button>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="选择操作"
          description="底部区域完全由使用方提供"
          footer={
            <>
              <Button variant="ghost" color="neutral" onClick={() => setOpen(false)}>
                稍后再说
              </Button>
              <Button variant="outlined" color="danger" onClick={() => setOpen(false)}>
                删除
              </Button>
              <Button color="primary" onClick={() => setOpen(false)}>
                知道了
              </Button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--oui-color-text-secondary)' }}>footer 接受任意节点，默认是「取消 + 确定」。</p>
        </Dialog>
      </>
    );
  },
};