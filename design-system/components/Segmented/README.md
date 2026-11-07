Công tắc nhiều nấc `.seg` — các nút viền chồng nhau, nấc đang chọn nền cobalt.

## Dùng khi
Chọn một trong 2–3 chế độ ngang hàng: "Sách của tôi / Sổ ghi chú" (`#viewSeg`), Nền đọc Giấy / Sepia / Tối, 1 trang / 2 trang trong reader.

## Người dùng cung cấp
`<div class="seg" role="group" aria-label="…">` chứa các `<button class="lbl" data-v="…">`; thêm `.on` (và `aria-pressed`) cho nấc đang chọn. Nấc có thể kèm một chấm màu `<i>` (nền đọc).

## Không nên
Quá 3 nấc — dùng Tabs hoặc menu.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
