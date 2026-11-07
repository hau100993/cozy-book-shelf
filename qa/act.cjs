#!/usr/bin/env node
// Gửi một lệnh tới trình duyệt của nhân vật:  node qa/act.cjs <port> <lệnh> [tham số...]
// Ví dụ: node qa/act.cjs 9301 ui | node qa/act.cjs 9301 click "Thêm sách" | node qa/act.cjs 9301 swipe 330 600 120 600 180
'use strict';
const http = require('http');
const [port, cmd, ...args] = process.argv.slice(2);
if (!port || !cmd){ console.error('Cách dùng: node qa/act.cjs <port> <lệnh> [tham số...]'); process.exit(1); }
const body = JSON.stringify({ cmd, args });
const req = http.request({ host:'127.0.0.1', port:+port, method:'POST', headers:{ 'content-type':'application/json', 'content-length': Buffer.byteLength(body) } }, res => {
  let d = ''; res.setEncoding('utf8'); res.on('data', c => d += c); res.on('end', () => console.log(d));
});
req.on('error', e => { console.error('Không kết nối được trình duyệt ở cổng ' + port + ': ' + e.message); process.exit(1); });
req.end(body);
