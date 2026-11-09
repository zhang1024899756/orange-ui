# CHANGELOG

## 0.2.0

实心背景上的字统一为白色；为此颜色分成 fill / solid 两层。

### 变更
- 实心背景恒白字：新增 `--oui-color-on-solid`（`#FFFFFF`，全库唯一取值），`--oui-color-on-primary` /
  `on-success` / `on-warning` / `on-danger` / `on-info` / `on-accent` 全部是它的别名
- 新增实心档：`--oui-color-<role>-solid` / `-solid-hover` / `-solid-active`，逐档压到「白字刚好
  ≥4.5:1 的最浅值」——primary orange `#C74F0A`(4.61) / violet `#624AFF`(5.33，本身达标不压深) /
  teal `#0C8376`(4.64) / rose `#E02353`(4.63)；success 5.34 / warning 4.77 / danger 4.87 / info 4.60；
  四个装饰色 4.60–4.65。hover / active 档 4.60–6.71 全区间过线
- `--oui-color-<role>` 退回 fill 层（描边、16px 图标、焦点环、10% 浅底、渐变副色、状态点），
  `-ink` 仍是文本级用法：两者语义不变，变的只是「实心背景不再直接用它们」
- 中性色是例外：实心底仍是角色色本身，文字色由 `--oui-color-on-neutral` 跟随明暗反转
  （亮色 `#27254C` 底 + 白字 14.43:1；暗色 `#F2F3F8` 底 + `#12131A` 字 16.71:1）

### 修复
- Badge 主题色底、Avatar 六档回退底色（tone 0–3）改用 `*-solid`：白字压在装饰色原色 `#54C1FA` /
  `#2FB3A1` / `#F5A524` / `#E056A0` 上只有 2.02–3.50，读不出来。Avatar tone 4 改走中性档（按明暗
  反转），tone 5 保持 `bg-muted` 的弱化档
- Tag 的 `solid` 形态恒白字（含 16px 图标），底色走 `*-solid`；`subtle` / `outlined` 的文字仍走
  `*-ink` 与中性色，不受影响
- `prefers-reduced-motion: reduce` 下加载指示器不再冻结：0.1.x 的 `--oui-spin-duration: 0ms` 叠加
  `animation-duration: 0.001ms !important` 会让 spinner 完全静止（jsdom 不做动画，单测测不出来）。
  现在降速到 1.6s/圈 —— 超过 5 秒的等待必须有持续反馈（WCAG 2.2.2）；base.css 用
  `:not(.oui-spinner-glyph)` 把它排除在压缩规则外，并由 `spinner-motion.test.ts` 静态守住

### 新增
- `ThemeProvider` 的 `primarySolid`：不传时由 `primary` 自动派生实心档（保持色相/饱和度、压低明度到
  白字 ≥4.5:1，并按 92% / 86% 派生 hover / active）。`<ThemeProvider primary="#00AA88">` 的实心按钮
  直接就是 `#00806A`（4.89），不再需要外层 div 补变量
- `src/utils/color.ts`：WCAG 对比度与实心档派生的纯函数（`deriveSolidColor` / `contrastRatio` 等），
  服务端与客户端结果一致

### 注意
- **纯 CSS 注册的自定义主题**仍要自己给 `--oui-color-primary-solid`（例如 `#0EA5E9` → `#0378B4`，4.83）：
  CSS 里没有运行时算对比度的能力。用 `ThemeProvider` 则已自动处理
- `Progress` 的 `indeterminate` 在 `prefers-reduced-motion: reduce` 下从「停止 + 静态半透明」改为
  降速到 2.4s/轮 —— 与 spinner 同口径（WCAG 2.2.2：等待反馈必须持续），base.css 的全局压制同步放行

## 0.1.0

首个版本：把原来 React 17 + CRA 的演示应用重构成可发布的 React 19 组件库。

### 新增
- 构建：tsup 多入口 → ESM + CJS + `.d.ts`/`.d.cts` + 每组件独立 CSS + 独立 `tokens.css`
- 主题：4 套品牌主题 × 明暗两套配色，纯 CSS 变量，`data-oui-theme` / `data-oui-scheme` 切换
- 样式：`@layer oui.*` 分层 + 稳定语义类名（`.oui-*`），使用方用普通选择器即可覆盖
- 20 个元素组件（含 12 个带交互与 loading 形态）
- 无障碍：全部组件通过 jest-axe；键盘交互、焦点陷阱、命中区扩展
- 开发验收：Storybook 10（含主题切换工具栏）+ Vitest 5 + Testing Library
- 文档站：Docusaurus 3.10（`docs/`），30 页 —— 指南 / 设计变量 / 20 个组件页 / 更新日志，
  顶栏可切 4 套主题与明暗，本地搜索；文档站消费 `dist/` 打包产物，同时是一道发布验收
- API 表由 `docs/scripts/gen-props.mjs` 从组件 TS 接口与 JSDoc 生成，不会与实现脱节

### 修复
- 文档站导航：首页「开始使用 / 设计变量」、指南首页、设计首页、组件总览的 20 张卡片都写成
  了裸绝对路径（`/guide/...`、`/components/...`），漏掉站点 `baseUrl`，线上全部 404。
  现在统一走 `useBaseUrl`（`DocButton`）与 `<Link to>`，本地与 GitHub Pages 子路径都正确
- 色板：按钮 / 徽章 / 头像上的墨色按 AA 反解，从统一的深墨 `#15121F` 改为每套主题各自
  「静止态仍 ≥4.5:1 的最浅一档」——orange `#232038`(5.17)、teal `#1A1728`(4.62)、
  rose `#181522`(4.60)，装饰色统一 `#201D30`（最紧的品红底 4.69）。视觉上比纯黑轻一档
- `Tag`：同时传 `onClick` 与 `closable` 时会渲染出 `<button>` 内嵌 `<button>`（非法 HTML，
  React 19 水合报错）。现在这种组合降级为 `span[role="button"]` + 键盘处理，关闭按钮仍是真按钮
- `Link`：`external` 且调用方显式传了 `target` 时不会补 `rel="noopener noreferrer"`（tabnabbing 风险），
  现在只要 `external` 就补齐

### 移除
- CRA 脚手架、node-sass、FontAwesome 全家桶（图标改为内置 SVG 集）
