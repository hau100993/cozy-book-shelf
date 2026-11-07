Bảng "Aa" `.r-sheet` — tấm `sheet` 330px mở từ nút Aa: các hàng nhãn `lbl` muted + công tắc Segmented 34px (chữ sans 13px, không viết hoa).

## Dùng khi
Đổi cỡ chữ (A− / số / A+), Giãn dòng, Lề trang, Kiểu chữ (Có chân / Không chân), Nền (Giấy / Sepia / Tối, mỗi nấc có chấm màu `page` của chủ đề), Hoạ tiết nền, Bố cục (Tự động / 1 trang / 2 trang), rồi Box "Phím tắt ?".

## Người dùng cung cấp
Mỗi hàng `.row` = nhãn + điều khiển + tuỳ chọn `.hint` (sans 12.5px muted). Với PDF ẩn các hàng chữ (`.trow`) và hiện hàng "Thu phóng" (− 100% +).

## Không nên
Quá 4 nấc trong một công tắc; đặt nút Lưu — mọi thay đổi áp dụng ngay.

_Viết tay từ CSS trong `reader/index.html` (bản tĩnh, không có component JS)._
