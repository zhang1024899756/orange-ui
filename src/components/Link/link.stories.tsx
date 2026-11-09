import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './link';
import type { LinkProps } from './link';
import { Icon } from '../Icon';

const meta = {
  title: '组件/Link 链接',
  component: Link,
  parameters: { layout: 'padded' },
  args: { children: '查看文档', href: '#docs', color: 'primary', underline: 'hover', size: 'sm' },
  argTypes: {
    color: { control: 'inline-radio', options: ['primary', 'neutral', 'danger'] },
    underline: { control: 'inline-radio', options: ['hover', 'always', 'none'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const colors: NonNullable<LinkProps['color']>[] = ['primary', 'neutral', 'danger'];
const underlines: NonNullable<LinkProps['underline']>[] = ['hover', 'always', 'none'];

/** 3 色 × 3 种下划线行为 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {colors.map((color) => (
        <div key={color} style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link color={color} underline="hover">
            悬停出现下划线
          </Link>
          <Link color={color} underline="always">
            始终有下划线
          </Link>
          <Link color={color} underline="none">
            永不下划线
          </Link>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
      <Link href="#a" size="xs">xs 12</Link>
      <Link href="#a" size="sm">sm 14</Link>
      <Link href="#a" size="md">md 16</Link>
      <Link href="#a" size="lg">lg 20</Link>
    </div>
  ),
};

/** 外链、图标、禁用 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Link href="https://example.com" external>
        外部链接：自动 target=_blank 并带箭头
      </Link>
      <Link href="#api" icon={<Icon name="code" size={14} />}>
        带前置图标
      </Link>
      <Link href="#deleted" color="danger">
        危险操作链接
      </Link>
      <Link href="#disabled" disabled>
        禁用链接：不可聚焦、不可点
      </Link>
    </div>
  ),
};
