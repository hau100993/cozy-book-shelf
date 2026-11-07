Bảng sửa thông tin `.editor` — tấm `sheet` trượt từ phải (rộng tối đa 560px) trên lớp phủ `scrim`; dùng chung cho hộp "Thêm sách từ link" và hộp Đồng bộ.

## Dùng khi
Sửa tên, tác giả, năm, thể loại, mô tả và bìa của sách tải lên (`openEditor`); các hộp thoại nhiều bước khác dựng trên cùng khung.

## Người dùng cung cấp
- `.ed-top`: Box "Huỷ"/"Đóng" bên trái, tiêu đề `lbl` ở giữa, PrimaryButton 34px ("Lưu", "Tải về") bên phải.
- `.ed-body`: khối bìa `.ed-cover` (ảnh 132px tỉ lệ 2:3 + hàng nguồn `.ed-src` gồm Box 30px), rồi các Field, chip thể loại `.chips` (Box 28px, `.on` cho thể loại đang chọn), link phụ `.ed-reset` (serif gạch chân, muted).
- Ghi chú dưới hàng nguồn bằng `.ed-note` (`note`).

## Không nên
Không lưu khi thao tác mạng bỏ dở. Không đặt nút chính ở đáy — luôn ở `.ed-top`.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
