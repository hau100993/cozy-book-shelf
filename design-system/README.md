Một tủ sách giấy: nền giấy ngà, nét mực mảnh, một màu nhấn xanh cobalt, chữ serif cho sách và sans viết hoa nhỏ cho điều khiển. Giao diện lùi lại để bìa sách và trang giấy là thứ có màu.

## Nội dung & giọng văn

- **Tiếng Việt trước.** Mọi nhãn, nút, thông báo viết tiếng Việt có dấu đầy đủ; chỉ dòng phụ logo là tiếng Anh ("A Small Library").
- **Ngắn, thân mật, nói với "bạn".** "Kệ sách còn trống", "Thêm PDF / EPUB để đặt sách lên kệ", "Sách được lưu ngay trong trình duyệt này, không tải lên đâu cả." Không dùng "người dùng", không dùng "chúng tôi" trừ trang Quyền riêng tư.
- **Động từ ở nút**: "+ Thêm sách", "Đọc sách", "Đọc tiếp", "Tải về và đọc", "Chọn file vừa tải", "Đồng bộ ngay". Hành động tạo mới có tiền tố "+".
- **Chữ hoa kiểu câu** trong mã nguồn ("Sách của tôi", "Sổ ghi chú"); việc viết hoa toàn bộ là của style `lbl` (CSS `text-transform`), không gõ chữ hoa vào nội dung.
- **Dấu chấm giữa `·`** nối thông tin cùng dòng: "PDF · EPUB", "1938 · Hồi ký", "Đồng bộ đang tạm dừng · Tiếp tục".
- **Thao tác phá huỷ phải bấm hai lần**: lần đầu nút chuyển sang verm và đổi chữ ("Bấm lần nữa để xoá"), không dùng hộp xác nhận.
- **Không emoji trang trí.** Ký hiệu chức năng duy nhất là ☁ (đồng bộ), ?, ⛶, ‹ ›, ✕.
- Lỗi nói nguyên nhân và cách làm tiếp: "Google Drive chặn tải từ trình duyệt" + hai nút "Tải file về máy" / "Chọn file vừa tải".

## Màu

- Đặt nền trang bằng `paper`; mặt nổi (trang chi tiết, menu, bảng, thẻ) bằng `sheet`; tờ giấy trong trình đọc bằng `page`. Ba lớp này chênh nhau rất ít — tách chúng bằng nét `rule` / `soft`, không bằng bóng đậm.
- Chữ chính `ink`, chữ phụ `muted`. `muted` trên nền Sepia chỉ ≈ 3.1:1 (giá trị gốc của mã): ở Sepia đừng đặt chữ phụ nhỏ bằng `muted` khi nội dung quan trọng.
- `cobalt` là màu nhấn **duy nhất** của giao diện: logo, nút chính, nút/tab đang chọn (`.on`), vòng focus, tiến độ, link. Chữ trên nền cobalt luôn là `on-cobalt`. Hover nút chính: `cobalt-deep`.
- `verm` chỉ cho nguy hiểm/lỗi: viền + chữ của nút Xoá khi rê, nền nút khi đã "nạp" (`.arm`), chấm đồng bộ lỗi. Trên `sheet` nó ≈ 4.4:1 — câu lỗi nhỏ màu verm phải có thêm chữ "Lỗi"/biểu tượng.
- Bảng màu `cover-*` (cùng `cobalt`, `verm`) chỉ dùng để vẽ **bìa sách tự tạo**: nền `cover-cream` (hoặc kem gần đó), hai màu hình + một màu gáy. Không dùng chúng cho nút hay nền giao diện.
- `wood-*` là cặp sáng/tối của bốn loại gỗ (Sồi mặc định, Óc chó, Thông, Anh đào) cho tủ lưới; `wood` là màu nền trước khi vân gỗ vẽ xong.
- Chủ đề: kệ sách chỉ có **Giấy** (cố ý, `color-scheme: light`). **Sepia** và **Tối** là nền đọc của trình đọc; ở Tối màu nhấn thành xanh nhạt `#93a9f2` và chữ trên nó là `page`.
- `hl-*` là 4 màu tô sáng, vẽ chế độ `multiply` lên trang; ở Tối độ mờ thấp hơn.

## Chữ

- Hai họ, cả hai từ Google Fonts: **Newsreader** (serif, quang học 6–72, 400/600 + 400 nghiêng) và **Inter Tight** (sans, 500/600). Link chuẩn:
  `https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap` (reader thêm Inter Tight 400).
- **Serif cho thứ thuộc về sách**: tên sách (`display`, `title`), tác giả (`byline` nghiêng), tóm tắt (`lead`), ghi chú và mô tả mục menu (`note`, `menu-hint`), logo (`logo`, 600, cobalt). Tiêu đề serif luôn 400, khoảng chữ âm (-0.01 đến -0.02em).
- **Sans cho điều khiển**: nút, tab, nhãn dùng `lbl` — 600, viết hoa, giãn 0.09em, 10.5px (11.5px trong nút thanh trên). Dòng năm/thể loại `year`. Đoạn văn giao diện `body`.
- Trước khi vẽ chữ lên canvas, gọi `document.fonts.load` kèm một chuỗi tiếng Việt để tải phần font có dấu.
- Chữ viết hoa nhỏ trong khung `overflow:hidden` cần line-height ≥ 1.5 (≥ 1.3 trong viên kính) để không cắt dấu (Ó, Ỗ).

## Hình khối, viền, bóng

- **Vuông góc** (`radius-none`) cho mọi nút, menu, ô nhập, thẻ. Bo tròn chỉ có ở viên kính điện thoại (`radius-capsule`, `radius-wheel`), mặt sách (`radius-face`), chấm trạng thái (tròn).
- **Viền 1px `rule`** là cách vẽ điều khiển chính: `.box` là chữ nhật viền mực, các nút cạnh nhau chồng viền (`margin-left:-1px`) thành một khối liền.
- Bóng chỉ ở thứ nổi lên: menu (`shadow-menu` + viền), thẻ hướng dẫn (`shadow-card`), bảng trượt (`shadow-panel`), sách (`shadow-cover`, `shadow-book`).
- Một lớp nhiễu giấy (`.grain`, SVG feTurbulence, `multiply`, opacity .55) phủ cả trang kệ.

## Kích thước & khoảng cách

- Nút thanh trên cao `ctl` (36px PC / 38px điện thoại), tab thể loại `tab` (32/34px), nút lớn ở trang chi tiết `btn-lg` 46px. Chỉ áp `ctl` cho `.top .box`; hộp thoại giữ cỡ riêng (30–34px).
- Lề trang `space-gutter` 16px cộng `env(safe-area-inset-*)`; thanh trên PC lề `space-edge` 32px; điện thoại có thanh dưới cố định `dock` 58px và mọi thứ dưới đáy (toast, kệ lưới) chừa chỗ cho nó.
- Điểm gãy: ≤ 767px là điện thoại (kệ), ≤ 640px cho thanh 2 hàng của reader.

## Chuyển động

- Một đường cong cho mọi thứ: `cubic-bezier(.2,.8,.2,1)` (`--ease`). Đổi màu nút .3–.35s, tab trượt .6s, toast .55s, viên trắng .28s.
- Lò xo cho kệ 3D (vòng `requestAnimationFrame`), không dùng CSS transition cho sách.
- Hover trên kệ lưới chỉ đổi `transform` (không animate bóng). Tôn trọng `prefers-reduced-motion` (tắt cảnh hướng dẫn, viên kính) và `prefers-reduced-transparency` (viên kính thành nền đặc).

## Trạng thái & tương tác

- Focus: `outline: 2px solid cobalt; outline-offset: 3px` (2px ở reader) — đặc, ≥ 3:1 trên paper/sheet.
- Hover nút: nền `hover`; mục menu: nền `tint`. Đang chọn: nền `cobalt`, chữ `on-cobalt`. Nấc menu đang chọn: viền + chữ cobalt, `inset 0 0 0 1px cobalt`.
- Tắt: `opacity .35–.55`, con trỏ mặc định.
- Con trỏ tự vẽ (vòng 58px + chấm) chỉ trên sách; nút, menu, hộp thoại dùng con trỏ hệ thống.

## Biểu tượng

- Không có bộ icon: vài SVG nét nội tuyến 14–16px, `stroke="currentColor"`, `stroke-width` 1.4, `stroke-linejoin="round"`, không tô (bút chì Sửa, mũi tên, đám mây). Chúng thừa màu chữ của nút.
- Ký tự thay icon: "+", "?", "☁", "⛶", "‹ ›", "✕", "←  →".
- Logo không phải file ảnh: là chữ "Tủ Sách Nhỏ" set `logo` (Newsreader 600, cobalt) trên dòng `logo-sub` "A SMALL LIBRARY" — xem thành phần Logo.

## Thành phần

Các thành phần dưới đây là CSS thuần lấy nguyên từ `index.html` (trang không có thư viện component, không có React). Muốn dùng: nạp tokens + `components/bundle.css` rồi viết đúng markup trong `preview.html` của từng thành phần.

## Chưa đưa vào

- Phông chữ là Google Fonts (không có file trong repo), nên không có file font nào ở `fonts/`.
- Không có file logo hay bộ icon trong repo: logo là chữ, icon là SVG nội tuyến.
- Phần vẽ bằng canvas/WebGL không thành token: vân gỗ (`woodTex`), bìa tự vẽ với 9 hoạ tiết (`genCover`, `MOTIFS`), kệ 3D, trang lật cong của reader, cảnh hoạt hình hướng dẫn, lớp nhiễu giấy `.grain`.
- Thành phần là bản tĩnh viết tay từ CSS của `index.html` và `reader/index.html` (trang không có thư viện component để build). Kệ: Box, PrimaryButton, DeleteButton, Segmented, Tabs, Menu, Capsule, Toast, Progress, Field, Logo, EmptyState, BookDetail, EditPanel, SyncDialog, TourCard. Trình đọc: ReaderBar, HighlightPop, ReaderSettings, Drawer, NoteSheet. Phần trình đọc dùng `cobalt` cho biến `--accent` và `rule` cho `--line` của mã.
