Hộp "Đồng bộ & sao lưu" (`#syncDlg`) — dựng trên khung EditPanel; ba phần Google Drive / Sao lưu / Trên máy này, mỗi phần mở bằng nhãn `lbl` muted.

## Dùng khi
Bấm nút ☁ trên thanh trên. Nút này (`.sybtn`) có chấm 7px báo trạng thái: `sync-on` = đang đồng bộ, `cobalt` = đang chạy một lượt, `verm` = tạm dừng/lỗi, ẩn khi chưa kết nối.

## Người dùng cung cấp
- Câu trạng thái `.sy-st` (`lead`, 17px; `.err` khi lỗi — kèm chữ nói lỗi).
- Chưa kết nối: đoạn giải thích `.ed-note` có link Quyền riêng tư, **hai ô đồng ý để trống sẵn** (`.sy-ck`: checkbox cobalt + câu serif nói rõ lưu gì, ở đâu), PrimaryButton "Kết nối Google Drive".
- Đã kết nối: ô bật/tắt file sách, Box "Đồng bộ ngay" / "Ngắt kết nối", Box "Xoá dữ liệu đồng bộ trên Drive" (bấm hai lần → `.arm`).
- Sao lưu: ô "Kèm file sách", Box "Tải bản sao lưu" / "Khôi phục từ file…".
- `.ed-top` không có nút Lưu: chỗ đó là `.sy-sp` 62px để tiêu đề vẫn ở giữa.

## Không nên
Không tick sẵn ô đồng ý; không dùng từ kỹ thuật (token, appDataFolder) trong câu cho người đọc.

_Viết tay từ CSS trong `index.html` (bản tĩnh, không có component JS)._
