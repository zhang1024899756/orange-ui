import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = import.meta.dirname + '/..'
const src = resolve(root, 'src/styles/tokens.css')
const out = resolve(root, 'dist/tokens.css')
mkdirSync(resolve(root, 'dist'), { recursive: true })
copyFileSync(src, out)
console.log('[build] tokens.css -> dist/tokens.css')
