/**
 * 从组件源码的 TS 接口生成 API 表数据。
 *
 * 为什么要生成而不是手写：一份手写的 props 表 30 天就开始和实现脱节，
 * 而这份是每次 dev / build 前重跑，改了 JSDoc 这里立刻跟着变。
 * 解析用 TypeScript 编译器 API（ts.createSourceFile），不需要额外依赖。
 */
import ts from 'typescript';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const COMPONENTS = path.resolve(ROOT, '../src/components');
const OUT_DIR = path.resolve(ROOT, 'src/generated');
const OUT_FILE = path.resolve(OUT_DIR, 'props.json');

/** 从 JSDoc 里读「默认 xxx」——组件注释里都写了 */
function readDefault(description) {
  // 只取「默认」后面紧跟的那个值：遇到空格、全角/半角括号、逗号分号句号、顿号就停。
  // 不能贪心，否则 Icon.size 的说明「默认 16（社区站最常用的图标尺寸）」会把括号一起吞进来。
  const match = description.match(/默认\s*([^\s（(「，,。；;、）)」)'"\x60]+)/);
  if (!match) return undefined;
  return match[1].replace(/[。、）)]$/, '');
}

function docText(node) {
  const docs = node.jsDoc ?? [];
  return docs
    .map((doc) => {
      if (typeof doc.comment === 'string') return doc.comment;
      if (Array.isArray(doc.comment)) return doc.comment.map((part) => part.text ?? '').join('');
      return '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 只收集 src/index.ts 真正对外导出的 *Props，内部接口（如 Tooltip 的 TriggerProps）不进文档 */
function exportedPropNames() {
  const entry = readFileSync(path.resolve(ROOT, '../src/index.ts'), 'utf8');
  const names = new Set();
  for (const match of entry.matchAll(/export type \{([^}]+)\}/g)) {
    for (const raw of match[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/).pop()?.trim();
      if (name && name.endsWith('Props')) names.add(name.slice(0, -5));
    }
  }
  return names;
}

function collectFromFile(file, registry, allow) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const statement of source.statements) {
    if (!ts.isInterfaceDeclaration(statement)) continue;
    const name = statement.name.text;
    if (!name.endsWith('Props')) continue;
    const component = name.slice(0, -'Props'.length);
    if (!component || component.startsWith('_')) continue;
    if (!allow.has(component)) continue;

    const props = [];
    for (const member of statement.members) {
      if (!ts.isPropertySignature(member) || !member.name) continue;
      const propName = member.name.getText(source);
      const description = docText(member);
      props.push({
        name: propName,
        type: member.type ? member.type.getText(source).replace(/\s+/g, ' ') : 'unknown',
        required: !member.questionToken,
        description,
        defaultValue: readDefault(description),
      });
    }
    if (!props.length) continue;
    if (!registry[component]) {
      registry[component] = { file: path.relative(path.resolve(ROOT, '..'), file).split(path.sep).join('/'), props: [] };
    }
    // 同名的多个接口取并集（例如分文件声明的 Props）
    const existing = new Set(registry[component].props.map((p) => p.name));
    for (const prop of props) if (!existing.has(prop.name)) registry[component].props.push(prop);
  }
}

function walk(dir, registry, allow) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_') || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, registry, allow);
      continue;
    }
    if (!full.endsWith('.tsx')) continue;
    if (full.includes('.stories.') || full.includes('.test.')) continue;
    collectFromFile(full, registry, allow);
  }
}

const registry = {};
const allow = exportedPropNames();
walk(COMPONENTS, registry, allow);

const sorted = Object.fromEntries(Object.entries(registry).sort(([a], [b]) => a.localeCompare(b)));
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf8');

const total = Object.values(sorted).reduce((sum, item) => sum + item.props.length, 0);
console.log('[props] ' + Object.keys(sorted).length + ' 个组件 / ' + total + ' 条属性 -> src/generated/props.json');
for (const [name, item] of Object.entries(sorted)) {
  const missing = item.props.filter((p) => !p.description).map((p) => p.name);
  if (missing.length) console.log('  ! ' + name + ' 缺少说明: ' + missing.join(', '));
}
