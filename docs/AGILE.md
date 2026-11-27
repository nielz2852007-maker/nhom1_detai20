# Quy trình Agile & Git chuẩn nhóm

Tài liệu này là **chuẩn làm việc** cho repository. Board GitHub Projects và lịch sử commit thật cần được tạo trên GitHub bởi các thành viên; phần dưới hướng dẫn cách làm cụ thể.

---

## 1. Kanban board (GitHub Projects)

| Cột | Ý nghĩa | WIP limit |
| --- | --- | --- |
| `Backlog` | Ý tưởng, yêu cầu chưa rõ | – |
| `To Do` | Đã rõ acceptance criteria, sẵn sàng làm | – |
| `In Progress` | Đang code, có owner | 2 |
| `Review` | Đã PR, chờ review | 2 |
| `Done` | Merge vào `main`, đã test | – |

**Cách tạo board:** Repository → tab `Projects` → `New project` → chọn `Board template` → tạo 5 cột như bảng trên. Gắn mỗi issue vào project, thêm label `ui`, `js-dom`, `logic`, `docs`, `agile`.

---

## 2. Sprint plan (2 tuần)

| Sprint | Mục tiêu | Issue mẫu |
| --- | --- | --- |
| Sprint 1 | UI/UX + responsive 3 trang | ` Thiết kế system màu`, ` Responsive menu mobile`, ` Modal & toast` |
| Sprint 2 | JS/DOM + logic | ` Render danh sách bằng map/filter`, ` Tính GPA`, ` Tính học phí`, ` Đặt/hủy lịch` |
| Sprint 3 | Hoàn thiện | ` README`, ` Prompt log`, ` Kiểm tra console`, ` Demo` |

**Daily:** 3 câu – hôm qua làm gì / hôm nay làm gì / vướng gì.  
**Retrospective:** cái giữ lại, cái bỏ, cái cải tiến sprint sau.

---

## 3. Convention Git

### Branch

```text
main                    # luôn chạy được
feature/search-filter   # tính năng mới
fix/booking-double      # sửa lỗi
docs/readme             # tài liệu
refactor/common-utils   # tái cấu trúc
```

### Commit message

```text
<type>: <mô tả ngắn, tiếng Việt, dạng hiện tại>

feat: thêm lọc kỹ năng bằng select
fix: chặn đặt trùng slot khi xác nhận
docs: bổ sung prompt logic GPA
refactor: tách storage helper vào common.js
test: kiểm tra công thức học phí
chore: cập nhật .gitignore
```

### Quy trình PR

1. Tạo branch từ `main`.
2. Commit nhỏ, mỗi commit một ý.
3. Push và mở Pull Request vào `main`.
4. PR phải có: mô tả thay đổi, checklist test, ảnh màn hình nếu đổi UI.
5. Ít nhất 1 thành viên khác review trước khi merge.
6. Sau merge, kéo issue sang `Done` trên board.

---

## 4. Definition of Done (DoD)

- [ ] Chạy được trên Chrome/Edge không lỗi Console.
- [ ] Đúng acceptance criteria của issue.
- [ ] Responsive ở 375px, 768px, 1440px.
- [ ] Có ít nhất một kiểm tra logic (GPA/học phí/đặt lịch).
- [ ] Code được review qua PR.
- [ ] Issue được move sang `Done`.

---

## 5. Gợi ý lệnh khởi tạo (chạy trên máy nhóm)

```bash
git init
git remote add origin https://github.com/nielz2852007-maker/nhom1_detai20.git
git checkout -b feature/mentorconnect-ui
git add .
git commit -m "feat: khởi tạo UI/UX 3 trang MentorConnect"
git push -u origin feature/mentorconnect-ui
```

Sau đó mở PR trên GitHub để các thành viên cùng review. Mỗi thành viên nên commit bằng đúng tài khoản GitHub của mình (`git config user.name`, `git config user.email`) để lịch sử minh chứng sự phối hợp là thật.
