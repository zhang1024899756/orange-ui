import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '..');
const DOCS = [
  ['guide/index', '指南', '从这里开始'],
  ['guide/getting-started', '快速开始', '安装与第一个组件'],
  ['guide/theming', '主题定制', '4 套内置主题 + 自定义品牌色'],
  ['guide/accessibility', '无障碍', '我们怎么处理对比度、焦点与读屏'],
  ['changelog', '更新日志', '版本历史'],
  ['design/index', '设计', '这套设计语言的三条纪律'],
  ['design/tokens', '设计变量', '颜色、圆角、间距、阴影'],
  ['design/typography', '字体与字号', '6 档字号、3 档字重'],
  ['design/principles', '设计原则', '为什么是现在这个样子'],
  ['components/index', '组件总览', '20 个元素组件'],
];
const COMPONENTS = {
  icon: ['Icon 图标', 'inline'],
  link: ['Link 链接', '基础'],
  text: ['Text 文字', '基础'],
  number: ['Number 数值', '基础'],
  image: ['Image 图片', '基础'],
  input: ['Input 输入框', '表单'],
  switch: ['Switch 开关', '表单'],
  slider: ['Slider 滑动条', '表单'],
  tag: ['Tag 标签', '数据展示'],
  badge: ['Badge 徽章', '数据展示'],
  avatar: ['Avatar 头像', '数据展示'],
  card: ['Card 卡片', '数据展示'],
  progress: ['Progress 进度条', '数据展示'],
  divider: ['Divider 分割线', '数据展示'],
  dialog: ['Dialog 对话框', '反馈'],
  tooltip: ['Tooltip 文字提示', '反馈'],
  spinner: ['Spinner 加载指示器', '反馈'],
  skeleton: ['Skeleton 骨架屏', '反馈'],
  empty: ['Empty 空状态', '反馈'],
};
mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
let written = 0;
for (const [id, title, desc] of DOCS) {
  const file = path.join(ROOT, 'docs', id + '.mdx');
  mkdirSync(path.dirname(file), { recursive: true });
  if (existsSync(file)) continue;
  writeFileSync(file, '---\ntitle: ' + title + '\ndescription: ' + desc + '\n---\n\n# ' + title + '\n\n> 正文待补。\n', 'utf8');
  written++;
}
let pos = 11;
for (const [slug, [title, group]] of Object.entries(COMPONENTS)) {
  const file = path.join(ROOT, 'docs/components', slug + '.mdx');
  mkdirSync(path.dirname(file), { recursive: true });
  if (existsSync(file)) continue;
  writeFileSync(file, '---\ntitle: ' + title + '\nsidebar_position: ' + pos++ + '\n---\n\n# ' + title + '\n\n> 正文待补。\n', 'utf8');
  written++;
}
console.log('stubs created: ' + written);
