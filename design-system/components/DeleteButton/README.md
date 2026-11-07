Nút xoá `.btn-del` — viền mờ, chuyển sang `verm` khi rê hoặc sau lần bấm đầu (`.arm`).

## Dùng khi
Xoá sách khỏi kệ (trang chi tiết), xoá dữ liệu đồng bộ. Luôn cần hai lần bấm: lần đầu thêm `.arm` và đổi chữ thành lời xác nhận, hết vài giây thì quay về.

## Người dùng cung cấp
`<button class="btn-del lbl">` + logic hai lần bấm. Đặt cạnh PrimaryButton, cùng cao 46px.

## Không nên
Không dùng hộp thoại xác nhận riêng; không tô nền đỏ khi chưa nạp.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
