Trang chi tiết sách `.detail` — PC hai cột: bìa lớn bên trái, bên phải là phụ đề, tên sách, tác giả, meta, tiến độ, thanh nút và phần tóm tắt.

## Dùng khi
Chạm/bấm một cuốn trên kệ (`openDetail`). Mặt `sheet` phủ toàn màn hình, nút "← Về kệ" (Box) góc trên trái, Logo ở giữa thanh trên.

## Người dùng cung cấp
- `.dsub` (lbl, cobalt): thể loại hoặc "Đang đọc".
- `.dtitle` (style `display`, tối đa 3 dòng), `.dvi` tác giả (`byline`), `.dmeta` (lbl, muted: năm · số trang · định dạng · nguồn).
- Progress khi đã đọc. `.dbar`: PrimaryButton "Đọc sách →" / "Đọc tiếp", DeleteButton bút chì (Sửa, chỉ sách tải lên) và DeleteButton Xoá.
- `.dbody` (chỉ sách mẫu): tóm tắt `.dsyn` (`lead`, ≤ 44ch) và `.dcred` nghiêng.

## Điện thoại
Một cột: bìa lớn ở giữa chiếm phần cao còn lại (hàng `minmax(190px,1fr)`, tối đa 58svh), chữ căn giữa bên dưới, `.dbar` dính đáy (`position: sticky`, không `fixed` vì `.detail` có transform).

## Không nên
Sách tải lên không có mô tả: gộp thông tin vào dòng meta thay vì để `.dbody` trống. Mỗi dòng chữ nằm trong khung `.dm` (overflow hidden) để trượt vào — line-height ≥ 1.5 cho chữ hoa nhỏ.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
