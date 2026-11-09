/**
 * 按 src/components/* 目录重建 package.json 的 exports 映射。
 * 加组件只需要新建目录，然后 pnpm exports:sync。
 *
 * 条件顺序很重要：每个条件内部先 types 再 default，
 * import 走 .d.ts + .js，require 走 .d.cts + .cjs —— 否则 publint 会报
 * 「types is interpreted as ESM when resolving with the require condition」。
 */
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const compsDir = resolve(root, 'src/components');

const names = readdirSync(compsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .filter((d) => existsSync(resolve(compsDir, d.name, 'index.ts')))
  .map((d) => d.name)
  .sort();

const dualEntry = (base) => ({
  import: { types: `./dist/${base}.d.ts`, default: `./dist/${base}.js` },
  require: { types: `./dist/${base}.d.cts`, default: `./dist/${base}.cjs` },
});

const exportsMap = {
  '.': dualEntry('index'),
  './style.css': './dist/index.css',
  './tokens.css': './dist/tokens.css',
};

for (const name of names) {
  const key = name.charAt(0).toLowerCase() + name.slice(1);
  exportsMap['./' + key] = dualEntry(key);
  exportsMap['./' + key + '/style.css'] = `./dist/${key}.css`;
}

exportsMap['./package.json'] = './package.json';

const pkgPath = resolve(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.exports = exportsMap;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('[exports] ' + names.length + ' 个组件子路径已写入 package.json');
