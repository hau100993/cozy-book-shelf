Ô nhập `.field` — nhãn `lbl` muted, ô vuông viền mực nhạt trên nền `field`, chữ serif; ghi chú dưới bằng `note`.

## Dùng khi
Bảng sửa thông tin sách (Tên, Tác giả, Năm, Thể loại, Mô tả), hộp thêm link.

## Người dùng cung cấp
`<label class="field"><span class="lbl">…</span><input>…</label>`; ghi chú `<p class="note">`, lỗi thêm `.err` (verm — kèm chữ nói rõ lỗi). Focus: viền cobalt 2px trong ô.

## Không nên
Không bo góc, không dùng placeholder thay cho nhãn.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
