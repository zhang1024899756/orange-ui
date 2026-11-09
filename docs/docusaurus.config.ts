import type { Config } from '@docusaurus/types';
import path from 'node:path';

const DIST = path.resolve(__dirname, '../dist');

/**
 * 文档站消费的是打包产物（../dist），不是源码。
 * 好处：跑一次文档站就等于顺带验证一次即将发布的 npm 包 —— dist 缺文件、
 * exports 写错、CSS 没抽出来，这里会立刻黑屏。跑之前先 pnpm --dir .. build。
 */
const year = new Date().getFullYear();

const config: Config = {
  title: 'Orange UI',
  tagline: '20 个元素组件 · 4 套可切换主题 · 零运行时依赖',
  favicon: 'img/favicon.svg',
  // GitHub Pages 项目站点：https://zhang1024899756.github.io/orange-ui/
  url: 'https://zhang1024899756.github.io',
  baseUrl: '/orange-ui/',
  organizationName: 'zhang1024899756',
  projectName: 'orange-ui',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  i18n: { defaultLocale: 'zh-Hans', locales: ['zh-Hans'] },
  markdown: { format: 'mdx', hooks: { onBrokenMarkdownLinks: 'warn' } },
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      { hashed: true, language: ['zh', 'en'], docsRouteBasePath: '/', indexBlog: false, highlightSearchTermsOnTargetPage: true },
    ],
  ],
  plugins: [
    function aliasOrangeUi() {
      return {
        name: 'alias-orange-ui',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                '@arvinzxy/orange-ui$': path.join(DIST, 'index.js'),
                '@arvinzxy/orange-ui/style.css': path.join(DIST, 'index.css'),
                '@arvinzxy/orange-ui/tokens.css': path.join(DIST, 'tokens.css'),
              },
            },
          };
        },
      };
    },
  ],
  presets: [
    [
      'classic',
      {
        docs: { sidebarPath: './sidebars.ts', routeBasePath: '/', editUrl: undefined },
        blog: false,
        theme: { customCss: ['./src/css/custom.css'] },
      },
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false },
    navbar: {
      title: 'ORANGE UI',
      logo: { alt: 'Orange UI', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'guide', position: 'left', label: '指南' },
        { type: 'docSidebar', sidebarId: 'design', position: 'left', label: '设计' },
        { type: 'docSidebar', sidebarId: 'components', position: 'left', label: '组件' },
        { type: 'custom-themeSwitcher', position: 'right' },
        {
          type: 'dropdown',
          label: 'v0.1.0',
          position: 'right',
          items: [
            { label: '更新日志', to: '/changelog' },
            { label: 'npm', href: 'https://www.npmjs.com/package/@arvinzxy/orange-ui' },
            { label: 'GitHub 仓库', href: 'https://github.com/zhang1024899756/orange-ui' },
          ],
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: '© ' + year + ' orange-ui · MIT License · React 19 + tsup + 纯 CSS',
      links: [
        {
          title: '文档',
          items: [
            { label: '快速开始', to: '/guide/getting-started' },
            { label: '主题定制', to: '/guide/theming' },
            { label: '设计规范', to: '/design/tokens' },
          ],
        },
        {
          title: '组件',
          items: [
            { label: 'Button 按钮', to: '/components/button' },
            { label: 'Tag 标签', to: '/components/tag' },
            { label: 'Dialog 对话框', to: '/components/dialog' },
          ],
        },
        {
          title: '更多',
          items: [
            { label: '更新日志', to: '/changelog' },
            { label: '无障碍', to: '/guide/accessibility' },
          ],
        },
      ],
    },
    prism: {
      additionalLanguages: ['bash', 'json', 'diff'],
      theme: {
        plain: { color: '#27254C', backgroundColor: '#F7F9FD' },
        styles: [
          { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#6B6D8E', fontStyle: 'italic' } },
          { types: ['punctuation'], style: { color: '#464D5B' } },
          { types: ['keyword', 'tag', 'operator', 'important', 'atrule'], style: { color: '#B8480A' } },
          { types: ['string', 'attr-value', 'char', 'url'], style: { color: '#0B7A55' } },
          { types: ['function', 'class-name'], style: { color: '#2F6FED' } },
          { types: ['number', 'boolean', 'constant', 'symbol'], style: { color: '#A9610B' } },
          { types: ['attr-name', 'property'], style: { color: '#2FB3A1' } },
          { types: ['variable', 'parameter'], style: { color: '#27254C' } },
          { types: ['builtin', 'namespace'], style: { color: '#624AFF' } },
          { types: ['deleted'], style: { color: '#CF3A34' } },
          { types: ['inserted'], style: { color: '#0B7A55' } },
        ],
      },
      darkTheme: {
        plain: { color: '#D9DCE8', backgroundColor: '#181A24' },
        styles: [
          { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#7C819A', fontStyle: 'italic' } },
          { types: ['punctuation'], style: { color: '#BFC3D4' } },
          { types: ['keyword', 'tag', 'operator', 'important', 'atrule'], style: { color: '#FF9F45' } },
          { types: ['string', 'attr-value', 'char', 'url'], style: { color: '#54C1FA' } },
          { types: ['function', 'class-name'], style: { color: '#9FB4FF' } },
          { types: ['number', 'boolean', 'constant', 'symbol'], style: { color: '#F5A524' } },
          { types: ['attr-name', 'property'], style: { color: '#3DD4BE' } },
          { types: ['variable', 'parameter'], style: { color: '#F2F3F8' } },
          { types: ['builtin', 'namespace'], style: { color: '#C7B8FF' } },
          { types: ['deleted'], style: { color: '#FF7A73' } },
          { types: ['inserted'], style: { color: '#3DD4BE' } },
        ],
      },
    },
    docs: { sidebar: { hideable: false, autoCollapseCategories: false } },
  },
};

export default config;
