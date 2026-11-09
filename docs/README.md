# orange-ui · 文档站

Docusaurus 3.10 站点。**它消费的是打包产物**（`../dist`），不是源码 ——
每跑一次文档站，就等于顺带验证一次即将发布的 npm 包：dist 缺文件、exports 写错、
CSS 没抽出来，这里会立刻黑屏。

## 跑起来

```bash
# 先在库根目录构建产物
cd ..
pnpm build

# 再到 docs 目录
cd docs
pnpm dev        # http://localhost:3200
pnpm build      # 产出 build/ 静态站点
pnpm serve      # 本地预览构建结果
```

从库根目录也可以：`pnpm docs:dev` / `pnpm docs:build` / `pnpm docs:serve`。

## 目录

```
docs/
├─ docs/                       # 所有内容页（MDX）
│  ├─ guide/                   # 指南：快速开始 / 主题定制 / 无障碍
│  ├─ design/                  # 设计：变量 / 字体 / 原则
│  ├─ components/              # 20 个组件页
│  └─ changelog.mdx
├─ src/
│  ├─ components/Demo.tsx      # 实时预览框（页面里那个 LIVE 区域）
│  ├─ components/PropsTable.tsx# API 表，读 generated/props.json
│  ├─ components/Swatch.tsx    # 色块
│  ├─ components/ThemeSwitcher/# 顶栏的 4 色 + 明暗切换
│  ├─ css/custom.css           # Infima → --oui-* token 映射 + 站点样式
│  ├─ pages/index.tsx          # 首页（用组件库自己拼的）
│  ├─ theme/Root.tsx           # 引入组件库样式、恢复主题、给 body 加 .oui-root
│  └─ generated/props.json     # 由 scripts/gen-props.mjs 生成，勿手改
├─ scripts/gen-props.mjs       # 从组件 TS 接口 + JSDoc 生成 API 表数据
├─ docusaurus.config.ts
└─ sidebars.ts
```

## 写一个新组件页

1. 在 `src/components/<Name>/<name>.tsx` 里给每个对外 prop 写 `/** 说明，默认 xxx */`（`gen-props` 从这里读说明与默认值）
2. 跑 `node scripts/gen-props.mjs`（dev/build 前会自动跑）
3. 参考 `docs/docs/components/button.mdx` 写页面：frontmatter → import → 定位文案 → 2–5 个 `<Demo>` + 代码 → 无障碍 → `<PropsTable name="X" />`
4. `sidebars.ts` 里加进对应分类

> MDX 里的组件必须 **在文件顶部 import**，否则构建报 `Expected component X to be defined`。

## 主题

文档站本身也是组件库的一次演出：顶栏的 4 个圆点切换 `data-oui-theme`，
☀/☾ 切换 `data-oui-scheme`，整站（含色块、组件、代码块配色）一起变。
选择存在 localStorage，并在 `theme/Root.tsx` 里于首帧写回，避免刷新闪白。
