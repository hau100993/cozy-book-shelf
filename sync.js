/* Tủ Sách Nhỏ · đồng bộ qua Google Drive của chính người dùng (dùng chung cho kệ và trình đọc).
   Không có máy chủ: trình duyệt ↔ Drive API. Dữ liệu nhỏ nằm trong appDataFolder, mỗi cuốn hai file:
   m-<fp>.json (thông tin sách + bìa, ít đổi) và d-<key>.json (tsn-b-<key>: vị trí, tiến độ, tô sáng, đánh dấu).
   File sách nằm trong thư mục "Tủ Sách Nhỏ" (quyền drive.file), id lưu ở m-<fp>.json (fileId). */
(() => {
'use strict';
// OAuth Client ID (loại Web) từ Google Cloud Console; để trống thì đồng bộ tắt, sao lưu .zip vẫn chạy.
const CLIENT_ID = '';
const POLICY_V = '1.0';
const SC_DATA = 'https://www.googleapis.com/auth/drive.appdata', SC_FILE = 'https://www.googleapis.com/auth/drive.file';
const API = 'https://www.googleapis.com/drive/v3/files', UP = 'https://www.googleapis.com/upload/drive/v3/files';
const FOLDER = 'Tủ Sách Nhỏ', FOLDER_MIME = 'application/vnd.google-apps.folder';
const POLL = 20000, PUSH_DELAY = 3000;
// Book fields that travel in m-<fp>.json; everything else in the IndexedDB record (file, local id) stays on the device.
const META = ['fp', 'kind', 'title', 'author', 'year', 'count', 'genre', 'desc', 'cover', 'pal', 'motif', 'added', 'src', 'srcUrl', 'srcKey', 'fileId', 'fileName', 'size', 'm'];

const ls = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
  del(k){ try { localStorage.removeItem(k); } catch(e){} }
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- state ---------- */
// tsn-sync: on, files, consent log, and per Drive file name: pushed (m last sent/received), seen (modifiedTime), ids.
const BLANK = () => ({ on:false, files:false, consent:[], pushed:{}, seen:{}, ids:{}, folder:null, del:{}, last:0 });
let st = BLANK();
const load = () => { st = Object.assign(BLANK(), ls.get('tsn-sync') || {}); };
const save = () => ls.set('tsn-sync', st);
load();

// The access token lives for the tab session only (sessionStorage, ~1 hour), so moving between the shelf and the reader keeps it.
let tok = null;
try { tok = JSON.parse(sessionStorage.getItem('tsn-tok')); } catch(e){}
const hasTok = () => !!(tok && tok.exp > Date.now() + 30000);
const hasFileScope = () => hasTok() && (tok.sc || '').includes(SC_FILE);
function setTok(t){ tok = t; try { if (t) sessionStorage.setItem('tsn-tok', JSON.stringify(t)); else sessionStorage.removeItem('tsn-tok'); } catch(e){} }

/* ---------- events ---------- */
const subs = { status:[], data:[], meta:[] };
let status = { s: 'off', msg: '' };
function emit(ev, x){ subs[ev].forEach(f => { try { f(x); } catch(e){ console.error(e); } }); }
function setStatus(s, msg){ status = { s, msg: msg || '' }; emit('status', status); pill(); }

/* ---------- merging ---------- */
// Reading data from two devices: progress (and the position that goes with it) from whichever is newer;
// highlights/bookmarks by id, newer `m` wins; `gone` tombstones remove items not edited after the delete.
function mergeData(a, b){
  a = a || {}; b = b || {};
  const ta = a.prog ? a.prog.t || 0 : 0, tb = b.prog ? b.prog.t || 0 : 0;
  const w = tb > ta ? b : a;
  const gone = Object.assign({}, a.gone);
  Object.entries(b.gone || {}).forEach(([k, t]) => { if (!(gone[k] >= t)) gone[k] = t; });
  const pick = f => {
    const map = new Map();
    [...(a[f] || []), ...(b[f] || [])].forEach(x => {
      const k = x.id || JSON.stringify(x), o = map.get(k);
      if (!o || (x.m || 0) > (o.m || 0)) map.set(k, x);
    });
    return [...map.values()].filter(x => !(x.id && gone[x.id] >= (x.m || 0)));
  };
  const hls = pick('hls').sort((x, y) => x.a - y.a || String(x.id).localeCompare(String(y.id)));
  const bms = pick('bms').sort((x, y) => String(x.id).localeCompare(String(y.id)));
  return { pos: w.pos || null, prog: w.prog || null, hls, bms, gone, m: Math.max(a.m || 0, b.m || 0) };
}
const toMeta = r => { const o = {}; META.forEach(k => { if (r[k] !== undefined) o[k] = r[k]; }); if (o.m == null) o.m = r.added || 0; return o; };
const metaM = r => r ? r.m || r.added || 0 : -1;

/* ---------- IndexedDB (same database as the shelf) ---------- */
const idb = {
  db: null,
  open(){
    return this.db ? Promise.resolve(this.db) : new Promise(res => {
      try {
        const q = indexedDB.open('tu-sach-nho', 1);
        q.onupgradeneeded = () => q.result.createObjectStore('books', { keyPath:'id' });
        q.onsuccess = () => res(this.db = q.result); q.onerror = () => res(null);
      } catch(e){ res(null); }
    });
  },
  async tx(mode, fn){
    const db = await this.open(); if (!db) return null;
    return new Promise(res => {
      try { const q = fn(db.transaction('books', mode).objectStore('books')); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }
      catch(e){ res(null); }
    });
  },
  all(){ return this.tx('readonly', os => os.getAll()).then(r => r || []); },
  put(r){ return this.tx('readwrite', os => os.put(r)); },
  del(id){ return this.tx('readwrite', os => os.delete(id)); }
};

/* ---------- Google sign-in (Google Identity Services, token model) ---------- */
let gisP = null, tc = null, tcWait = null;
function gis(){
  return gisP || (gisP = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => res(google.accounts.oauth2); s.onerror = () => { gisP = null; rej(new Error('Không tải được Google Sign-In.')); };
    document.head.appendChild(s);
  }));
}
async function prepare(){
  if (!CLIENT_ID) return null;
  const o = await gis();
  if (!tc) tc = o.initTokenClient({ client_id: CLIENT_ID, scope: SC_DATA, include_granted_scopes: true,
    callback: r => tcWait && tcWait.ok(r), error_callback: e => tcWait && tcWait.no(e) });
  return tc;
}
// Opens Google's popup; call it straight from a click so the browser allows the popup (GIS is preloaded for that).
function authorize(files){
  return new Promise((ok, no) => {
    const go = () => {
      tcWait = {
        ok: r => { tcWait = null; if (r.error) return no(new Error(r.error_description || r.error)); setTok({ t: r.access_token, exp: Date.now() + r.expires_in * 1000, sc: r.scope || '' }); ok(); },
        no: e => { tcWait = null; no(new Error(e && e.type === 'popup_closed' ? 'Bạn đã đóng cửa sổ Google.' : e && e.type === 'popup_failed_to_open' ? 'Trình duyệt chặn cửa sổ đăng nhập. Hãy cho phép popup rồi thử lại.' : 'Không đăng nhập được Google.')); }
      };
      tc.requestAccessToken({ scope: files ? SC_DATA + ' ' + SC_FILE : SC_DATA, prompt: '' });
    };
    if (tc) go(); else prepare().then(t => t ? go() : no(new Error('Chưa cấu hình Google Client ID.')), no);
  });
}

/* ---------- Drive REST ---------- */
function authErr(){ const e = new Error('Phiên Google đã hết hạn.'); e.code = 'auth'; return e; }
async function api(url, opt){
  if (!hasTok()) throw authErr();
  opt = Object.assign({}, opt); opt.headers = Object.assign({ Authorization: 'Bearer ' + tok.t }, opt.headers);
  const res = await fetch(url, opt);
  if (res.status === 401){ setTok(null); throw authErr(); }
  if (!res.ok){ const e = new Error('Google Drive báo lỗi ' + res.status + '.'); e.status = res.status; throw e; }
  return res;
}
const q = s => encodeURIComponent(s);
async function listAll(params){
  const out = []; let pt = '';
  do {
    const r = await (await api(API + '?pageSize=1000&' + params + (pt ? '&pageToken=' + q(pt) : ''))).json();
    out.push(...(r.files || [])); pt = r.nextPageToken;
  } while (pt);
  return out;
}
const listApp = () => listAll('spaces=appDataFolder&fields=' + q('nextPageToken,files(id,name,modifiedTime)'));
const getJson = id => api(API + '/' + id + '?alt=media').then(r => r.json());
async function putJson(name, obj, keepalive){
  const body = JSON.stringify(obj), id = st.ids[name];
  let res;
  if (id){
    try { res = await api(UP + '/' + id + '?uploadType=media&fields=id,modifiedTime', { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body, keepalive: keepalive && body.length < 60000 }); }
    catch(e){ if (e.status !== 404) throw e; delete st.ids[name]; }
  }
  if (!res){
    const bd = 'tsn' + uid();
    const mp = '--' + bd + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify({ name, parents:['appDataFolder'] }) +
      '\r\n--' + bd + '\r\nContent-Type: application/json\r\n\r\n' + body + '\r\n--' + bd + '--';
    res = await api(UP + '?uploadType=multipart&fields=id,modifiedTime', { method:'POST', headers:{ 'Content-Type':'multipart/related; boundary=' + bd }, body: mp });
  }
  const f = await res.json(); st.ids[name] = f.id; st.seen[name] = f.modifiedTime;
}
async function ensureFolder(){
  if (st.folder) return st.folder;
  const found = await listAll('q=' + q("name='" + FOLDER + "' and mimeType='" + FOLDER_MIME + "' and trashed=false") + '&fields=' + q('files(id)'));
  if (found[0]) return st.folder = found[0].id;
  const f = await (await api(API + '?fields=id', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ name: FOLDER, mimeType: FOLDER_MIME }) })).json();
  return st.folder = f.id;
}
// XHR so that big books can show upload / download progress.
function xhr(method, url, body, type, onp){
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest(); x.open(method, url);
    x.setRequestHeader('Authorization', 'Bearer ' + tok.t);
    if (type) x.responseType = type;
    const pr = method === 'GET' ? x : x.upload;
    if (onp) pr.onprogress = e => onp(e.loaded, e.lengthComputable ? e.total : 0);
    x.onload = () => x.status === 401 ? (setTok(null), rej(authErr())) : x.status < 300 ? res(x) : rej(Object.assign(new Error('Google Drive báo lỗi ' + x.status + '.'), { status: x.status }));
    x.onerror = () => rej(new Error('Mất kết nối tới Google Drive.'));
    x.send(body || null);
  });
}
const MIME = { pdf:'application/pdf', epub:'application/epub+zip' };
async function uploadBook(r, onp){
  if (!hasTok()) throw authErr();
  const have = await listAll('q=' + q("appProperties has { key='fp' and value='" + r.fp + "' } and trashed=false") + '&fields=' + q('files(id)'));
  if (have[0]) return have[0].id;
  const folder = await ensureFolder(), mime = MIME[r.kind] || 'application/octet-stream';
  const init = await api(UP + '?uploadType=resumable&fields=id', { method:'POST',
    headers:{ 'Content-Type':'application/json; charset=UTF-8', 'X-Upload-Content-Type': mime },
    body: JSON.stringify({ name: r.fileName || (r.title + '.' + r.kind), parents:[folder], mimeType: mime, appProperties:{ fp: r.fp } }) });
  const loc = init.headers.get('Location');
  if (!loc) throw new Error('Google Drive không nhận tải lên.');
  const x = await xhr('PUT', loc, r.file, 'json', onp);
  return x.response.id;
}
async function downloadBook(rec, onp){
  if (!hasTok()) throw authErr();
  const x = await xhr('GET', API + '/' + rec.fileId + '?alt=media', null, 'blob', onp);
  return new File([x.response], rec.fileName || (rec.title + '.' + rec.kind), { type: MIME[rec.kind] || '' });
}

/* ---------- one sync pass: pull what changed, then push what's newer here ---------- */
// opts.full: the shelf (metadata + book files); the reader only syncs reading data.
let opts = { full:false }, busy = null, again = false, pushT = 0;
async function pull(){
  const files = await listApp(), by = new Map();
  files.forEach(f => { if (!by.has(f.name)) by.set(f.name, []); by.get(f.name).push(f); });
  const changedData = [], changedMeta = [];
  for (const [name, fs] of by){
    if (!/^[dm]-/.test(name) || (!opts.full && name[0] === 'm')) continue;
    fs.sort((x, y) => y.modifiedTime.localeCompare(x.modifiedTime));
    if (fs.length === 1 && st.seen[name] === fs[0].modifiedTime) continue;
    let remote = null;
    for (const f of fs){
      const j = await getJson(f.id);
      remote = name[0] === 'd' ? (remote ? mergeData(remote, j) : j) : (metaM(j) > metaM(remote) ? j : remote);
    }
    // Two devices created the same file at once: keep the newest, fold the others in, delete them.
    for (const f of fs.slice(1)) api(API + '/' + f.id, { method:'DELETE' }).catch(() => {});
    st.ids[name] = fs[0].id; st.seen[name] = fs.length === 1 ? fs[0].modifiedTime : '';
    const key = name.slice(2).replace(/\.json$/, '');
    if (name[0] === 'd'){ if (applyData(key, remote)) changedData.push(key); }
    else if (await applyMeta(key, remote)) changedMeta.push(key);
  }
  if (changedData.length) emit('data', changedData);
  if (changedMeta.length) emit('meta', changedMeta);
}
function applyData(key, remote){
  const k = 'tsn-b-' + key, local = ls.get(k), merged = mergeData(local, remote);
  const name = 'd-' + key + '.json';
  if (JSON.stringify(merged) === JSON.stringify(mergeData(remote, null))) st.pushed[name] = merged.m;
  else merged.m = Math.max(merged.m, Date.now());   // has something the remote lacks: push it back
  if (local && JSON.stringify(local) === JSON.stringify(merged)) return false;
  ls.set(k, merged); return true;
}
async function applyMeta(fp, remote){
  const name = 'm-' + fp + '.json', rm = metaM(remote);
  const local = (await idb.all()).find(r => r.fp === fp), lm = metaM(local);
  if (remote.del){
    st.pushed[name] = rm;
    if (local && lm <= rm){ await idb.del(local.id); return true; }
    return false;
  }
  if (!local){
    if (st.del[fp] && st.del[fp].m >= rm) return false;   // deleted here after that change: the tombstone goes out on push
    const rec = toMeta(remote); rec.id = 'u' + uid(); rec.file = null;
    await idb.put(rec); st.pushed[name] = rm; return true;
  }
  if (rm > lm){ const keep = { id: local.id, file: local.file }; await idb.put(Object.assign(local, toMeta(remote), keep)); st.pushed[name] = rm; return true; }
  if (rm === lm) st.pushed[name] = rm;
  return false;
}
async function push(keepalive){
  if (opts.full){
    for (const r of await idb.all()){
      if (!r.fp) continue;
      if (st.files && hasFileScope() && r.file && !r.fileId){
        setStatus('busy', 'Đang tải “' + r.title + '” lên Drive…');
        r.fileId = await uploadBook(r, (a, b) => b && setStatus('busy', 'Đang tải “' + r.title + '” lên Drive… ' + Math.round(100 * a / b) + '%'));
        r.fileName = r.fileName || r.file.name; r.size = r.file.size; r.m = Date.now();
        await idb.put(r);
      }
      const name = 'm-' + r.fp + '.json', m = metaM(r);
      if (st.pushed[name] == null || m > st.pushed[name]){ await putJson(name, toMeta(r)); st.pushed[name] = m; }
    }
    for (const [fp, d] of Object.entries(st.del)){
      const name = 'm-' + fp + '.json';
      if (!(st.pushed[name] >= d.m)){ await putJson(name, { fp, del:true, m: d.m }); st.pushed[name] = d.m; }
      if (d.fileId && hasFileScope()) await api(API + '/' + d.fileId, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ trashed:true }) }).catch(() => {});
      delete st.del[fp];
    }
  }
  await pushData(keepalive);
}
async function pushData(keepalive){
  for (const k of Object.keys(localStorage)){
    if (!k.startsWith('tsn-b-')) continue;
    const d = ls.get(k); if (!d || !d.m) continue;
    const name = 'd-' + k.slice(6) + '.json';
    if (st.pushed[name] == null || d.m > st.pushed[name]){ await putJson(name, mergeData(d, null), keepalive); st.pushed[name] = d.m; }
  }
}
function sync(){
  if (!st.on) return Promise.resolve();
  if (!hasTok()){ setStatus('paused'); return Promise.resolve(); }
  if (busy){ again = true; return busy; }
  clearTimeout(pushT);
  busy = (async () => {
    load(); setStatus('busy');
    try { await pull(); await push(); st.last = Date.now(); setStatus('ok'); }
    catch(e){ console.error(e); setStatus(e.code === 'auth' ? 'paused' : 'error', e.message); }
    finally { save(); busy = null; if (again){ again = false; sync(); } }
  })();
  return busy;
}
// Something changed locally: push a little later, batching quick changes such as page turns.
function dirty(){ if (!st.on) return; clearTimeout(pushT); pushT = setTimeout(sync, PUSH_DELAY); }

/* ---------- small floating notice (paused session, "continue on page X") ---------- */
let pillEl = null, notice = null;
function pill(){
  if (!document.body) return;
  if (!pillEl){
    const css = document.createElement('style');
    css.textContent = '.tsn-pill{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:95;display:flex;align-items:center;gap:10px;' +
      'max-width:calc(100vw - 32px);padding:8px 8px 8px 14px;background:var(--sheet,#F4F2ED);color:var(--ink,#141414);border:1px solid rgba(20,20,20,.9);box-shadow:0 8px 24px -10px rgba(20,16,10,.45);' +
      'font:600 10.5px/1.35 "Inter Tight",system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:auto}' +
      '.tsn-pill[hidden]{display:none}.tsn-pill button{font:inherit;letter-spacing:inherit;text-transform:inherit;color:#fff;background:var(--cobalt,#1F3FB0);border:0;padding:6px 10px;cursor:pointer;white-space:nowrap}' +
      '.tsn-pill .x{background:none;color:inherit;padding:6px}';
    document.head.appendChild(css);
    pillEl = document.createElement('div'); pillEl.className = 'tsn-pill'; pillEl.setAttribute('role', 'status'); pillEl.hidden = true;
    pillEl.innerHTML = '<span></span><button type="button" class="go"></button><button type="button" class="x" aria-label="Đóng">✕</button>';
    pillEl.querySelector('.go').addEventListener('click', () => { const n = notice || pausedNote(); notice = null; pill(); n.fn(); });
    pillEl.querySelector('.x').addEventListener('click', () => { if (notice) notice = null; else snooze = true; pill(); });
    document.body.appendChild(pillEl);
  }
  const n = notice || (st.on && status.s === 'paused' && !snooze ? pausedNote() : null);
  pillEl.hidden = !n;
  if (n){ pillEl.querySelector('span').textContent = n.text; pillEl.querySelector('.go').textContent = n.label; }
}
let snooze = false;
const pausedNote = () => ({ text: 'Đồng bộ đang tạm dừng', label: 'Tiếp tục', fn: () => resume().catch(e => setStatus('paused', e.message)) });
function showNotice(text, label, fn){ notice = { text, label, fn }; pill(); }

/* ---------- public actions ---------- */
function logConsent(purpose, on){ st.consent.push({ purpose, on, v: POLICY_V, t: Date.now() }); }
async function connect(files){
  await authorize(files);
  load(); st.on = true; st.files = !!files && hasFileScope();
  logConsent('data', true); if (st.files) logConsent('files', true);
  save(); snooze = false;
  try { await putJson('consent.json', { policy: POLICY_V, log: st.consent }); save(); } catch(e){}
  return sync();
}
async function resume(){ await authorize(st.files); snooze = false; return sync(); }
async function setFiles(on){
  if (on && !hasFileScope()) await authorize(true);
  load(); st.files = on && hasFileScope(); logConsent('files', st.files); save();
  if (hasTok()) putJson('consent.json', { policy: POLICY_V, log: st.consent }).then(save, () => {});
  return sync();
}
// Stops syncing and revokes the app's access; data already on Drive stays until wiped.
async function disconnect(){
  load(); logConsent('data', false); if (st.files) logConsent('files', false);
  if (hasTok()){
    try { await putJson('consent.json', { policy: POLICY_V, log: st.consent }); } catch(e){}
    try { (await gis()).revoke(tok.t, () => {}); } catch(e){}
  }
  const keep = st.consent; st = BLANK(); st.consent = keep; save(); setTok(null);
  setStatus('off');
}
// Deletes everything the app keeps in Drive: the hidden app folder and, if asked, the books folder.
async function wipe(withBooks){
  if (!hasTok()) await authorize(withBooks);
  for (const f of await listApp()) await api(API + '/' + f.id, { method:'DELETE' });
  if (withBooks && hasFileScope()){
    const fid = st.folder || (await listAll('q=' + q("name='" + FOLDER + "' and mimeType='" + FOLDER_MIME + "' and trashed=false") + '&fields=' + q('files(id)')))[0]?.id;
    if (fid) await api(API + '/' + fid, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ trashed:true }) });
  }
  load(); st.pushed = {}; st.seen = {}; st.ids = {}; st.folder = null; st.del = {};
  if (withBooks) (await idb.all()).forEach(r => { if (r.fileId){ delete r.fileId; idb.put(r); } });
  save();
}
// A book was removed from this shelf: tell the other devices (and move its file on Drive to the trash).
function removed(rec){
  if (!rec || !rec.fp) return;
  load(); if (!st.on) return;
  st.del[rec.fp] = { m: Date.now(), fileId: rec.fileId || null }; save(); dirty();
}

// "Xoá dữ liệu trên máy này": forget everything locally (Drive is untouched) and release the database.
function reset(){
  clearTimeout(pushT); st = BLANK(); setTok(null); ls.del('tsn-sync');
  if (idb.db){ idb.db.close(); idb.db = null; }
  setStatus('off');
}
function init(o){
  opts = Object.assign({ full:false }, o);
  if (!st.on) return setStatus('off');
  if (CLIENT_ID) prepare().catch(() => {});
  if (hasTok()) sync(); else setStatus('paused');
}
setInterval(() => { if (st.on && document.visibilityState === 'visible' && hasTok() && !busy) sync(); }, POLL);
document.addEventListener('visibilitychange', () => {
  if (!st.on || !hasTok()) return;
  if (document.visibilityState === 'visible') sync();
  else if (pushT && !busy){ clearTimeout(pushT); pushT = 0; pushData(true).then(save, () => {}); }
});

window.TSNSync = {
  configured: !!CLIENT_ID, POLICY_V,
  get enabled(){ return st.on; }, get files(){ return st.files; }, get last(){ return st.last; }, get status(){ return status; },
  on(ev, fn){ subs[ev].push(fn); },
  prepare: () => prepare().catch(() => null), init, sync, dirty, connect, resume, setFiles, disconnect, wipe, removed, reset, mergeData, toMeta,
  canDownload: rec => !!(rec && rec.fileId && st.on && hasTok()),
  download: downloadBook, notice: showNotice
};
})();
