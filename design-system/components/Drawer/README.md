Ngăn trái `.drawer` của trình đọc — tấm `sheet` rộng 380px (≤ 88vw) trượt từ trái trên lớp phủ: link về kệ, tên sách serif, tab gạch chân, danh sách.

## Dùng khi
Nút Mục lục hoặc Tìm (Ctrl+F, /). Tab: Mục lục / Tìm / Đánh dấu / Tô sáng. Tab đang chọn: chữ `ink` + gạch dưới 2px `cobalt` (khác Tabs của kệ — ở đây nhẹ hơn).

## Người dùng cung cấp
Các `.item`: tiêu đề `.tt` (serif 16px), số trang `.pg` (muted, tabular), dòng phụ `.sub`, ghi chú `.nt` (serif nghiêng, viền trái cobalt 2px — trích dẫn của người đọc). Mục đang đọc `.cur` nền `tint`. Kết quả tìm tô cam `mark`. Danh sách trống: câu serif muted.

## Không nên
Dùng viền trái cobalt cho thứ gì khác ngoài ghi chú/trích dẫn.

_Viết tay từ CSS trong `reader/index.html` (bản tĩnh, không có component JS)._
