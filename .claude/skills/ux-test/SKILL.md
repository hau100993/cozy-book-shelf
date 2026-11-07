---
name: ux-test
description: Chạy đội thử nghiệm ảo cho Tủ Sách Nhỏ: các nhân vật AI (qa/personas) dùng thử app trong trình duyệt thật, rồi gộp, kiểm chứng và báo cáo lỗi UI/UX. Dùng khi người dùng gõ /ux-test hoặc muốn "test toàn bộ như người dùng".
---
# Đội thử nghiệm ảo (/ux-test)

Tham số tuỳ chọn: tên nhân vật (mặc định: tất cả trong `qa/personas/`).

1. **Chuẩn bị:** `cd qa && npm install` (lần đầu); `node qa/make-fixtures.cjs` nếu `qa/fixtures` trống. Cần Playwright + Chromium: có sẵn trong môi trường cloud của Claude Code; trên máy riêng thì `npm i -g playwright && npx playwright install chromium`.
2. **Thư mục chạy:** `qa/runs/<YYYY-MM-DD-HHmm>/<nhân vật>/` (đã gitignore).
3. **Giao việc song song:** mỗi nhân vật một subagent `ux-tester`, mỗi người một cổng riêng (9301, 9302, …) và máy ghi trong hồ sơ (`lan`: phone, `minh`: tablet, `hoa`: phoneSmall, `duy`: pc). Prompt: tên nhân vật, máy, cổng, thư mục kết quả.
4. **Gộp và kiểm chứng:** đọc mọi `findings.json`; gộp các phát hiện trùng nhau; với mỗi phát hiện mức cao trở lên, **tự tái hiện lại** bằng `qa/browser.cjs` + `qa/act.cjs` theo đúng `steps`. Không tái hiện được thì hạ xuống "chưa xác nhận". Đánh dấu cái nào đã biết / cố ý (xem CLAUDE.md).
5. **Báo cáo:** một trang (Artifact) gồm:
   - tóm tắt;
   - bảng phát hiện đã xác nhận (mức, nơi, bước, ảnh, lời nhân vật);
   - phát hiện chưa xác nhận;
   - cảm nhận của từng nhân vật;
   - nhiệm vụ thất bại;
   - đề xuất sửa theo thứ tự ưu tiên.

   Chỉ sửa code khi người dùng đồng ý.
6. Lỗi đã sửa thì thêm thành bài kiểm tra lặp lại được, hoặc thêm vào nhiệm vụ của nhân vật, để không quay lại.
