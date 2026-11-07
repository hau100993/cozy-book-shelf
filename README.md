# Cozy Book Shelf · Tủ Sách Nhỏ

Kệ sách 3D kiểu kệ băng VHS và trình đọc lật trang cong (kiểu Google Play Sách). HTML, CSS và JavaScript thuần, không cần build.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `index.html` | Kệ sách: xoay bìa 3D, thả PDF/EPUB để thêm sách (lưu trong IndexedDB của trình duyệt) |
| `reader/index.html` | Trình đọc WebGL: lật trang cong, 1/2 trang, cỡ chữ, tô sáng, ghi chú, đánh dấu, mục lục, nền sáng/sepia/tối |
| `tokens.css` | Màu, bóng, khoảng cách, font dùng chung cho mọi trang — **sinh tự động** từ `design-system/tokens.json` |
| `design-system/` | Hệ thiết kế: `tokens.json` (nguồn), `build.mjs` (sinh `tokens.css`), `README.md` (quy tắc dùng), `components/` (CSS + bản xem trước 21 thành phần) |
| `.nojekyll` | Báo GitHub Pages phục vụ file nguyên trạng |

Thư viện bên ngoài được tải khi cần từ cdnjs: pdf.js 3.11.174 (đọc PDF), JSZip 3.10.1 (đọc EPUB). Font lấy từ Google Fonts.

## Chạy thử trên máy

Mở thư mục bằng VS Code, cài extension **Live Server**, chuột phải `index.html` → *Open with Live Server*.
Không mở trực tiếp bằng `file://`, vì một số trình duyệt chặn tải thư viện từ trang mở theo cách này.

## Đổi màu, bóng, font

Sửa `design-system/tokens.json` rồi chạy `node design-system/build.mjs` để sinh lại `tokens.css`; commit cả hai file. Không sửa `tokens.css` bằng tay.

## Đưa lên GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → Branch: `main`, thư mục `/ (root)` → Save.
Sau 1–2 phút trang có ở `https://hau100993.github.io/cozy-book-shelf/`.

## Việc tiếp theo

- Nút "Đọc sách" trên kệ mở thẳng trình đọc lật trang cho sách đã chọn.
- Sách mặc định của kệ đọc từ `books/` + `books.json` trong repo.
- Tìm kiếm trong sách, xuất tô sáng ra Markdown, tô sáng cho PDF.
