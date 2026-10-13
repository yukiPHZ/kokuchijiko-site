import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { layout, home, atlas, quizPage, aboutPage } from '../src/templates.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const preview = process.argv.includes('--preview');
const production = process.argv.includes('--public');
if (production && preview) throw new Error('Public and incomplete Preview modes cannot be combined.');
const check = process.argv.includes('--check');
const validation = spawnSync(process.execPath, [path.join(root, 'tools/validate.cjs'), ...(preview ? ['--allow-pending'] : [])], { encoding: 'utf8' });
if (validation.status !== 0) { console.error(validation.stdout, validation.stderr); process.exit(1); }
const raw = fs.readFileSync(path.join(root, 'data/characters.json'), 'utf8');
const { characters } = JSON.parse(raw);
const available = new Set(characters.map(c => c.id));
if (!preview && available.size !== 124) throw new Error('Complete build requires all portraits to be visually reviewed.');
const build = { preview, production, registryCount: 124, availableQuestionIds: [...available] };
const pages = [
  ['/', '作品', '不動産調査を入口にした推理アドベンチャー、告知事項。人物帳と名前当てゲーム。', home(characters, available)],
  ['/characters/', '人物帳', '告知事項の124人。顔、日本語の名前、読み、ローマ字から人物を探す。', atlas(characters, available), 'atlas.mjs'],
  ['/quiz/', '名前当て', '告知事項の人々を、顔と4つの名前から覚えるゲーム。10問、全員、迷った人の復習。', quizPage, 'quiz-ui.mjs'],
  ['/about/', '制作について', '告知事項と、その制作の起点について。', aboutPage]
];
const output = new Map(pages.map(([route, title, description, body, script]) => [route.slice(1) + 'index.html', layout({ route, title, description, body, script, preview, production, availableCount: available.size })]));
output.set('data/characters.json', raw);
output.set('data/build.json', JSON.stringify(build, null, 2) + '\n');
for (const file of ['quiz-engine.mjs', 'quiz-ui.mjs', 'templates.mjs', 'atlas.mjs', 'site.css', 'observer-contract.js', 'observer-bootstrap.js', 'observer-events.mjs']) output.set('assets/' + file, fs.readFileSync(path.join(root, 'src', file), 'utf8'));
output.set('assets/favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#252923"/><text x="32" y="46" text-anchor="middle" font-family="serif" font-size="43" fill="#ece7dc">告</text></svg>\n');
output.set('robots.txt', production ? 'User-agent: *\nAllow: /\nSitemap: https://kokuchijiko.peakheadz.com/sitemap.xml\n' : 'User-agent: *\nDisallow: /\n');
output.set('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + (production ? ['/', '/characters/', '/about/'].map(route => `<url><loc>https://kokuchijiko.peakheadz.com${route}</loc></url>`).join('') : '') + '</urlset>\n');
output.set('_headers', "/*\n" + (production ? '' : '  X-Robots-Tag: noindex, nofollow, noarchive\n') + "  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-ancestors 'none'; base-uri 'none'; form-action 'none'\n" + (production ? '/quiz/*\n  X-Robots-Tag: noindex, follow\n/data/*\n  X-Robots-Tag: noindex, nofollow\n/assets/*\n  X-Robots-Tag: noindex, nofollow\n/404.html\n  X-Robots-Tag: noindex, nofollow\n' : ''));
output.set('_headers', output.get('_headers') + ['/', '/index.html', '/characters/', '/characters/index.html', '/quiz/', '/quiz/index.html', '/about/', '/about/index.html'].map(route => route + '\n  Cache-Control: no-transform\n').join(''));
output.set('404.html', layout({ title: 'ページが見つかりません', description: '告知事項', route: '', body: '<section class="page-heading"><h1>ページが見つかりません。</h1><p><a href="/">作品トップへ戻る</a></p></section>', preview, production, availableCount: available.size }));
const stale = [];
for (const [relative, content] of output) {
  const file = path.join(root, 'public', relative);
  if (check) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) stale.push(relative); }
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
}
if (stale.length) { console.error('Generated files differ:', stale); process.exit(1); }
console.log(JSON.stringify({ mode: production ? 'production-candidate' : preview ? 'development-preview' : 'complete-noindex-candidate', files: output.size, characters: 124, playable: available.size, pending: 124 - available.size, check }, null, 2));
