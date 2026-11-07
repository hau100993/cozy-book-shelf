Thẻ hướng dẫn `.t-card` — thẻ `sheet` 440px trên lớp phủ tối: cảnh hoạt hình ở trên, chữ ở giữa, chấm bước + nút ở dưới.

## Dùng khi
Hướng dẫn lần đầu (6 bước). Bước nói về một nút thì lớp phủ trong suốt và vòng `#tRing` (viền `paper` 2px + `cobalt` 4px + bóng 9999px làm tối nền, bo `radius-ring`) khoanh nút đó.

## Người dùng cung cấp
- `.t-scene` cao 150px trên nền `paper`: cảnh CSS bằng khối màu `cover-*`/`cobalt`/`verm` (không ảnh, không icon); chạy lại từ đầu khi đổi bước, tắt khi `prefers-reduced-motion`.
- `.t-step` (lbl cobalt, "Bước 2 / 6"), `.t-title` (`heading`), `.t-body` (`body`, từ khoá in đậm).
- `.t-foot`: chấm bước, "Bỏ qua", "←", PrimaryButton 30px "Tiếp →"; dưới cùng ô "Không hiển thị lại".

## Không nên
Quá 6 bước; câu dài hơn ba dòng.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
