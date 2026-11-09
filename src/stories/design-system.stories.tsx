import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * 设计系统总览：这一页只是把 tokens 摆出来，方便对着改。
 * 右上角工具栏切换主题/明暗时，这一页会跟着变 —— 那是验证「主题只改强调色」最快的方式。
 */
const meta = {
  title: '总览/设计系统',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const NEUTRALS = [
  ['--oui-color-bg', '页面 / 卡片底'],
  ['--oui-color-bg-subtle', '次级底、输入框填充'],
  ['--oui-color-bg-muted', '三段底、hover 底'],
  ['--oui-color-border', '1px 分隔线'],
  ['--oui-color-border-strong', '输入框边'],
  ['--oui-color-text-tertiary', '元信息 12px'],
  ['--oui-color-text-secondary', '正文'],
  ['--oui-color-text', '标题 / 主文本'],
] as const;

const THEME_TOKENS = [
  '--oui-color-primary',
  '--oui-color-primary-hover',
  '--oui-color-primary-active',
  '--oui-color-primary-subtle',
  '--oui-color-primary-border',
  '--oui-color-on-solid',
  '--oui-color-success',
  '--oui-color-warning',
  '--oui-color-danger',
  '--oui-color-info',
] as const;

const ACCENTS = ['--oui-accent-cyan', '--oui-accent-teal', '--oui-accent-amber', '--oui-accent-magenta'] as const;

/** 实心档：所有实心背景（按钮 solid、徽章、solid 标签、头像回退底）都走这一层，文字恒白 */
const SOLIDS = [
  ['--oui-color-primary-solid', 'primary 实心按钮 / 徽章 / 标签'],
  ['--oui-color-primary-solid-hover', 'primary 实心 · hover'],
  ['--oui-color-primary-solid-active', 'primary 实心 · 按下'],
  ['--oui-color-success-solid', 'success'],
  ['--oui-color-warning-solid', 'warning'],
  ['--oui-color-danger-solid', 'danger'],
  ['--oui-color-info-solid', 'info'],
  ['--oui-accent-cyan-solid', 'accent cyan · 头像 tone 0'],
  ['--oui-accent-teal-solid', 'accent teal · 头像 tone 1'],
  ['--oui-accent-amber-solid', 'accent amber · 头像 tone 2'],
  ['--oui-accent-magenta-solid', 'accent magenta · 头像 tone 3'],
] as const;

/** neutral 的实心档不用白字（亮色深底白字、暗色浅底深字），所以单独摆一行 */
const NEUTRAL_SOLIDS = [
  ['--oui-color-neutral-solid', '--oui-color-on-neutral', 'neutral 实心 · 字色随明暗反转'],
] as const;

const SIZES = [
  ['--oui-font-2xl', '32 / 40'],
  ['--oui-font-xl', '24 / 32'],
  ['--oui-font-lg', '20 / 28'],
  ['--oui-font-md', '16 / 24'],
  ['--oui-font-sm', '14 / 22'],
  ['--oui-font-xs', '12 / 18'],
] as const;

const RADII = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'] as const;
const SPACES = [1, 2, 3, 4, 6, 8, 12] as const;

const Swatch = ({ token, note }: { token: string; note?: string }) => (
  <div style={{ display: 'grid', gap: 6 }}>
    <div
      style={{
        height: 44,
        borderRadius: 'var(--oui-radius-md)',
        background: `var(${token})`,
        border: '1px solid var(--oui-color-border)',
      }}
    />
    <code style={{ fontSize: 11, color: 'var(--oui-color-text-secondary)' }}>{token}</code>
    {note ? <span style={{ fontSize: 11, color: 'var(--oui-color-text-tertiary)' }}>{note}</span> : null}
  </div>
);

/** 实心档的关键不是色块，是「白字压上去能不能读」——所以色块里直接写字 */
const SolidSwatch = ({
  token,
  note,
  fg = '--oui-color-on-solid',
}: {
  token: string;
  note: string;
  fg?: string;
}) => (
  <div style={{ display: 'grid', gap: 6 }}>
    <div
      style={{
        height: 44,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 'var(--oui-radius-md)',
        background: `var(${token})`,
        color: `var(${fg})`,
        fontSize: 13,
        fontWeight: 'var(--oui-font-weight-medium)',
      }}
    >
      Aa 123
    </div>
    <code style={{ fontSize: 11, color: 'var(--oui-color-text-secondary)' }}>{token}</code>
    <span style={{ fontSize: 11, color: 'var(--oui-color-text-tertiary)' }}>{note}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
    <h3 style={{ margin: 0, fontSize: 'var(--oui-font-md)', color: 'var(--oui-color-text)' }}>{title}</h3>
    {children}
  </section>
);

export const Tokens: Story = {
  render: () => (
    <div style={{ maxWidth: 1080 }}>
      <Section title="中性色 · 6 档阶梯，不随主题变">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {NEUTRALS.map(([token, note]) => (
            <Swatch key={token} token={token} note={note} />
          ))}
        </div>
      </Section>

      <Section title="强调色 · 12 个变量，切主题只改这一组">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {THEME_TOKENS.map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </div>
      </Section>

      <Section title="实心档 · 白字 ≥4.5:1 的那一层">
        <p style={{ margin: 0, maxWidth: 720, fontSize: 12, color: 'var(--oui-color-text-secondary)' }}>
          实心背景恒白字（<code>--oui-color-on-solid</code>），所以底色不能直接用品牌色原色——每个角色压到
          「白字刚好 ≥4.5:1 的最浅值」。切右上角的主题，这一片会跟着换色，但白字始终达标；
          neutral 是唯一例外，字色随明暗反转。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {SOLIDS.map(([token, note]) => (
            <SolidSwatch key={token} token={token} note={note} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {NEUTRAL_SOLIDS.map(([token, fg, note]) => (
            <SolidSwatch key={token} token={token} fg={fg} note={note} />
          ))}
        </div>
      </Section>

      <Section title="装饰图标色 · 唯一允许出现彩色的地方">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {ACCENTS.map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </div>
      </Section>

      <Section title="字号阶梯 · 只有 6 档">
        <div style={{ display: 'grid', gap: 10 }}>
          {SIZES.map(([token, meta]) => (
            <div key={token} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span
                style={{
                  fontSize: `var(${token})`,
                  lineHeight: 1.2,
                  color: 'var(--oui-color-text)',
                  fontWeight: 'var(--oui-font-weight-semibold)',
                }}
              >
                组件规范 Aa 123
              </span>
              <code style={{ fontSize: 11, color: 'var(--oui-color-text-tertiary)' }}>
                {token} · {meta}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="圆角">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {RADII.map((r) => (
            <div key={r} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: 'var(--oui-color-primary-subtle)',
                  border: '1px solid var(--oui-color-primary-border)',
                  borderRadius: `var(--oui-radius-${r})`,
                }}
              />
              <code style={{ fontSize: 11, color: 'var(--oui-color-text-tertiary)' }}>{r}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="间距 · 只有 7 个值">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          {SPACES.map((s) => (
            <div key={s} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
              <div style={{ width: `var(--oui-space-${s})`, height: 32, background: 'var(--oui-color-primary)' }} />
              <code style={{ fontSize: 11, color: 'var(--oui-color-text-tertiary)' }}>{s}</code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {[
        ['orange', '蜜橘（默认）'],
        ['violet', '紫罗兰'],
        ['teal', '青屿'],
        ['rose', '珊瑚'],
      ].map(([theme, label]) => (
        <div
          key={theme}
          data-oui-theme={theme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 16,
            background: 'var(--oui-color-bg-subtle)',
            borderRadius: 'var(--oui-radius-lg)',
          }}
        >
          <span style={{ width: 96, fontSize: 12, color: 'var(--oui-color-text-secondary)' }}>{label}</span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--oui-radius-sm)',
              background: 'var(--oui-color-primary)',
            }}
          />
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--oui-radius-sm)',
              background: 'var(--oui-color-primary)',
              color: 'var(--oui-color-on-primary)',
              fontSize: 12,
            }}
          >
            主按钮
          </span>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--oui-radius-sm)',
              background: 'var(--oui-color-primary-subtle)',
              color: 'var(--oui-color-primary-ink)',
              fontSize: 12,
            }}
          >
            浅底
          </span>
          <span style={{ height: 32, width: 120, borderRadius: 999, background: 'var(--oui-gradient-brand)' }} />
        </div>
      ))}
    </div>
  ),
};
