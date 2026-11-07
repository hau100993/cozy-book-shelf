# Đội thử nghiệm ảo · Tủ Sách Nhỏ

Các nhân vật AI (theo phương pháp PersonaTester, FSE 2026: mỗi nhân vật có **tư duy khi thử**, **cách khám phá**, **thói quen thao tác** riêng) dùng thử app trong **trình duyệt thật**. Họ vừa làm vừa ghi suy nghĩ, rồi báo lỗi kèm ảnh và các bước tái hiện. Chấm theo 10 nguyên tắc khả dụng Nielsen, WCAG (axe-core) và lỗi chức năng.

| File | Vai trò |
|---|---|
| `personas/*.md` | 4 nhân vật: **Lan** (điện thoại, một tay), **anh Minh** (máy tính bảng, PDF dài), **bà Hoà** (lần đầu dùng, lớn tuổi), **Duy** (PC, thử giới hạn) |
| `TESTER.md` | Cách làm việc chung: lệnh điều khiển, cách nhập vai, thang chấm, mẫu báo lỗi |
| `browser.cjs` | Trình duyệt chạy liên tục cho một nhân vật (tự phục vụ repo, thư viện cdnjs lấy từ `node_modules`, chặn Google) |
| `act.cjs` | Gửi một lệnh: `node qa/act.cjs <cổng> <lệnh> …` |
| `make-fixtures.cjs`, `fixtures/` | Sách mẫu tự viết (EPUB, PDF 40 trang, tên rất dài, file không phải sách) |
| `../.claude/agents/ux-tester.md`, `../.claude/skills/ux-test/` | Agent "người thử" và skill `/ux-test` cho Claude Code |
| `runs/` | Kết quả mỗi lần chạy (không đưa lên git) |

Chạy: trong Claude Code gõ `/ux-test` (hoặc `/ux-test lan`). Thêm nhân vật: thêm một file vào `personas/` theo cùng mẫu.

Giới hạn: không thử được cử chỉ / trình duyệt của máy thật (Quay lại của Android, Samsung Internet), đăng nhập Google và Drive thật. Nhân vật AI đôi khi báo nhầm, nên mọi phát hiện mức cao được tái hiện lại trước khi báo.
