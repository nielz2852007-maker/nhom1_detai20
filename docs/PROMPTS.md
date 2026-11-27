# Vibe Coding – Minh chứng điều khiển AI bằng prompt logic

Mục tiêu: chứng minh nhóm **điều khiển** AI bằng ràng buộc cụ thể (input, output, edge case, cách kiểm chứng), thay vì chỉ yêu cầu "viết code giúp".

---

## Prompt 1 – Tách module và thứ tự nạp

**Mục tiêu:** Tránh lỗi `undefined` do script chạy trước khi dữ liệu tồn tại.

**Prompt_used:**

> Hãy thiết kế 5 file JS thuần cho 3 trang HTML có sẵn. Ràng buộc: (1) dùng chung namespace `window.MentorConnect`; (2) `data.js` chỉ chứa dữ liệu, không render DOM; (3) `common.js` chỉ chứa hàm dùng lại, không gọi render của trang cụ thể; (4) mỗi trang chỉ được init khi phần tử đích tồn tại; (5) nếu module trước không tồn tại thì `return` ngay. Hãy kèm thứ tự nạp script trong HTML và giải thích vì sao.

**Kết quả:** `data.js → common.js → page.js`, có guard `if (!NS || !NS.data || !NS.utils) return;`.

**Kiểm chứng:** Mở từng page riêng lẻ → Console không có `Cannot read properties of undefined`.

---

## Prompt 2 – GPA chính xác tuyệt đối

**Mục tiêu:** Không làm tròn sai, không tính môn thiếu điểm vào mẫu số.

**Prompt_used:**

> Viết hàm `calculateGPA(courses)` với công thức tổng(tín chỉ × điểm)/tổng tín chỉ. Yêu cầu: điểm chữ map qua bảng A+=4.0 ... F=0; chấp nhận điểm số trong [0,4]; bỏ qua môn có tín chỉ <= 0 hoặc điểm không hợp lệ; nếu không còn môn hợp lệ trả 0; làm tròn đúng 2 chữ số. Hãy tự tạo 4 test case gồm: điểm chữ hỗn hợp, điểm số, môn invalid, mảng rỗng.

**Kết quả:** Dùng `map → filter → reduce`; case mẫu `A, A, B+, A-` với `3,3,2,3` tín chỉ ra `3.79`.

**Kiểm chứng:**

```js
MentorConnect.utils.calculateGPA([
  { credits: 3, grade: 'A' }, { credits: 3, grade: 'A' },
  { credits: 2, grade: 'B+' }, { credits: 3, grade: 'A-' }
]); // 3.79
```

---

## Prompt 3 – Học phí và các case biên

**Mục tiêu:** Chống số âm, giảm giá > 100%, lỗi làm tròn tiền tệ.

**Prompt_used:**

> Viết `calculateTuition({hours, hourlyRate, discountPercent, platformFee})`. Ràng buộc: mọi số âm thành 0; discount kẹp trong [0,100]; công thức hours*rate*(1-discount/100)+fee; kết quả `Math.round` đến VND. Hãy chứng minh bằng 3 ví dụ: giảm 10%, giảm 150% (phải kẹp 100%), giờ = -1 (phải ra phí nền tảng).

**Kết quả:** Hàm trong `common.js`, khớp seed `1h × 250k × 0.9 = 225.000đ` và `2h × 300k × 0.85 = 510.000đ`.

**Kiểm chứng:** Xem học phí hiển thị ở `index2.html` và tổng tiền ở `index3.html`.

---

## Prompt 4 – Event delegation cho danh sách render lại

**Mục tiêu:** Không bị mất sự kiện sau mỗi lần lọc.

**Prompt_used:**

> Danh sách cố vấn được render lại bằng innerHTML mỗi lần gõ tìm kiếm. Hãy thiết kế helper `delegate(root, type, selector, handler)` để listener chỉ gắn 1 lần trên container, dùng `closest()` và `root.contains()`. Giải thích tại sao không gắn listener trực tiếp từng button.

**Kết quả:** `utils.delegate` dùng chung cho 4 trang; search dùng thêm `debounce(200)`.

**Kiểm chứng:** Gõ tìm kiếm nhiều lần → bấm “Xem hồ sơ” vẫn chuyển đúng `?id=`.

---

## Prompt 5 – Tranh chấp slot khi đặt lịch

**Mục tiêu:** Tránh đặt trùng 1 khung giờ từ 2 tab.

**Prompt_used:**

> Khi người dùng bấm xác nhận đặt lịch, hãy kiểm tra lại localStorage ngay tại thời điểm chốt, không tin vào trạng thái button trên UI. Nếu slot đã tồn tại với status khác 'cancelled', đóng modal, toast lỗi và reload để render lại lịch. Nếu hợp lệ, lưu appointment rồi chuyển trang sau 900ms.

**Kết quả:** Logic trong `profile.js` dùng `utils.isSlotBooked(slot.id)` ở cả lúc render và lúc confirm.

**Kiểm chứng:** Mở 2 tab cùng slot → tab đặt sau nhận toast lỗi.

---

## Prompt 6 – Chống XSS khi chèn HTML động

**Mục tiêu:** Dữ liệu localStorage/URL không được thực thi thành HTML.

**Prompt_used:**

> Mọi giá trị lấy từ URL query và localStorage trước khi đưa vào template string innerHTML phải qua hàm escapeHtml mapping & < > " '. Với nội dung chỉ là text (thông báo, tên cố vấn trong confirmText) hãy dùng textContent. Hãy chỉ ra các vị trí cần áp dụng trong 3 trang.

**Kết quả:** `escapeHtml` được dùng cho id/name/tag/ngày; `textContent` dùng cho `confirmText`, toast, tên/avatar/bio.

**Kiểm chứng:** Thêm thủ công appointment có `mentorName = "<img src=x onerror=alert(1)>"` vào localStorage → trang lịch hiển thị text, không alert.

---

## Nguyên tắc chung khi dùng AI trong nhóm

1. **Prompt có ràng buộc:** input, output, edge case, tiêu chí kiểm chứng.
2. **AI gợi ý – con người duyệt:** đọc lại từng hàm logic trước khi commit.
3. **Kiểm chứng bằng hành vi:** tự chạy ít nhất 1 case success + 1 case fail cho mỗi prompt.
4. **Ghi lại prompt:** cập nhật file này khi phát sinh prompt mới xử lý logic khó.
