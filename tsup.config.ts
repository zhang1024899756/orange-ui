import { defineConfig } from 'tsup'
import { readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = import.meta.dirname
const componentsDir = resolve(root, 'src/components')

// 自动扫描 src/components/<Name>/index.ts 生成多入口 —— 加组件不需要改构建配置
const entry: Record<string, string> = { index: resolve(root, 'src/index.ts') }
for (const dir of readdirSync(componentsDir, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith('_')) continue
  const file = resolve(componentsDir, dir.name, 'index.ts')
  if (!existsSync(file)) continue
  const key = dir.name.charAt(0).toLowerCase() + dir.name.slice(1)
  entry[key] = file
}

export default defineConfig({
  entry,
  format: ['esm', 'cjs'],
  target: 'es2022',
  platform: 'browser',
  dts: true,
  splitting: false,
  clean: true,
  minify: false,
  sourcemap: true,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
})
