// Builds ../tokens.css from tokens.json (the single source of colours, shadows, spacing, radii and font stacks).
// Run after editing tokens.json:  node design-system/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
const t = JSON.parse(readFileSync(new URL('tokens.json', here), 'utf8'));
const themes = t.color.themes.map(x => x.id), first = themes[0];
const val = v => String(v).replace(/^\{(.+)\}$/, 'var(--$1)');
const pick = (tok, th) => typeof tok.value === 'string' ? (th === first ? tok.value : null) : tok.value[th] ?? null;
const themed = [...t.color.tokens, ...(t.shadow?.tokens || [])];
const block = (sel, th) => {
  const lines = themed.map(k => [k.name, pick(k, th)]).filter(([, v]) => v != null).map(([n, v]) => `  --${n}:${val(v)};`);
  return lines.length ? `${sel}{\n${lines.join('\n')}\n}\n` : '';
};
let css = `/* ${t.name} — generated from tokens.json */\n/* Do not edit: change design-system/tokens.json, then run  node design-system/build.mjs */\n`;
css += block(`:root,[data-theme="${first}"]`, first);
for (const th of themes.slice(1)) css += block(`[data-theme="${th}"]`, th);
const fixed = ['spacing', 'size', 'radius'].flatMap(f => t[f]?.tokens || []).map(k => `  --${k.name}:${k.value};`);
for (const [k, v] of Object.entries(t.type.families)) fixed.push(`  --font-${k}:${v};`);
css += `:root{\n${fixed.join('\n')}\n}\n`;
writeFileSync(new URL('../tokens.css', here), css);
console.log('tokens.css:', themed.length, 'themed tokens ×', themes.length, 'themes,', fixed.length, 'fixed');
