Nút chính `.btn-read` "Đọc sách" — nền cobalt đặc, cao `btn-lg` 46px; mỗi màn hình tối đa một nút như vậy.

## Dùng khi
Hành động chính: Đọc sách / Đọc tiếp ở trang chi tiết, Lưu trong bảng sửa thông tin (34px), Tiếp trong hướng dẫn (30px).

## Người dùng cung cấp
`<button class="btn-read lbl">` với động từ. Cỡ nhỏ hơn: đặt `height` và `padding` tại chỗ (34px / 0 20px; 30px / 0 16px).

## Trạng thái
Hover `cobalt-deep`; `.dim` (opacity .45) khi sách ma chưa có file. Chữ luôn `on-cobalt`.

## Không nên
Không đặt hai nút chính cạnh nhau; nút đi kèm là Box hoặc DeleteButton.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
