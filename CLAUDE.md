# Cozy Book Shelf · Tủ Sách Nhỏ

Trang tĩnh (HTML/CSS/JS thuần, không build) chạy trên GitHub Pages: https://hau100993.github.io/cozy-book-shelf/
Người dùng viết tiếng Việt; trả lời bằng tiếng Việt.

## Cấu trúc
- `index.html`: kệ sách 3D (dựa trên prompt "Leon Vasari VHS shelf"). Một vòng `requestAnimationFrame`, lò xo `s → T`, mỗi cuốn là khối 2 mặt (gáy `.sp`, bìa `.cv`) xoay `rotateY`. Bìa/gáy vẽ bằng canvas (`genCover`, `genSpine`). Sách tải lên (PDF/EPUB) lưu IndexedDB (`tu-sach-nho`). Nút "Đọc sách" chuyển sang `reader/?book=<id>`: sách tải lên được reader đọc lại từ IndexedDB theo id; sách mẫu truyền qua localStorage `tsn-handoff`. Cuốn đang chọn lưu ở `tsn-last` để quay lại kệ đúng chỗ. Trình đọc cuộn dọc cũ (`openReader`, `#reader`) còn trong file nhưng không còn dùng.
- `reader/index.html`: trình đọc WebGL lật trang cong kiểu Google Play Sách.
  - Mô hình hình trụ trong vertex shader; chỉ tờ đang lật (`uMode = 1`) bị uốn, trang dưới (`uMode = 0`) giữ phẳng và nhận bóng.
  - Uniform dùng chung giữa 2 shader phải cùng precision (`uR`, `uCurl`, `uFlip`, `uMode` khai báo `mediump` trong VS), nếu không WebGL không link được.
  - Chế độ 1 trang / 2 trang (`spread`); spread k: trang trái `2k-1`, phải `2k`. Màn hình dọc luôn 1 trang, kể cả khi chọn "2 trang" (không hiện gợi ý xoay ngang).
  - Tự dàn trang EPUB/sách mẫu ra canvas (`paginate`); vị trí chữ = key `blockIndex * 100000 + wordIndex`, nên tô sáng/đánh dấu bám theo chữ khi đổi cỡ chữ.
  - Bóng của vạt giấy gập lên tờ đang lật: dùng điểm đối xứng qua nếp gấp (`vMir`) để đổ bóng theo đúng mép vạt giấy ở mọi góc kéo.
  - PDF: bảng Aa ẩn các mục chữ (`.trow`), hiện "Thu phóng". Phóng to chỉ cho PDF: chạm hai lần / chụm hai ngón / Ctrl+cuộn; khi đang phóng to thì kéo để di chuyển, không lật trang. Màn hình = sách × `zoom.z` + `(zoom.sx, zoom.sy)` (uniform `uZ`); trang đang xem được kết xuất lại sắc nét hơn (tối đa 2.5×). Chạm một lần trên PDF chờ 280ms để phân biệt với chạm hai lần.
  - Tên tác giả trong PDF bị lọc nếu là tên phần mềm (`realAuthor`, có ở cả kệ và trình đọc).
  - Lăn chuột / vuốt hai ngón trên touchpad: xuống = trang sau, lên = trang trước (cả cuộn ngang). Mỗi cử chỉ chỉ lật 1 trang: sau khi lật, bỏ qua sự kiện wheel đến khi ngừng 180ms (`WHEEL_QUIET`), riêng nấc chuột lớn (≥40px) cho lật tiếp sau 520ms (`WHEEL_REPEAT`). Không lật khi đang phóng to PDF, giữ Ctrl, hoặc đang mở ngăn mục lục / ghi chú.
  - Toàn màn hình (nút ⛶ trên thanh menu hoặc phím F; thoát bằng F/Esc hoặc nút): `fsMode`, class `body.fs`. Gọi Fullscreen API nếu được (`fsNative`), thoát fullscreen của trình duyệt cũng thoát chế độ này. Sách dùng cả màn hình (lề 14px, giới hạn rộng lớn hơn), màn hình ngang tự hiện 2 trang trừ khi chọn "1 trang". Hai thanh nổi lên trên sách và ẩn: rê chuột sát mép trên (<72px) hiện menu, sát mép dưới hiện thanh tiến độ, rời xa 450ms thì ẩn (giữ nguyên khi đang mở Aa / mục lục / ghi chú). Cảm ứng: chạm giữa trang bật/tắt cả hai thanh (`toggleChrome`). Con trỏ tự ẩn sau 2.2s đứng yên.
  - Tô sáng (nhấn giữ 460ms rồi kéo), ghi chú, đánh dấu, mục lục, nền giấy/sepia/tối; dữ liệu lưu localStorage (`lt-settings`, `lt-b-<bookId>`).
  - Lớp chữ PDF (`loadPdfText`, `ptPage`): `getTextContent()` → tách từ, ước lượng vị trí từng từ theo tỉ lệ độ rộng đo bằng canvas (pdf.js chỉ cho độ rộng cả đoạn), nối mảnh của cùng một từ, gom dòng theo đường chân chữ; bỏ qua chữ xoay. Lưu theo toạ độ viewport scale 1, `ptPage` co theo W/H hiện tại. key = `trang * 100000 + chỉ số từ` (PDF không dàn lại nên không lệch). Trang có < 3 ký tự = ảnh scan (`SCAN_MSG`). `tpage(i)` trả cấu trúc chữ của trang cho cả PDF và EPUB.
  - Texture PDF = ảnh pdf.js (`v.base`, chỉ giữ cho trang đang hiện, `pruneBases`) + tô sáng / vùng chọn / chấm ghi chú / ruy băng vẽ trên bản sao (`composePdf`, tô sáng dùng `multiply`). Đổi tô sáng không chạy lại pdf.js.
  - Chuột (cả PDF và EPUB): đè trên chữ rồi kéo = chọn ngay (`mtext` → `select`); kéo từ dải 12% sát mép ngoài trang (`EDGE`, `isEdgeZone`) hoặc vùng trống = lật trang; nhấp đúp = chọn từ; Shift + nhấp = mở rộng vùng chọn; nhấp lên đoạn đã tô = mở menu. Nhấp trên chữ chờ 320ms để phân biệt nhấp đúp. Con trỏ: chữ I trên chữ, bàn tay ở mép trang / khi đang phóng to (`hoverCursor`). Chạm hai lần để phóng to chỉ còn cho cảm ứng. Khi phóng to: kéo chuột trên chữ = chọn, chỗ khác = di chuyển; `pointToPage` đã trừ phép phóng to.
  - Phím tắt: bảng `KEYS_KB` / `KEYS_MOUSE` dùng cho cả xử lý phím và bảng "?" (`#keys`). Ctrl/Cmd chỉ chiếm C (chép khi có vùng chọn), +, −, 0; các phím tắt khác của trình duyệt giữ nguyên. Khi PDF đang phóng to, mũi tên dùng để di chuyển.
- Thư viện tải khi cần từ cdnjs: pdf.js 3.11.174 (cả `pdf.worker.min.js` dưới dạng script để chạy không cần worker), JSZip 3.10.1.

## Chạy thử
VS Code + extension Live Server → mở `index.html` hoặc `reader/index.html`. Không mở bằng `file://`.
Test trên điện thoại: Chrome DevTools → Remote devices, hoặc mở link GitHub Pages.

## Việc đang làm / tiếp theo
- Người dùng báo `/reader/` trên điện thoại "chưa lật trang"; thử bằng touch giả lập S23+ (CDP) thì chạm mép và vuốt đều lật được. Cần kiểm tra trên máy thật (cache trình duyệt? Samsung Internet?).
- Xoá trình đọc cuộn dọc cũ trong `index.html`.
- Kệ đọc sách mặc định từ `books/` + `books.json`.
- Tìm kiếm trong sách (dùng lại lớp chữ `tpage`), xuất tô sáng ra Markdown, OCR cho PDF scan, chọn chữ qua 2 trang khi mở đôi, tay nắm chỉnh vùng chọn.
