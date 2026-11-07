Thanh trên `.r-bar` và thanh tiến độ `.r-foot` của trình đọc — nền `paper`, nút Box 30px chỉ có biểu tượng, tên sách serif + nhãn chương cobalt ở giữa.

## Dùng khi
Luôn có trong `reader/`. Trái: Về kệ, Mục lục (mở Drawer), Tìm, "+ Mở sách". Phải: Toàn màn hình ⛶, "Aa" (mở ReaderSettings, chữ serif 16px), Đánh dấu (ruy băng). Dưới: "trang / tổng" (`lbl` muted, số tabular) + thanh kéo `range` màu cobalt.

## Người dùng cung cấp
Tên sách (`b`, serif 17px, cắt bằng dấu …) và nhãn chương (`lbl` cobalt). Mỗi nút biểu tượng có `aria-label` và `title` kèm phím tắt.

## Biến thể
- Điện thoại (≤ 640px): hai hàng — nút ở trên, tên + chương ở dưới; vùng sách tự tính theo chiều cao thanh.
- Toàn màn hình: hai thanh nổi lên trên sách và ẩn; rê sát mép trên/dưới (< 72px) hoặc chạm giữa trang để hiện; có bóng chỉ khi đang hiện.

## Không nên
Thêm chữ vào nút biểu tượng (trừ "Mở sách" trên PC); đổi nền thanh khác `paper`.

_Viết tay từ CSS trong `reader/index.html` (bản tĩnh, không có component JS)._
