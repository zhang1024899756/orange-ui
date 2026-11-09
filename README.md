# orange-ui

React 19 组件库 · 20 个元素组件 · 4 套可切换主题 × 明暗两套配色。

面向的场景是**信息密集但仍有活力和温度的产品界面**（模型社区、内容平台、AI 应用工作台）：
高密度小字、低阴影、细边框；「活泼」只允许出现在 16px 彩色图标和品牌渐变里，不靠彩色大色块和阴影堆叠。

- 零运行时依赖（只有 `clsx`），样式是纯 CSS，不引入第二套 React 生态
- 主题切换只改 `data-oui-theme` / `data-oui-scheme`：不需要重新编译、不需要 JS 注入、SSR 不闪白
- 所有视觉都能被使用方的 CSS 变量覆盖：类名稳定不哈希，样式在 `@layer` 里，盖它不需要 `!important`

## 安装

```bash
pnpm add @arvinzxy/orange-ui
# 或 npm i / yarn add
```

## 快速开始

```tsx
import '@arvinzxy/orange-ui/style.css';
import { Button, Tag, Card, Input } from '@arvinzxy/orange-ui';

export function Demo() {
  return (
    <Card header={<span>模型</span>}>
      <Tag color="cyan" icon={<span>✦</span>}>文本生成</Tag>
      <Button variant="solid" color="primary" loading>保存</Button>
    </Card>
  );
}
```

**按需引入**（每个组件都有独立子路径与独立 CSS）：

```tsx
import { Button } from '@arvinzxy/orange-ui/button';
import '@arvinzxy/orange-ui/button/style.css';
import '@arvinzxy/orange-ui/tokens.css'; // 变量只引一次
```

## 主题

四套内置主题：`orange`（默认，蜜橘）、`violet`（紫罗兰）、`teal`（青屿）、`rose`（珊瑚）；每套都有明暗两版。

```html
<!-- 全局 -->
<html data-oui-theme="teal" data-oui-scheme="dark">
```

```css
/* 只换品牌色：一行 */
[data-oui-theme='my-brand'] { --oui-color-primary: #0EA5E9; }

/* 局部覆盖：只影响某个区块，不污染 :root */
.pricing-card { --oui-color-primary: #7C3AED; --oui-radius-md: 6px; }
```

```tsx
// 用组件给一套完整主题
import { ThemeProvider } from '@arvinzxy/orange-ui';
<ThemeProvider theme={{ primary: '#00AA88', primary2: '#3DD4BE' }}>…</ThemeProvider>
```

**不闪白**：主题属性写在 `<html>` 上、tokens 是静态 CSS，首屏即正确。若用 localStorage 存偏好，在 `<head>` 最前面放一段同步内联脚本（必须带 `try/catch`，Safari 无痕下 localStorage 会抛异常）：

```html
<script>(function(){try{var t=localStorage.getItem('oui-theme');
if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
if(t)document.documentElement.setAttribute('data-oui-scheme',t);}catch(e){}})();</script>
```

## 组件

**必做 12**：Button 按钮 · Icon 图标 · Link 链接 · Image 图片 · Number 数值 · Text 文字 · Tag 标签 · Input 输入框 · Switch 开关 · Slider 滑动条 · Dialog 对话框 · Progress 进度条

**补齐 8**：Card 卡片 · Avatar 头像 · Badge 徽章 · Skeleton 骨架屏 · Spinner 加载指示器 · Empty 空状态 · Tooltip 文字提示 · Divider 分割线

### 加载形态

有交互的组件都有 `loading`，且遵守同一条规则：**`aria-busy="true"` + 阻断交互 + 不改变盒子尺寸**（按钮用等宽 spinner 占位、数值用同高骨架条）。布局跳动是「看起来卡」和「看起来稳」的分界线。

| 组件 | loading 行为 |
|---|---|
| Button | 左侧转圈、文字隐形以锁定宽度；`loadingText` 有值时替换文字 |
| Input | 右侧转圈，可读不可改 |
| Switch | thumb 换转圈，保持原开关位置 |
| Slider | 轨道降透明、thumb 转圈、不可拖 |
| Dialog | 确定按钮转圈 + 内容区骨架 |
| Image / Card | 骨架占位，尺寸不塌陷 |
| Progress | `indeterminate` 即加载形态 |
| Number | 同高骨架条 |

无异步语义的组件（Tag / Link / Text / Icon / Avatar / Badge / Divider）不做 loading，用 `disabled` 表达。

## 设计约束

1. **非中性色不超过 14 个**：6 档中性 + 12 个强调色变量（派生自动生成） + 4 个装饰图标色，多出来的颜色不允许用。
2. **静态卡片零阴影**，只有浮层（Dialog / Tooltip）有阴影；分组靠间距和 1px 边框。
3. **字号只有 6 档**（12/14/16/20/24/32），需要强调就换字重或换色，不出现第 7 个字号。

对比度按 WCAG AA 校准：三级文字色 `#6B6D8E`（白底 5.00:1）、主色作为文字用 `--oui-color-primary-ink`（5.29:1）、
**实心背景上的字恒白**（`--oui-color-on-solid` = `#FFFFFF`）——为此每个角色配一条实心档，压到「白字刚好过线」的最浅值
（orange `#C74F0A` 4.61、teal `#0C8376` 4.64、rose `#E02353` 4.63、violet `#624AFF` 5.33 本身达标）。
中性色是例外：亮色深底白字（14.43:1）、暗色浅底深字（16.71:1）。
禁用态不参与对比度要求（WCAG 1.4.3 豁免），但命中区按 WCAG 2.5.8 用伪元素扩到 24×24。

## 无障碍

- 每个组件都有 `jest-axe` 零违规断言
- 键盘可达：Tag 的 chip、Switch、Slider（←/→/Home/End）、Dialog（焦点陷阱 + ESC）、Tooltip（focus 也显示）
- 焦点环只用 `:focus-visible`，不干扰鼠标用户
- `prefers-reduced-motion: reduce` 下关闭装饰性动效（骨架屏退化为静态灰块、过渡归零）；
  **加载指示器是唯一例外**，只降速到 1.6s/圈 —— 超过 5 秒的等待必须有持续反馈（WCAG 2.2.2）

## 文档站

完整文档在 `docs/`（Docusaurus 3.10）：指南、设计变量、20 个组件页、问题排查。
文档站消费的是 **`dist/` 打包产物**，所以它同时是一道发布前的验收。

```bash
pnpm build          # 先出产物
pnpm docs:dev       # http://localhost:3200
pnpm docs:build     # 静态站点 → docs/build
```

## 开发

```bash
pnpm install
pnpm storybook      # 组件验收台，右上角可切主题/明暗
pnpm test           # vitest + RTL + jest-axe
pnpm typecheck      # tsc --noEmit
pnpm build          # tsup → dist（ESM + CJS + d.ts/d.cts + 每组件 CSS）
```

## 浏览器

常青浏览器（Chrome/Edge/Safari/Firefox 最近两个大版本）。用到了原生 CSS `color-mix()`、`@layer`、`:where()`、`aspect-ratio`、`:focus-visible`。

## License

MIT
