Nút viền mực `.box` — điều khiển cơ bản của cả trang: thanh trên, hộp thoại, chip, nguồn bìa.

## Dùng khi
Mọi hành động phụ: Thêm sách, Hiển thị, Đồng bộ, Hướng dẫn, các nút trong hộp thoại. Hành động chính của một màn hình dùng PrimaryButton.

## Người dùng cung cấp
Một `<button type="button" class="box lbl">` với chữ (động từ, có dấu đầy đủ; tiền tố "+" khi tạo mới), có thể kèm SVG nét 16px `stroke="currentColor"`.

## Biến thể
- `.on` — đang bật/đang chọn: nền `cobalt`, chữ `on-cobalt`.
- `.arm` — đã "nạp" thao tác phá huỷ (bấm lần nữa để làm): nền `verm`.
- `.sq` — vuông, chỉ biểu tượng (nút "?"); cần `aria-label`.
- `.sm` — 30px trong hộp thoại; mặc định cao `ctl`.
- `:disabled` — opacity .35.

## Nên / không nên
- Nên đặt nhiều `.box` sát nhau với `gap` `space-gap` 8px; trong `.seg` thì chồng viền.
- Không bo góc, không thêm bóng. Không đổi màu viền ngoài `rule` (trừ trạng thái).

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
