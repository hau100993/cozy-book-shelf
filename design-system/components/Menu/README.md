Menu thả xuống `.menu` — mặt `sheet`, viền `rule`, bóng `shadow-menu`; mỗi mục một tiêu đề `lbl` và dòng mô tả serif.

## Dùng khi
Menu "+ Thêm sách" (Từ máy / Từ link) và menu "Hiển thị" trên PC (`.menu.panel`: Kiểu kệ, Thứ tự sách, Gỗ). Trên điện thoại menu Hiển thị là Capsule.

## Người dùng cung cấp
Vị trí `position:fixed` cạnh nút mở (lật lên nếu hết chỗ); đóng khi bấm ra ngoài, Esc, cuộn, đổi cỡ màn hình. Mục: `<button>` chứa `<span class="lbl">` + `<small>`. Panel dùng `.wm-row` + `.wm-k` (hai ô lớn), `.wm-s` (thanh nấc liền), `.wm-w` (mẫu gỗ tròn, biến `--l`/`--d` từ `wood-*`); lựa chọn đánh dấu bằng `aria-pressed="true"`.

## Không nên
Không bo góc, không dùng bóng mà thiếu viền.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
