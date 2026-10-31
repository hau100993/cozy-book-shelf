# Cozy Book Shelf · Tủ Sách Nhỏ

Trang tĩnh (HTML/CSS/JS thuần, không build) chạy trên GitHub Pages: https://hau100993.github.io/cozy-book-shelf/
Người dùng viết tiếng Việt; trả lời bằng tiếng Việt.

## Cấu trúc
- `index.html`: kệ sách 3D (dựa trên prompt "Leon Vasari VHS shelf"). Một vòng `requestAnimationFrame`, lò xo `s → T`, mỗi cuốn là khối 2 mặt (gáy `.sp`, bìa `.cv`) xoay `rotateY`. Bìa/gáy vẽ bằng canvas (`genCover`, `genSpine`). Sách tải lên (PDF/EPUB) lưu IndexedDB (`tu-sach-nho`). Nút "Đọc sách" hiện vẫn mở trình đọc cuộn dọc cũ bên trong file này.
- `reader/index.html`: trình đọc WebGL lật trang cong kiểu Google Play Sách.
  - Mô hình hình trụ trong vertex shader; chỉ tờ đang lật (`uMode = 1`) bị uốn, trang dưới (`uMode = 0`) giữ phẳng và nhận bóng.
  - Uniform dùng chung giữa 2 shader phải cùng precision (`uR`, `uCurl`, `uFlip`, `uMode` khai báo `mediump` trong VS), nếu không WebGL không link được.
  - Chế độ 1 trang / 2 trang (`spread`); spread k: trang trái `2k-1`, phải `2k`.
  - Tự dàn trang EPUB/sách mẫu ra canvas (`paginate`); vị trí chữ = key `blockIndex * 100000 + wordIndex`, nên tô sáng/đánh dấu bám theo chữ khi đổi cỡ chữ.
  - Tô sáng (nhấn giữ 460ms rồi kéo), ghi chú, đánh dấu, mục lục, nền giấy/sepia/tối; dữ liệu lưu localStorage (`lt-settings`, `lt-b-<bookId>`).
  - `window.__reader.state()` để kiểm tra trạng thái khi test.
- Thư viện tải khi cần từ cdnjs: pdf.js 3.11.174 (cả `pdf.worker.min.js` dưới dạng script để chạy không cần worker), JSZip 3.10.1.

## Chạy thử
VS Code + extension Live Server → mở `index.html` hoặc `reader/index.html`. Không mở bằng `file://`.
Test trên điện thoại: Chrome DevTools → Remote devices, hoặc mở link GitHub Pages.

## Việc đang làm / tiếp theo
- Người dùng báo `/reader/` trên điện thoại "chưa lật trang"; thử bằng touch giả lập S23+ (CDP) thì chạm mép và vuốt đều lật được. Cần kiểm tra trên máy thật (cache trình duyệt? Samsung Internet?).
- Nối nút "Đọc sách" trên kệ sang `reader/` cho cuốn đang chọn (kể cả sách trong IndexedDB).
- Kệ đọc sách mặc định từ `books/` + `books.json`.
- Tìm kiếm trong sách, xuất tô sáng ra Markdown, tô sáng cho PDF.
