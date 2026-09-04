#!/usr/bin/env node
// Static verification for the Alphabet++ site. No dependencies, no build step.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(resolve(root, f), 'utf8');

const failures = [];
const checks = [];
function check(name, fn) {
  try {
    const detail = fn();
    checks.push([true, name, detail ?? '']);
  } catch (err) {
    failures.push(name);
    checks.push([false, name, err.message]);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const required = ['index.html', 'styles.css', 'main.js', '.nojekyll', 'README.md', 'LICENSE'];
check('required files present', () => {
  const missing = required.filter((f) => !existsSync(resolve(root, f)));
  assert(missing.length === 0, `missing: ${missing.join(', ')}`);
  return `${required.length} files`;
});

const html = read('index.html');
const css = read('styles.css');

check('referenced local assets resolve', () => {
  const refs = [...html.matchAll(/(?:href|src)="(?!https?:|#|mailto:|data:)([^"]+)"/g)].map((m) => m[1]);
  const missing = refs.filter((r) => !existsSync(resolve(root, r.split('?')[0])));
  assert(missing.length === 0, `unresolved: ${missing.join(', ')}`);
  return `${refs.length} refs`;
});

check('wordmark renders alpha but reads as "Alphabet++"', () => {
  const alpha = /\u03b1|&#945;|&#x3b1;|&alpha;/i;
  assert(alpha.test(html), 'no Greek alpha (literal or entity) in the document');
  const sr = [...html.matchAll(/<span class="sr-only">([^<]*)<\/span>/g)].map((m) => m[1].trim());
  assert(sr.some((t) => t.includes('Alphabet++')), 'no sr-only text spelling "Alphabet++"');
  assert(/class="sr-only"/.test(css) || /\.sr-only/.test(css), '.sr-only has no CSS rule');
  return 'alpha + accessible name';
});

check('every nav link resolves to a section', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  const broken = anchors.filter((a) => !ids.has(a));
  assert(broken.length === 0, `dangling anchors: ${broken.join(', ')}`);
  return `${anchors.length} anchors`;
});

check('motion is gated behind prefers-reduced-motion', () => {
  assert(/prefers-reduced-motion/.test(css), 'styles.css never mentions prefers-reduced-motion');
  assert(/prefers-reduced-motion/.test(html), 'the pre-paint script does not consult prefers-reduced-motion');
});

check('page is readable without JavaScript', () => {
  // .reveal must never be hidden unless the pre-paint script opted in via .js-anim.
  const hidden = [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)].filter(([, sel, body]) =>
    /\.reveal\b/.test(sel) && /opacity:\s*0\b/.test(body) && !/\.js-anim/.test(sel));
  assert(hidden.length === 0, `.reveal hidden without a .js-anim guard: ${hidden.map((h) => h[1].trim()).join(' | ')}`);
  assert(/js-anim/.test(html), 'no .js-anim opt-in found in index.html');
});

check('every HTML class has a CSS rule', () => {
  const applied = new Set(['is-stuck', 'is-active', 'js-anim', 'is-in']); // added at runtime by main.js
  const used = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  }
  const missing = [...used].filter((c) => !applied.has(c) && !css.includes(`.${c}`));
  assert(missing.length === 0, `no rule for: ${missing.join(', ')}`);
  return `${used.size} classes`;
});

check('stylesheet braces balance', () => {
  const open = (css.match(/{/g) || []).length;
  const close = (css.match(/}/g) || []).length;
  assert(open === close, `${open} "{" vs ${close} "}"`);
});

check('block-level tags balance', () => {
  const bad = [];
  for (const tag of ['section', 'figure', 'figcaption', 'div', 'svg', 'ul', 'li', 'main', 'nav']) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) bad.push(`${tag} ${open}/${close}`);
  }
  assert(bad.length === 0, bad.join(', '));
});

check('decorative SVGs are hidden from assistive tech', () => {
  // An svg is exempt if it is itself marked, or sits inside an aria-hidden container.
  const svgs = [...html.matchAll(/<svg\b[^>]*>/g)];
  const bad = svgs.filter(({ 0: tag, index }) => {
    if (/aria-hidden="true"|aria-labelledby=|role="img"/.test(tag)) return false;
    const before = html.slice(Math.max(0, index - 400), index);
    return !/<div[^>]*aria-hidden="true"[^>]*>(?:(?!<\/div>)[\s\S])*$/.test(before);
  }).map((m) => m[0]);
  assert(bad.length === 0, `${bad.length} svg(s) neither labelled nor aria-hidden`);
  return `${svgs.length} svgs`;
});

for (const [ok, name, detail] of checks) {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? `  ${detail}` : ''}`);
}
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${checks.length} checks passed.`);
