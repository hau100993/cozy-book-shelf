Viên kính `.wcap` — menu Hiển thị trên điện thoại (≤ 767px): nổi ngay trên thanh dưới, nền kính mờ, hai hàng.

## Dùng khi
Chỉ trên điện thoại, thay cho Menu panel. Hàng trên `.wc-wheel`: mọi lựa chọn của nhóm vừa một hàng (`--n` cột, không cuộn, không cắt chữ), viên trắng `.wc-ind` trượt tới lựa chọn; chạm, hoặc kéo ngang rồi thả (rung 4ms mỗi bước). Hàng dưới `.wc-cats`: nhóm (Kiểu kệ / Thứ tự / Gỗ), nhóm đang chọn đậm + vạch cobalt 14×2px.

## Người dùng cung cấp
Đặt `--n` (số lựa chọn) và `--m` (số nhóm), `transform: translateX(k*100%)` cho `.wc-ind`. Một bộ xử lý pointer: ngang = trượt, kéo xuống > 40px = đóng, chạm = chọn. Áp lựa chọn bằng cách `.click()` nút tương ứng trong menu PC.

## Lưu ý
Màu viên kính cố định sáng (giao diện kệ chỉ có chủ đề Giấy). Có nền đặc khi không hỗ trợ `backdrop-filter` hoặc `prefers-reduced-transparency`. line-height ≥ 1.3 để không cắt dấu chữ hoa.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
