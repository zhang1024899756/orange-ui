# CHANGELOG

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
