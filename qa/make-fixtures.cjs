#!/usr/bin/env node
// Tạo sách mẫu cho đội thử nghiệm (nội dung tự viết, không bản quyền): qa/fixtures/*
'use strict';
const fs = require('fs'), path = require('path'), JSZip = require('jszip');
const OUT = path.join(__dirname, 'fixtures');
const P = [
  'Khi đọc sách giấy, ta không chỉ đọc chữ. Ngón tay biết mình đang ở đâu trong cuốn sách nhờ độ dày của xấp giấy còn lại, và mắt quen dần với nhịp của từng trang.',
  'Những buổi chiều mưa, người ta thường tìm đến một góc yên tĩnh, pha một ấm trà rồi mở cuốn sách đang đọc dở. Tiếng mưa rơi đều trên mái tôn làm cho từng dòng chữ như chậm lại.',
  'Có những cuốn sách ta đọc một lần rồi quên, nhưng cũng có những cuốn ở lại rất lâu. Chúng không ồn ào, chỉ lặng lẽ thay đổi cách ta nhìn một con đường quen, một gương mặt quen.',
  'Thói quen đọc mỗi ngày một ít, đều đặn như tưới cây, đôi khi quý hơn những đợt đọc dồn dập rồi bỏ dở. Mười trang mỗi tối, một năm đã là hơn mười cuốn sách.'
];
async function epub(file, title, author, chapters){
  const z = new JSZip();
  z.file('mimetype', 'application/epub+zip', { compression:'STORE' });
  z.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  const man = chapters.map((c, i) => `<item id="c${i}" href="c${i}.xhtml" media-type="application/xhtml+xml"/>`).join('');
  z.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">${file}</dc:identifier><dc:title>${title}</dc:title><dc:creator>${author}</dc:creator><dc:language>vi</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${man}</manifest><spine>${chapters.map((c, i) => `<itemref idref="c${i}"/>`).join('')}</spine></package>`);
  z.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Mục lục</title></head><body><nav epub:type="toc"><ol>${chapters.map((c, i) => `<li><a href="c${i}.xhtml">${c}</a></li>`).join('')}</ol></nav></body></html>`);
  chapters.forEach((c, i) => {
    const body = Array.from({ length: 14 }, (_, k) => `<p>${P[(i + k) % 4]} ${P[(i + k + 1) % 4]}</p>`).join('');
    z.file(`OEBPS/c${i}.xhtml`, `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${c}</title></head><body><h1>${c}</h1>${body}</body></html>`);
  });
  fs.writeFileSync(path.join(OUT, file), await z.generateAsync({ type:'nodebuffer', mimeType:'application/epub+zip' }));
}
function pdf(file, pages){
  const objs = { 1:'<< /Type /Catalog /Pages 2 0 R >>', 3:'<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>' }; let n = 4; const kids = [];
  for (let pg = 0; pg < pages; pg++){
    let st = ''; for (let i = 0; i < 30; i++) st += `BT /F1 12 Tf 56 ${740 - i * 20} Td (Page ${pg + 1}, line ${i + 1}: reading a long document on a tablet held sideways.) Tj ET\n`;
    if (pg % 3 === 1) st += '0.8 0.2 0.15 rg 60 60 160 90 re f\n0.12 0.25 0.69 rg 260 60 160 90 re f\n';
    objs[n] = `<< /Length ${Buffer.byteLength(st)} >>\nstream\n${st}\nendstream`; const c = n++;
    objs[n] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${c} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`; kids.push(n++);
  }
  objs[2] = `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
  objs[n] = '<< /Title (Bao cao thuong nien) /Author (Phong Ke hoach) >>'; const info = n++;
  let out = '%PDF-1.4\n'; const off = {};
  for (let i = 1; i < n; i++){ off[i] = Buffer.byteLength(out); out += `${i} 0 obj\n${objs[i]}\nendobj\n`; }
  const x = Buffer.byteLength(out);
  out += `xref\n0 ${n}\n0000000000 65535 f \n` + Array.from({ length: n - 1 }, (_, k) => String(off[k + 1]).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${n} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  fs.writeFileSync(path.join(OUT, file), out, 'latin1');
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const ch = n => Array.from({ length: n }, (_, i) => `Chương ${i + 1}: Những buổi chiều đọc sách bên hiên nhà`);
  await epub('nhung-buoi-chieu.epub', 'Những buổi chiều đọc sách', 'Nguyễn Văn An', ch(6));
  await epub('ten-rat-dai.epub', 'Nghịch lý Dopamine: Niềm vui, Nỗi đau và Chu trình tận hưởng niềm vui quá mức trong thời đại số', 'Trần Thị Bình', ch(3));
  await epub('so-tay-ngan.epub', 'Sổ tay ngắn', 'Lê Minh', ch(2));
  pdf('bao-cao-dai.pdf', 40);
  fs.writeFileSync(path.join(OUT, 'ghi-chu.txt'), 'Đây không phải sách, chỉ là ghi chú.\n');
  console.log(fs.readdirSync(OUT).join('\n'));
})();
