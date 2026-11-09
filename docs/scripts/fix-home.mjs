import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/pages/index.tsx';
let text = readFileSync(file, 'utf8');
text = text.replace(/@@(.+?)@@/g, '<code>$1</code>');
writeFileSync(file, text, 'utf8');
console.log('replaced:', (text.match(/@@/g) || []).length, 'left');
