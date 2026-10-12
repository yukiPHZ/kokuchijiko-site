import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public'));
const mime = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8' };
const port = Number(process.env.KOKUCHIJIKO_PORT || 4186);
const server = http.createServer((req, res) => {
  const finish = (code, message) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow, noarchive' }); res.end(message); };
  if (!['GET', 'HEAD'].includes(req.method)) return finish(405, 'Method not allowed');
  let relative;
  try { relative = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname); } catch { return finish(400, 'Bad request'); }
  if (relative.includes('\\') || relative.includes('\0') || relative.split('/').some(p => p.startsWith('.') || p.startsWith('_'))) return finish(404, 'Not found');
  const target = path.resolve(root, '.' + relative);
  if (!target.startsWith(root + path.sep) && target !== root) return finish(404, 'Not found');
  let file = target;
  try {
    if (fs.statSync(file).isDirectory()) {
      if (!relative.endsWith('/')) { res.writeHead(308, { Location: relative + '/' }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    if (!fs.realpathSync(file).startsWith(root + path.sep) || !fs.statSync(file).isFile()) return finish(404, 'Not found');
    const type = mime[path.extname(file)];
    if (!type) return finish(404, 'Not found');
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch { return finish(404, 'Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Kokuchijiko private local preview: http://127.0.0.1:${port}/ (public/ only)`));
