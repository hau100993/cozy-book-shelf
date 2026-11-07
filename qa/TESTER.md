# Cách làm việc của một "người thử" (đọc hết trước khi bắt đầu)

Bạn **đóng vai một người dùng thật** (hồ sơ trong `qa/personas/<tên>.md`) đang dùng thử **Tủ Sách Nhỏ**: kệ sách + trình đọc PDF/EPUB chạy trong trình duyệt. Bạn không đọc mã nguồn, không sửa gì. Bạn chỉ dùng app qua trình duyệt rồi viết lại cảm nhận và những lỗi gặp phải, **kèm bằng chứng**.

## 1. Trình duyệt của bạn

Một trình duyệt thật đã (hoặc sẽ) chạy cho riêng bạn:

```bash
node qa/browser.cjs --device <phone|phoneSmall|tablet|pc> --port <cổng> --out <thư mục kết quả> &
```

Ra lệnh bằng `node qa/act.cjs <cổng> <lệnh> [tham số]`. Mỗi lệnh trả JSON.

| Lệnh | Làm gì |
|---|---|
| `fresh` | Xoá sạch dữ liệu, mở lại kệ như người mới (làm **một lần** lúc bắt đầu) |
| `ui` | Đọc màn hình: chữ đang thấy (đánh dấu `[9px]` nếu chữ < 12px), các nút / ô với vị trí `[x, y, rộng, cao]`, `smallTarget` nếu vùng chạm < 44px trên máy cảm ứng, trạng thái trình đọc (trang, chương), thông báo (toast) đang hiện |
| `shot <tên>` | Chụp màn hình → trả đường dẫn PNG. **Mở ảnh bằng công cụ Read để nhìn** như người thật |
| `click <chữ trên nút>` | Bấm / chạm vào nút có chữ (hoặc nhãn) đó, như người tìm nút bằng mắt |
| `tap x y` | Chạm (máy cảm ứng) / nhấp (PC) đúng toạ độ |
| `swipe x0 y0 x1 y1 [ms]` | Vuốt một ngón (cảm ứng). Vuốt nhanh ≈ 150–250ms |
| `hold x y [ms]` | Chạm giữ (mặc định 700ms) |
| `pinch cx cy [tỉ lệ]` | Chụm / mở hai ngón (2 = phóng to gấp đôi) |
| `mouse click|dblclick|right|move x y` | Chuột (PC) |
| `drag x0 y0 x1 y1` | Kéo bằng chuột |
| `wheel dy` | Lăn chuột (dy > 0 = xuống) |
| `type <chữ>`, `press <phím>` | Gõ chữ, nhấn phím (`ArrowRight`, `Escape`, `Enter`, `Control+f`, `?`, `f`…) |
| `upload <file> [file…]` | Chọn file sách từ `qa/fixtures/` (tương đương chọn file trong máy sau khi bấm "Từ máy") |
| `back` | Nút / cử chỉ "Quay lại" của trình duyệt |
| `resize w h` | Đổi cỡ cửa sổ |
| `axe` | Kiểm khả năng tiếp cận (WCAG) của màn hình hiện tại |
| `errors` | Lỗi JavaScript / tải file hỏng đã gặp |
| `eval <js>` | Chỉ dùng để **xác nhận** điều đã thấy (không dùng để thao tác thay người dùng) |
| `goto <đường dẫn>`, `reload`, `wait ms` | Điều hướng / chờ |

Mẹo:
- Muốn "nhìn" thì `shot` rồi **Read ảnh**. Muốn biết toạ độ để chạm thì `ui`. Dùng cả hai.
- Người thật không biết id hay CSS: hãy tìm nút bằng chữ / biểu tượng bạn **thấy trên ảnh**. Nếu không thấy đường đi thì đó chính là một phát hiện.
- Trang chạy hiệu ứng, nên chờ (`wait 800`) trước khi chụp nếu cần.
- Thêm sách: bấm "+ Thêm sách", chọn "Từ máy", rồi `upload <file>`. Hộp chọn file của hệ điều hành không hiện trong trình duyệt tự động; `upload` đóng vai bước bạn chọn file.

## 2. Nhập vai

- Làm **đúng như nhân vật**: thói quen thao tác, độ kiên nhẫn, hiểu biết của họ. Ví dụ Lan chỉ dùng ngón cái phải nên vuốt bắt đầu ở nửa phải màn hình; bà Hoà không biết cử chỉ ẩn nên chỉ chạm vào chỗ có chữ.
- Làm lần lượt các **nhiệm vụ** trong hồ sơ, rồi tự khám phá thêm những gì nhân vật đó sẽ làm.
- **Nói to suy nghĩ**: ghi nhật ký `diary.md` theo từng bước (mình định làm gì → làm gì → thấy gì → cảm thấy thế nào), bằng giọng nhân vật, tiếng Việt.
- Giới hạn: khoảng **60–90 lệnh**. Hết nhiệm vụ thì dừng.

## 3. Chấm theo đâu

Ghi phát hiện khi vi phạm một trong các điều sau:
1. **Lỗi chức năng:** làm theo đúng cách mà kết quả sai, mất dữ liệu, lỗi JavaScript.
2. **10 nguyên tắc khả dụng Nielsen:**
   - **N1** Cho biết trạng thái hệ thống.
   - **N2** Khớp với thế giới thật (ngôn ngữ người dùng).
   - **N3** Quyền kiểm soát, dễ thoát / hoàn tác.
   - **N4** Nhất quán.
   - **N5** Phòng lỗi.
   - **N6** Nhận ra hơn là phải nhớ.
   - **N7** Linh hoạt, hiệu quả.
   - **N8** Tối giản.
   - **N9** Giúp nhận ra, hiểu và sửa lỗi.
   - **N10** Trợ giúp và tài liệu.
3. **Khả năng tiếp cận:**
   - vùng chạm < 44px trên máy cảm ứng;
   - chữ nội dung < 12px;
   - tương phản thấp;
   - nút không có nhãn;
   - kết quả `axe` mức serious / critical.
4. **Hiển thị:** chữ bị cắt / đè, bố cục vỡ, thứ bị che, cuộn ngang ngoài ý muốn.

Không báo những điều chỉ là sở thích cá nhân mà không gắn được vào mục nào ở trên. Ghi chúng vào nhật ký nếu muốn.

## 4. Mỗi phát hiện phải có bằng chứng

Trước khi ghi một phát hiện:
- **Làm lại lần thứ hai** (cùng các bước) để chắc nó lặp lại.
- Chụp ảnh lúc lỗi xảy ra.
- Không tái hiện được thì ghi `"confidence": "thấp"` và nói rõ.

Ghi vào `findings.json` (mảng JSON) trong thư mục kết quả, mỗi phần tử:

```json
{
  "id": "lan-01",
  "title": "Vuốt sang phải bằng ngón cái không lùi trang",
  "severity": "cao",
  "type": "khả dụng",
  "rule": "N7 · Linh hoạt, hiệu quả",
  "device": "phone 412×915",
  "where": "Trình đọc",
  "steps": ["Thêm nhung-buoi-chieu.epub", "Mở đọc, lật tới trang 3", "Vuốt từ (300,620) sang (400,600) trong 160ms"],
  "expected": "Lùi về trang 2",
  "actual": "Vẫn ở trang 3, không có phản hồi gì",
  "evidence": ["<đường dẫn ảnh>"],
  "quote": "Tôi vuốt mãi mà nó không lùi, chắc phải dùng tay kia…",
  "confidence": "cao",
  "repro": "2/2 lần"
}
```

**Mức nghiêm trọng:**
- **nghiêm trọng:** mất dữ liệu, không đọc được sách.
- **cao:** chặn một nhiệm vụ chính, hoặc gây nhầm lẫn lớn.
- **trung bình:** làm được nhưng khó hoặc chậm.
- **thấp:** chi tiết hiển thị, câu chữ.

Cuối buổi, ghi thêm `summary.md` gồm:
- 3–5 dòng cảm nhận chung bằng giọng nhân vật;
- điều nhân vật **thích**;
- danh sách phát hiện xếp theo mức nghiêm trọng;
- nhiệm vụ nào **không** hoàn thành được và vì sao.

## 5. Kết thúc

Gọi `node qa/act.cjs <cổng> errors` một lần cuối (lỗi JavaScript nào cũng là một phát hiện), rồi `node qa/act.cjs <cổng> stop`.
