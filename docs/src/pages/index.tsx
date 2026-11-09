import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Icon,
  Number,
  Progress,
  Tag,
  Text,
} from '@arvinzxy/orange-ui';

const FEATURES = [
  {
    title: '主题是真的能换',
    desc: '4 套品牌主题 × 明暗，切 <code>data-oui-theme</code> 一行属性就生效：不用重新编译、不用 JS 注入、SSR 不闪白。使用方还能用 CSS 变量盖掉任意一层。',
  },
  {
    title: '零运行时依赖',
    desc: '运行时只有 <code>clsx</code>（200 字节）。样式是纯 CSS，没有 CSS-in-JS 运行时，不往你的应用里塞第二套 React 生态。',
  },
  {
    title: '每个交互都有加载态',
    desc: '按钮锁宽转圈、输入框右缀转圈、开关 thumb 转圈、对话框确定键转 loading——而且都不改变布局盒子尺寸。',
  },
  {
    title: '无障碍是算出来的',
    desc: '所有文字对比度都跑过 WCAG AA；禁用态按 1.4.3 豁免；焦点环只在键盘操作时出现；每个组件都有 axe 零违规测试。',
  },
  {
    title: '按需引入到 CSS 粒度',
    desc: '每个组件有独立子路径和独立 CSS：<code>import { Button } from "@arvinzxy/orange-ui/button"</code>，只带上它的 7KB 样式。',
  },
  {
    title: '20 个组件，都是一屏内能用的',
    desc: '不追求数量。20 个元素组件刚好够拼出社区、内容平台、AI 工作台这类信息密集界面，每个都做到了细节。',
  },
];

const COMPONENTS = [
  ['button', 'Button', '按钮'],
  ['icon', 'Icon', '图标'],
  ['link', 'Link', '链接'],
  ['text', 'Text', '文字'],
  ['number', 'Number', '数值'],
  ['image', 'Image', '图片'],
  ['input', 'Input', '输入框'],
  ['switch', 'Switch', '开关'],
  ['slider', 'Slider', '滑动条'],
  ['tag', 'Tag', '标签'],
  ['badge', 'Badge', '徽章'],
  ['avatar', 'Avatar', '头像'],
  ['card', 'Card', '卡片'],
  ['progress', 'Progress', '进度条'],
  ['divider', 'Divider', '分割线'],
  ['dialog', 'Dialog', '对话框'],
  ['tooltip', 'Tooltip', '文字提示'],
  ['spinner', 'Spinner', '加载指示器'],
  ['skeleton', 'Skeleton', '骨架屏'],
  ['empty', 'Empty', '空状态'],
];

/** 首页那块「用真实组件拼出来的面板」—— 它本身就是一次演示 */
function ShowcaseStage() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Tag color="cyan" icon={<span aria-hidden="true">✦</span>}>文本生成</Tag>
        <Tag color="teal" icon={<span aria-hidden="true">◈</span>}>多模态</Tag>
        <Tag variant="outlined">Apache-2.0</Tag>
        <Badge content="NEW" color="danger" />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button size="sm" variant="outlined" icon={<span aria-hidden="true">♡</span>}>收藏</Button>
          <Button size="sm">下载模型</Button>
        </span>
      </div>

      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name="Qwen" size="sm" shape="square" />
            <div>
              <Text weight={600} size="md">Qwen3-235B-A22B</Text>
              <Title2>通义千问 · 混合专家模型</Title2>
            </div>
          </div>
        }
        footer={
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: 'var(--oui-color-text-tertiary)', fontSize: 12 }}>
            <span>下载 <Number value={9211715} compact /></span>
            <span>点赞 <Number value={438} /></span>
            <span style={{ marginLeft: 'auto' }}>2026-11-09 更新</span>
          </div>
        }
      >
        <Text tone="secondary">
          在数学、代码与逻辑推理三项基准上较上一代提升明显；支持 100 多种语言，
          推理与工具调用链路可作为 Agent 的底座。
        </Text>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--oui-color-text-tertiary)' }}>
            <span>配额使用</span>
            <span>68%</span>
          </div>
          <Progress value={68} gradient />
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="soft" icon={<span aria-hidden="true">↻</span>}>同步</Button>
        <Button variant="outlined" loading>正在部署</Button>
        <Button variant="ghost" disabled>暂不可用</Button>
        <Divider orientation="vertical" />
        <Button variant="text" iconRight={<Icon name="chevron-right" size={14} />}>查看全部</Button>
      </div>
    </div>
  );
}

function Title2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--oui-color-text-tertiary)', marginTop: 2 }}>{children}</div>
  );
}

export default function Home() {
  return (
    <Layout title="Orange UI" description="20 个元素组件 · 4 套可切换主题 · 零运行时依赖">
      <main className="oui-home">
        <section className="oui-hero">
          <div className="oui-hero__kicker">
            <span aria-hidden="true">●</span> React 19 · 20 个元素组件 · 4 套主题
          </div>
          <h1 className="oui-hero__title">
            为「信息密集但仍要有温度」的界面，<em>造一套组件</em>
          </h1>
          <p className="oui-hero__lead">
            高密度小字、低阴影、细边框的骨相，加上只能出现在 16px 彩色图标里的那点活泼。
            面向模型社区、内容平台、AI 工作台——不是后台管理系统。
          </p>
          <div className="oui-hero__actions">
            <Button size="lg" href="/guide/getting-started">开始使用</Button>
            <Button size="lg" variant="outlined" href="/design/tokens">设计变量</Button>
          </div>

          <div className="oui-hero__stage">
            <div className="oui-hero__stage-label">LIVE · 这一块是用真实的 orange-ui 组件拼的</div>
            <ShowcaseStage />
          </div>
        </section>

        <section className="oui-section">
          <h2 className="oui-section__title">为什么是这套</h2>
          <p className="oui-section__desc">六条，每条都能在你的项目里被验证。</p>
          <div className="oui-grid">
            {FEATURES.map((feature) => (
              <div className="oui-feature" key={feature.title}>
                <div className="oui-feature__title">
                  <span aria-hidden="true" style={{ color: 'var(--oui-color-primary)' }}>◆</span>
                  {feature.title}
                </div>
                <p className="oui-feature__desc" dangerouslySetInnerHTML={{ __html: feature.desc }} />
              </div>
            ))}
          </div>
        </section>

        <section className="oui-section">
          <h2 className="oui-section__title">20 个元素组件</h2>
          <p className="oui-section__desc">刚好够拼出一屏社区页，少一个都拼不完整。</p>
          <div className="oui-comp-list">
            {COMPONENTS.map(([slug, en, zh]) => (
              <Link className="oui-comp-list__item" to={'/components/' + slug} key={slug}>
                <span>{zh}</span>
                <span className="oui-comp-list__en">{en}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
