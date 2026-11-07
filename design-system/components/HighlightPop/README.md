Thanh tô sáng `.pop` — viên mực (`ink`, chữ `page`) bật lên trên đoạn vừa chọn: 4 chấm màu `hl-*`, vạch ngăn, rồi các hành động chữ.

## Dùng khi
Sau khi chọn chữ (nhấn giữ 460ms rồi kéo trên cảm ứng; kéo trên chữ với chuột) hoặc bấm lên đoạn đã tô. Màu đang dùng có viền `page` (`.sw.cur`).

## Người dùng cung cấp
Bốn `button.sw` có `aria-label` ("Tô vàng"…) với chấm màu đậm (#F2C434, #6EB964, #EC7091, #5087E6 — bản đặc của `hl-*`), `.sep`, các `button.act lbl`: Ghi chú, Chép, Xoá tô.

## Không nên
Thêm màu thứ năm; dùng icon thay chữ cho hành động.

_Viết tay từ CSS trong `reader/index.html` (bản tĩnh, không có component JS)._
