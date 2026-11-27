# MentorConnect

Cổng kết nối **Cố vấn & Học nhóm** – dự án web tĩnh (HTML/CSS/JavaScript thuần) giúp người học tìm cố vấn theo kỹ năng, xem lịch rảnh, đặt lịch và quản lý các buổi trao đổi.

> Phù hợp để chạy trực tiếp bằng trình duyệt, không cần build tool hay dependency.

---

## 1. Tính năng chính

| Trang | File | Chức năng |
| --- | --- | --- |
| Trang chủ | `index.html` | Tìm kiếm theo tên/chuyên môn/từ khóa, lọc theo kỹ năng, render danh sách cố vấn bằng `map()` |
| Hồ sơ cố vấn | `index2.html` | Thông tin cố vấn, GPA, học phí, lịch rảnh, đánh giá, modal xác nhận đặt lịch |
| Lịch hẹn | `index3.html` | Thống kê, lọc trạng thái, hủy lịch có hộp thoại xác nhận |

**Điểm nổi bật**

- Giao diện sáng, bo góc, gradient, shadow, micro-interaction; responsive từ 320px trở lên.
- Menu mobile toggle, toast thông báo, modal bấm nền/Esc để đóng.
- Dữ liệu lưu trong `localStorage`, có seed mẫu và xử lý an toàn khi trình duyệt chặn storage.
- Mọi nội dung từ localStorage/URL đều được escape trước khi chèn vào DOM.
- Không dùng thư viện ngoài → không có lỗi dependency, dễ kiểm tra console.

---

## 2. Cấu trúc thư mục

```text
.
├── index.html               # Trang chủ
├── index2.html              # Hồ sơ cố vấn
├── index3.html              # Lịch hẹn
├── css/
│   ├── styles.css           # Reset, biến màu, header/footer, card, btn, avatar, modal, toast
│   ├── home.css             # Banner, thanh tìm kiếm, lưới thẻ cố vấn
│   ├── profile.css          # Profile head, slot, đánh giá, stats
│   └── appointments.css     # Bộ lọc, danh sách lịch hẹn, trạng thái
├── js/
│   ├── data.js              # Tầng dữ liệu: mentors, kỹ năng, thang điểm, seed appointments
│   ├── common.js            # Logic GPA/học phí, storage, format, delegate, toast, dialog
│   ├── main.js              # Trang chủ: lọc + render danh sách
│   ├── profile.js           # Trang hồ sơ: chọn slot + đặt lịch
│   └── appointments.js      # Trang lịch hẹn: lọc + hủy lịch
└── docs/
    ├── PROMPTS.md           # Minh chứng điều khiển AI bằng prompt logic
    └── AGILE.md             # Quy trình Kanban, convention commit, checklist
```

### Thứ tự nạp script (bắt buộc)

```html
<script src="js/data.js"></script>       <!-- 1. Dữ liệu -->
<script src="js/common.js"></script>     <!-- 2. Tiện ích + logic dùng chung -->
<script src="js/main.js"></script>       <!-- 3. Page-specific -->
```

Cả 3 module dùng chung namespace `window.MentorConnect`, tránh ô nhiễm global scope.

---

## 3. Chạy dự án

**Cách nhanh:** mở `index.html` bằng trình duyệt.

**Cách khuyến nghị** (tránh giới hạn `file://` của localStorage trên một số trình duyệt):

```bash
cd D:\thithierkeweb
python -m http.server 8080
```

Sau đó truy cập `http://localhost:8080/index.html`.

---

## 4. Logic nghiệp vụ

### 4.1. GPA (`utils.calculateGPA`)

```text
GPA = Σ(tín chỉ × điểm thang 4.0) / Σ(tín chỉ)
```

- Điểm chữ được map qua bảng `GRADE_POINTS` (`A+`/`A` = 4.0, `A-` = 3.7, ... `F` = 0).
- Môn có tín chỉ không hợp lệ (≤ 0, `NaN`) hoặc điểm không hợp lệ bị **loại khỏi cả tử và mẫu**.
- Kết quả làm tròn 2 chữ số; trường hợp rỗng trả về `0`.

### 4.2. Học phí (`utils.calculateTuition`)

```text
học phí = giờ × đơn giá × (1 - giảm giá%) + phí nền tảng
```

- `giảm giá` bị kẹp trong đoạn `[0, 100]`, các số âm được đưa về `0`.
- Kết quả `Math.round` đến đồng VND (không lẻ cents).
- Ví dụ kiểm chứng: `1h × 250.000 × (1 - 10%) = 225.000đ`.

### 4.3. Đặt lịch

- Slot đã được đặt (`status !== 'cancelled'`) bị vô hiệu hóa.
- Trước khi lưu, kiểm tra lại điều kiện tranh chấp; nếu slot vừa bị chiếm, hướng dẫn người dùng chọn slot khác.
- Mỗi lịch hẹn lưu: `id, mentorId, mentorName, slotId, start, durationHours, tuition, status, createdAt`.

---

## 5. Kỹ thuật JS/DOM

| Kỹ thuật | Vị trí áp dụng |
| --- | --- |
| `map()` | Tạo option kỹ năng, thẻ cố vấn, tag, slot, review, lịch hẹn |
| `filter()` | Tìm kiếm + lọc kỹ năng, lọc trạng thái lịch hẹn, lọc môn hợp lệ khi tính GPA |
| `reduce()` | Tính tổng điểm có trọng số GPA, tổng học phí sắp tới |
| Event delegation | Nút trong danh sách được render lại nhưng vẫn giữ listener |
| `debounce()` | Giảm số lần render khi gõ tìm kiếm (200ms) |
| `localStorage` wrapper | `try/catch` cho chế độ riêng tư; seed dữ liệu khi chưa có |
| `escapeHtml()` | Chặn XSS khi chèn dữ liệu động bằng `innerHTML` |
| `URLSearchParams` | Đọc `?id=` để mở đúng hồ sơ cố vấn |
| `Promise` | Hộp thoại xác nhận hủy lịch (`confirmDialog`) |

**Không có lỗi console:** mọi truy vấn DOM đều có guard, script được nạp sau `body`, khởi tạo qua `utils.ready()`, và không gọi API không tồn tại.

---

## 6. UI/UX & Responsive

- Breakpoint `720px`: menu chuyển sang dạng toggle, nav xếp dọc, card giảm padding.
- Breakpoint `600px`: form tìm kiếm xếp dọc, lưới cố vấn 1 cột, lịch hẹn xếp dọc.
- Trạng thái tương tác: `hover`, `focus-within`, `active`, `disabled`, toast success/error.
- Hỗ trợ bàn phím: `Esc` đóng modal, nút xác nhận được `focus()` khi mở modal.

---

## 7. Agile / Git

Chi tiết tại [`docs/AGILE.md`](docs/AGILE.md). Tóm tắt:

- **Kanban:** `Backlog → To Do → In Progress → Review → Done`.
- **Branch:** `feature/ten-chuc-nang`, `fix/loi-xxx`, `docs/cap-nhat-readme`.
- **Commit:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- **Sprint:** 2 tuần, có sprint goal, daily ngắn, demo + retrospective cuối sprint.

> Lịch sử commit và GitHub Projects là dữ liệu thật trên repository của nhóm. Hãy tạo board và đẩy commit từ máy của từng thành viên để minh chứng sự phối hợp; file hướng dẫn ở trên chỉ chuẩn hóa cách làm, không thay thế lịch sử thật.

---

## 8. Vibe Coding / AI

Minh chứng tư duy điều khiển AI tại [`docs/PROMPTS.md`](docs/PROMPTS.md): mỗi prompt đều kèm **ràng buộc đầu vào – đầu ra – cách kiểm chứng**, không phải lệnh chung chung kiểu “viết giúp tôi web”.

---

## 9. Checklist nghiệm thu

- [ ] Mở 3 trang, không có lỗi trong tab Console.
- [ ] Tìm kiếm + lọc kỹ năng trả đúng số cố vấn.
- [ ] Chọn slot → học phí cập nhật đúng công thức.
- [ ] Đặt lịch → xuất hiện trong `index3.html` sau khi reload.
- [ ] Hủy lịch → trạng thái chuyển thành “Đã hủy”, tổng học phí cập nhật lại.
- [ ] Resize xuống 375px: menu, thẻ, lịch hẹn đều hiển thị tốt.
