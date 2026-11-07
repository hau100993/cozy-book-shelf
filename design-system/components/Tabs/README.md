Tab thể loại `.tabs` — hàng nút viền với một khối cobalt `.ind` trượt tới tab đang chọn.

## Dùng khi
Lọc kệ theo thể loại. Tràn ngang thì cuộn, mép mờ (`.fl` / `.fr`) báo còn tab, và tự cuộn tới tab đang chọn.

## Người dùng cung cấp
`<div class="tabs">` với `<span class="ind">` đầu tiên rồi các `<button class="lbl">`; JS đặt `width` và `transform: translateX()` của `.ind` theo tab `.on` (chuyển động .6s `--ease`). Cao `tab` 32/34px.

## Không nên
Không dùng làm điều hướng giữa trang; ẩn hẳn (`.off`) khi chỉ có một nhóm.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
