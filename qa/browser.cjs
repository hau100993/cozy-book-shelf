#!/usr/bin/env node
// Đội thử nghiệm ảo — "tay chân" của một nhân vật: một trình duyệt thật chạy liên tục, nhận lệnh từng bước qua HTTP.
//
//   node qa/browser.cjs --device phone --port 9301 --out qa/runs/2026-11-07/lan
//   node qa/act.cjs 9301 shot "ke-sach"        (xem qa/README.md cho mọi lệnh)
//
// - Tự phục vụ thư mục gốc repo qua HTTP (không cần Live Server).
// - Thư viện cdnjs (pdf.js, JSZip) được trả từ qa/node_modules: cùng phiên bản, cùng hash SRI, chạy được cả khi không có mạng.
// - Google (đăng nhập, Drive) bị chặn: đồng bộ thật không thử được ở đây.
// - Mọi lệnh và kết quả được ghi vào <out>/actions.jsonl; ảnh chụp vào <out>/shots/.
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, process.cwd(), '/opt/node-tools/node_modules'] }));

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const DEVICE = arg('device', 'phone'), PORT = +arg('port', 9301), OUT = path.resolve(arg('out', 'qa/runs/tmp'));
const ROOT = path.resolve(__dirname, '..');
const DEVICES = {
  // Điện thoại Android cỡ phổ biến (Galaxy S-series): cầm dọc, cảm ứng.
  phone:   { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, screen: { width: 412, height: 915 } },
  // Điện thoại nhỏ hơn, chữ hệ thống to (người lớn tuổi).
  phoneSmall: { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, screen: { width: 360, height: 780 } },
  // Máy tính bảng Samsung cầm ngang trong Chrome (khung trình duyệt chiếm phần trên).
  tablet:  { viewport: { width: 889, height: 562 }, hasTouch: true, deviceScaleFactor: 1, screen: { width: 889, height: 562 } },
  pc:      { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
};
if (!DEVICES[DEVICE]) { console.error('device phải là: ' + Object.keys(DEVICES).join(', ')); process.exit(1); }
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
const LOG = path.join(OUT, 'actions.jsonl');
const log = o => fs.appendFileSync(LOG, JSON.stringify(Object.assign({ t: new Date().toISOString() }, o)) + '\n');

/* ---------- static server for the repo ---------- */
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.cjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.pdf':'application/pdf', '.epub':'application/epub+zip', '.woff2':'font/woff2' };
const site = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

/* ---------- browser ---------- */
let browser, ctx, page, cdp, SITE;
const errors = [];
const LIBS = {
  'pdf.min.js': 'pdfjs-dist/build/pdf.min.js', 'pdf.worker.min.js': 'pdfjs-dist/build/pdf.worker.min.js', 'jszip.min.js': 'jszip/dist/jszip.min.js'
};
async function newPage(){
  page = await ctx.newPage();
  page.on('pageerror', e => { errors.push({ kind:'pageerror', msg: e.message, url: page.url() }); });
  // "Failed to load resource" console lines carry no URL; failed loads are recorded from responses instead.
  page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text()) && !/accounts\.google/.test(m.text())) errors.push({ kind:'console', msg: m.text(), url: page.url() }); });
  // books/books.json is optional (the repo ships no default books); Google is blocked on purpose.
  page.on('response', r => { if (r.status() >= 400 && !/books\/books\.json|favicon/.test(r.url())) errors.push({ kind:'http ' + r.status(), msg: r.url(), url: page.url() }); });
  page.on('dialog', d => { log({ event:'dialog', type:d.type(), msg:d.message() }); d.accept().catch(() => {}); });
  cdp = await ctx.newCDPSession(page);
}
async function start(){
  await new Promise(r => site.listen(0, '127.0.0.1', r));
  SITE = 'http://127.0.0.1:' + site.address().port;
  browser = await chromium.launch();
  ctx = await browser.newContext(Object.assign({ locale: 'vi-VN' }, DEVICES[DEVICE]));
  await ctx.route('https://cdnjs.cloudflare.com/**', r => {
    const name = r.request().url().split('/').pop(), rel = LIBS[name];
    if (!rel) return r.abort();
    r.fulfill({ path: require.resolve(rel, { paths: [__dirname] }), contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' } });
  });
  await ctx.route(/accounts\.google\.com|googleapis\.com\/(drive|upload)/, r => r.abort());
  await newPage();
  await page.goto(SITE + '/');
  log({ event:'start', device: DEVICE, site: SITE });
}

/* ---------- helpers ---------- */
let shotN = 0;
async function shot(name){
  const file = path.join(OUT, 'shots', String(++shotN).padStart(3, '0') + '-' + String(name || 'man-hinh').replace(/[^\p{L}\p{N}_-]+/gu, '-').slice(0, 50) + '.png');
  await page.screenshot({ path: file });
  return path.relative(process.cwd(), file);
}
// What a person sees and can touch: visible text blocks and controls, with size checks.
async function ui(){
  return page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .05 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
    const name = el => (el.getAttribute('aria-label') || el.innerText || el.value || el.title || el.alt || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    const box = el => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const controls = [...document.querySelectorAll('button, a[href], input, select, textarea, [role=button], [role=tab], [tabindex="0"], .wbook')].filter(vis).map(el => {
      const b = box(el), fs = parseFloat(getComputedStyle(el).fontSize);
      const o = { tag: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''), name: name(el), box: b };
      if (el.disabled) o.disabled = true;
      if (matchMedia('(pointer:coarse)').matches && (b[2] < 44 || b[3] < 44)) o.smallTarget = b[2] + '×' + b[3];
      if (fs && fs < 12 && name(el)) o.smallText = fs + 'px';
      return o;
    });
    const texts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()){
      const n = walker.currentNode, t = n.textContent.replace(/\s+/g, ' ').trim(); if (t.length < 2) continue;
      const el = n.parentElement; if (!el || !vis(el) || el.closest('button, a, script, style')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      texts.push((fs < 12 ? '[' + fs + 'px] ' : '') + t.slice(0, 120));
    }
    const canvas = document.querySelector('canvas#gl');
    return { url: location.pathname + location.search, title: document.title, viewport: [innerWidth, innerHeight],
      bodyClass: document.body.className, text: [...new Set(texts)].slice(0, 60), controls: controls.slice(0, 80),
      reader: canvas ? { page: (document.querySelector('#prog') || {}).textContent, chapter: (document.querySelector('#chapLbl') || {}).textContent, msg: (document.querySelector('#msg.on') || {}).textContent || null } : undefined,
      toast: (document.querySelector('.toast.on, #toast.on') || {}).textContent || null };
  });
}
async function touchSwipe(x0, y0, x1, y1, ms){
  const n = Math.max(6, Math.round(ms / 16));
  await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x:x0, y:y0 }] });
  for (let i = 1; i <= n; i++){ await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n }] }); await page.waitForTimeout(ms / n); }
  await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
}
async function longPress(x, y, ms){
  await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x, y }] });
  await page.waitForTimeout(ms);
  await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
}
// Find a control the way a person would: by its visible text / label (case- and accent-insensitive contains).
async function byText(text){
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
  const want = norm(text);
  const handles = await page.$$('button, a[href], [role=button], [role=tab], label, input[type=checkbox], .wbook, .box');
  for (const h of handles){
    const ok = await h.evaluate((el, want) => {
      const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      if (!(r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none' && r.top < innerHeight && r.bottom > 0)) return false;
      return norm((el.getAttribute('aria-label') || '') + ' ' + (el.innerText || '') + ' ' + (el.title || '')).includes(want);
    }, want);
    if (ok) return h;
  }
  return null;
}

/* ---------- commands ---------- */
const CMDS = {
  async goto(p){ await page.goto(SITE + (p || '/')); await page.waitForTimeout(1200); return { url: page.url().replace(SITE, '') }; },
  async reload(){ await page.reload(); await page.waitForTimeout(1200); return { url: page.url().replace(SITE, '') }; },
  async back(){ await page.goBack({ waitUntil:'commit' }).catch(() => {}); await page.waitForTimeout(1200); return { url: page.url().replace(SITE, '') }; },
  async shot(name){ return { shot: await shot(name) }; },
  async ui(){ return await ui(); },
  async tap(x, y){ x = +x; y = +y; if (DEVICES[DEVICE].hasTouch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await page.waitForTimeout(700); return { tapped:[x, y] }; },
  async click(...words){
    const text = words.join(' '), h = await byText(text);
    if (!h) return { error: 'Không thấy nút / mục nào có chữ "' + text + '" trên màn hình.' };
    const b = await h.boundingBox(); if (!b) return { error: 'Thấy "' + text + '" nhưng không bấm được (bị che hoặc ngoài màn hình).' };
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    if (DEVICES[DEVICE].hasTouch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
    await page.waitForTimeout(900); return { clicked: text, at: [Math.round(x), Math.round(y)] };
  },
  async swipe(x0, y0, x1, y1, ms){ await touchSwipe(+x0, +y0, +x1, +y1, +(ms || 200)); await page.waitForTimeout(800); return { swiped:[+x0, +y0, +x1, +y1] }; },
  async hold(x, y, ms){ await longPress(+x, +y, +(ms || 700)); await page.waitForTimeout(500); return { held:[+x, +y] }; },
  async pinch(cx, cy, scale){
    cx = +cx; cy = +cy; scale = +(scale || 2); const d0 = 60, d1 = d0 * scale, n = 10;
    await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x:cx - d0, y:cy, id:1 }, { x:cx + d0, y:cy, id:2 }] });
    for (let i = 1; i <= n; i++){ const d = d0 + (d1 - d0) * i / n; await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:cx - d, y:cy, id:1 }, { x:cx + d, y:cy, id:2 }] }); await page.waitForTimeout(20); }
    await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] }); await page.waitForTimeout(800); return { pinched: scale };
  },
  async mouse(action, x, y){ x = +x; y = +y; if (action === 'move') await page.mouse.move(x, y); else if (action === 'dblclick') await page.mouse.dblclick(x, y); else if (action === 'right') await page.mouse.click(x, y, { button:'right' }); else await page.mouse.click(x, y); await page.waitForTimeout(600); return { mouse: action }; },
  async drag(x0, y0, x1, y1){ await page.mouse.move(+x0, +y0); await page.mouse.down(); await page.mouse.move(+x1, +y1, { steps: 20 }); await page.mouse.up(); await page.waitForTimeout(800); return { dragged:true }; },
  async wheel(dy){ await page.mouse.wheel(0, +dy); await page.waitForTimeout(800); return { wheel:+dy }; },
  async type(...words){ await page.keyboard.type(words.join(' ')); await page.waitForTimeout(400); return { typed: words.join(' ') }; },
  async press(key){ await page.keyboard.press(key); await page.waitForTimeout(700); return { pressed:key }; },
  async upload(...names){
    const files = names.map(n => path.join(__dirname, 'fixtures', n));
    for (const f of files) if (!fs.existsSync(f)) return { error: 'Không có file mẫu ' + path.basename(f) + ' trong qa/fixtures' };
    const input = await page.$('#fileIn'); if (!input) return { error: 'Trang này không có ô chọn file (#fileIn).' };
    await input.setInputFiles(files); await page.waitForTimeout(3500); return { uploaded: names };
  },
  async resize(w, h){ await page.setViewportSize({ width:+w, height:+h }); await page.waitForTimeout(900); return { viewport:[+w, +h] }; },
  async wait(ms){ await page.waitForTimeout(+(ms || 1000)); return { waited:+(ms || 1000) }; },
  async axe(){
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js', { paths:[__dirname] }) });
    const r = await page.evaluate(async () => (await axe.run(document, { resultTypes:['violations'] })).violations.map(v => ({ id:v.id, impact:v.impact, help:v.help, nodes:v.nodes.length, sample:v.nodes.slice(0, 3).map(n => n.target.join(' ')) })));
    return { violations: r };
  },
  async errors(){ return { errors: errors.slice(-30) }; },
  async eval(...code){ return { value: await page.evaluate(code.join(' ')) }; },
  async fresh(){ await ctx.clearCookies(); await page.evaluate(async () => { localStorage.clear(); sessionStorage.clear(); try { indexedDB.deleteDatabase('tu-sach-nho'); } catch(e){} }); await page.goto(SITE + '/'); await page.waitForTimeout(1500); return { fresh:true }; },
  async note(...words){ return { noted: words.join(' ') }; },
  async stop(){ setTimeout(async () => { await browser.close(); site.close(); api.close(); process.exit(0); }, 50); return { stopping:true }; }
};

const api = http.createServer((req, res) => {
  let body = ''; req.on('data', c => body += c);
  req.on('end', async () => {
    let out;
    try {
      const { cmd, args = [] } = JSON.parse(body || '{}');
      if (!CMDS[cmd]) out = { error: 'Lệnh không có: ' + cmd + '. Có: ' + Object.keys(CMDS).join(', ') };
      else out = await CMDS[cmd](...args);
      log({ cmd, args, out: cmd === 'ui' || cmd === 'axe' ? '(xem kết quả)' : out });
      const newErr = errors.length ? errors.slice(-3) : null;
      if (newErr && cmd !== 'errors') out = Object.assign({ jsErrorsSoFar: errors.length }, out);
    } catch(e){ out = { error: String(e && e.message || e) }; log({ error: out.error }); }
    res.writeHead(200, { 'content-type':'application/json; charset=utf-8' }); res.end(JSON.stringify(out, null, 1));
  });
});
start().then(() => api.listen(PORT, '127.0.0.1', () => console.log(JSON.stringify({ ready:true, device:DEVICE, port:PORT, out:OUT, site:SITE }))))
  .catch(e => { console.error(e); process.exit(1); });
