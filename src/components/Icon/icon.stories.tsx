import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './icon';

const meta = {
  title: '组件/Icon 图标',
  component: Icon,
  parameters: { layout: 'padded' },
  args: { name: 'search', size: 16 },
  argTypes: {
    size: { control: 'inline-radio', options: [12, 16, 20, 24] },
    color: { control: 'text' },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const NAMES = [
  'search', 'close', 'check', 'plus', 'minus', 'chevron-down', 'chevron-right', 'chevron-left',
  'chevron-up', 'arrow-right', 'arrow-left', 'arrow-up-right', 'heart', 'star', 'download',
  'upload', 'share', 'copy', 'link', 'external-link', 'filter', 'sort', 'more', 'fire',
  'sparkles', 'eye', 'trash', 'edit', 'refresh', 'info', 'alert-circle', 'check-circle',
  'x-circle', 'sun', 'moon', 'user', 'image', 'code', 'clock', 'lock', 'setting', 'bell',
  'home', 'tag', 'layers', 'play', 'log-out', 'menu', 'grid',
] as const;

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(88px, 1fr))', gap: 12 }}>
      {NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: 'grid',
            placeItems: 'center',
            gap: 6,
            padding: '12px 4px',
            border: '1px solid var(--oui-color-border)',
            borderRadius: 'var(--oui-radius-md)',
          }}
        >
          <Icon name={name} size={20} color="secondary" />
          <span style={{ fontSize: 11, color: 'var(--oui-color-text-tertiary)' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icon name="heart" size={12} />
      <Icon name="heart" size={16} />
      <Icon name="heart" size={20} />
      <Icon name="heart" size={24} />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger'] as const).map((c) => (
        <Icon key={c} name="star" size={20} color={c} />
      ))}
      {(['cyan', 'teal', 'amber', 'magenta'] as const).map((c) => (
        <Icon key={c} name="sparkles" size={20} color={c} />
      ))}
    </div>
  ),
};

export const Spin: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icon name="refresh" spin size={16} />
      <Icon name="refresh" spin size={24} color="primary" />
    </div>
  ),
};
