import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './text';
import type { TextProps } from './text';

const meta = {
  title: '组件/Text 文字',
  component: Text,
  parameters: { layout: 'padded' },
  args: { children: '正文字体', size: 'md', weight: 400, tone: 'default' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    weight: { control: 'inline-radio', options: [400, 500, 600] },
    tone: {
      control: 'inline-radio',
      options: ['default', 'secondary', 'tertiary', 'disabled', 'primary', 'danger', 'success', 'inverse'],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const sizes: NonNullable<TextProps['size']>[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/** 六档字号 × 三档字重 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <Text size="xs" tone="tertiary" style={{ width: 48 }}>
            {size}
          </Text>
          <Text size={size} weight={400}>字号 {size} 示例 0123456789</Text>
          <Text size={size} weight={500}>Medium</Text>
          <Text size={size} weight={600}>Semibold</Text>
        </div>
      ))}
    </div>
  ),
};

/** 八种色调，全部指向语义 token */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {(['default', 'secondary', 'tertiary', 'disabled', 'primary', 'danger', 'success', 'inverse'] as const).map(
        (tone) => (
          <div
            key={tone}
            style={{
              background: tone === 'inverse' ? 'var(--oui-color-text)' : undefined,
              padding: tone === 'inverse' ? 8 : undefined,
              borderRadius: 4,
            }}
          >
            <Text tone={tone}>{tone} · 这一档文字的颜色</Text>
          </div>
        ),
      )}
    </div>
  ),
};

/** 截断、可复制、等宽、斜体 */
export const Behaviors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Text truncate title="悬停看全文">
        单行省略：这是一段很长很长的说明文字，父容器再窄也只能显示一行并以省略号收尾。
      </Text>
      <Text truncate={2}>
        两行截断：这是一段很长很长的说明文字，用来演示多行 clamp。超过两行以后会被裁掉，并在结尾加省略号。
      </Text>
      <Text copyable>点右侧图标可以复制这一段文字</Text>
      <Text mono>ID: oui-2026-11-09-7f3a</Text>
      <Text italic tone="secondary">斜体用于引用与注释</Text>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Text tone="disabled">禁用文字：只读、不可交互的说明</Text>
      <Text tone="disabled" truncate>
        禁用 + 截断：这一行同样会被省略号收尾
      </Text>
    </div>
  ),
};
