import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escape } from '../src/templates.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const read = relative => fs.readFileSync(path.join(publicRoot, relative), 'utf8');
const registry = JSON.parse(read('data/characters.json'));
const build = JSON.parse(read('data/build.json'));

test('public character registry exactly matches the canonical input', () => {
  assert.deepEqual(registry, JSON.parse(fs.readFileSync(path.join(root, 'data/characters.json'), 'utf8')));
  assert.equal(registry.characters.length, 124);
  assert.equal(new Set(build.availableQuestionIds).size, build.availableQuestionIds.length);
  for (const id of build.availableQuestionIds) {
    const c = registry.characters.find(c => c.id === id);
    assert.ok(c);
    if (c.portrait) assert.ok(fs.existsSync(path.join(publicRoot, c.portrait.src)));
  }
});

test('every rendered local link, image and script resolves; indexing follows build mode', () => {
  for (const route of ['index.html', 'characters/index.html', 'quiz/index.html', 'about/index.html', '404.html']) {
    const html = read(route);
    const indexable = build.production && ['index.html', 'characters/index.html', 'about/index.html'].includes(route);
    assert.match(html, indexable ? /name="robots" content="index,follow"/ : /name="robots" content="noindex,/);
    if (build.production) {
      assert.match(html, /rel="canonical" href="https:\/\/kokuchijiko\.peakheadz\.com\//);
      assert.match(html, /property="og:image" content="https:\/\/kokuchijiko\.peakheadz\.com\/assets\/ogp\/ogp.jpg"/);
    }
    for (const [, url] of html.matchAll(/(?:src|href)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      assert.ok(fs.existsSync(path.join(publicRoot, url.endsWith('/') ? url + 'index.html' : url)), `${route}: ${url}`);
    }
    assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  }
  assert.match(read('_headers'), /X-Robots-Tag: noindex/);
  if (build.production) {
    assert.equal((read('sitemap.xml').match(/<url>/g) || []).length, 3);
    assert.doesNotMatch(read('sitemap.xml'), /\/quiz\/|\/data\/|\/assets\//);
    assert.doesNotMatch(read('robots.txt'), /Disallow: \/\n/);
  } else assert.equal((read('sitemap.xml').match(/<url>/g) || []).length, 0);
  assert.equal((read('characters/index.html').match(/data-person /g) || []).length, 124);
});

test('public contains no source documents, prompts, original game scripts, or legacy vendor files', () => {
  const allowed = new Set(['index.html', 'characters/index.html', 'quiz/index.html', 'about/index.html', '404.html', '_headers', 'robots.txt', 'sitemap.xml', 'data/characters.json', 'data/build.json', 'assets/site.css', 'assets/atlas.mjs', 'assets/quiz-ui.mjs', 'assets/quiz-engine.mjs', 'assets/templates.mjs', 'assets/favicon.svg', 'assets/apple-touch-icon.png', 'assets/ogp/ogp.jpg', 'assets/station.png']);
  for (const file of ['observer-bootstrap.js','observer-contract.js','observer-events.mjs']) allowed.add('assets/'+file);
  for (const file of ['market-observer.js','consent-banner.js','README.md','market-observer-package.lock.json','generated/runtime_schema.json','generated/manifest.json','generated/runtime-package.js','generated/peakheadz_kokuchijiko.profile.json']) allowed.add('assets/market-observer/'+file);
  for (const c of registry.characters) if (c.portrait) allowed.add(c.portrait.src.slice(1));
  const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(directory, e.name)) : [path.relative(publicRoot, path.join(directory, e.name)).replaceAll('\\', '/')]);
  for (const file of walk(publicRoot)) assert.ok(allowed.has(file), `Unapproved public file: ${file}`);
  assert.equal(escape('<script>"&\''), '&lt;script&gt;&quot;&amp;&#39;');
});
