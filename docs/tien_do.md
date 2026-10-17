# THEO DÕI TIẾN ĐỘ THỰC HIỆN DỰ ÁN (TIEN_DO.MD)
## CHƯƠNG 06: AUTHENTICATION & AUTHORIZATION (JWT · MIDDLEWARE · PHÂN QUYỀN)

> **Quy ước trạng thái**:
> * `TODO`: Chưa thực hiện
> * `IN PROCESS`: Đang thực hiện và kiểm thử
> * `DONE`: Đã kiểm thử thành công, commit git, được người dùng approve và push lên GitHub.

---

## 📊 BẢNG TỔNG QUAN TIẾN ĐỘ

| Mã Module | Tên Module | Trạng thái | Số task | Ghi chú & Bằng chứng |
|:---:|---|:---:|:---:|---|
| **M00** | Khởi tạo Tiến độ & Giao diện Test Trực quan | `DONE` | 4 tasks | Giao diện `/client` hoạt động, screenshot: module-0-client.png |
| **M01** | CSDL SQL Server & Sequelize Model User | `DONE` | 3 tasks | Bảng `dbo.Users` đã tạo và xác thực với Sequelize |
| **M02** | Thư viện Bảo mật & JWT Utility | `DONE` | 3 tasks | `bcrypt`, `jsonwebtoken`, `jwt.ts` (HS256, 1h) |
| **M03** | API Đăng ký tài khoản (Register) | `DONE` | 3 tasks | `POST /api/auth/register`, hash cost 12, screenshot: module-3-register.png |
| **M04** | API Đăng nhập & Cấp Access Token | `DONE` | 3 tasks | `POST /api/auth/login`, `bcrypt.compare`, screenshot: module-4-login.png |
| **M05** | Middleware `isAuth` & API Profile | `DONE` | 3 tasks | `isAuth.ts`, `GET /api/auth/profile`, screenshot: module-5-profile.png |
| **M06** | Middleware `isAdmin` & Phân quyền SinhVien | `DONE` | 3 tasks | `isAdmin.ts`, khóa POST/PUT/DELETE, screenshot: module-6-rbac.png |
| **M07** | Tạo tài khoản Admin môi trường Dev | `IN PROCESS` | 2 tasks | `seed-admin.ts`, role admin |
| **M08** | Cập nhật Swagger OpenAPI 3.0 YAML | `TODO` | 3 tasks | `bearerAuth`, response 401/403 |
| **M09** | Kiểm thử Toàn diện 24 Ca Test Postman | `TODO` | 3 tasks | A01–A12, B01–B12 |
| **M10** | Tổng kết, Báo cáo & Trả lời 8 câu hỏi | `TODO` | 3 tasks | `test-results.md`, `prompt-log.md` |

---

## 📝 CHI TIẾT CÁC TASK THEO TỪNG MODULE

### 🔹 Module 0: Khởi tạo Tiến độ & Giao diện Test Trực quan
* [x] **Task 0.1**: Tạo file `docs/tien_do.md` và `docs/quy_trinh_lam_viec.md`.
* [x] **Task 0.2**: Thiết kế giao diện web kiểm thử trực quan tại `public/index.html` và `public/app.js` (Form Register, Login, Token Viewer, Profile, Form CRUD Sinh viên, Visual Log Console).
* [x] **Task 0.3**: Cấu hình Express phục vụ thư mục tĩnh `public/` tại endpoint `http://localhost:5000/client` trong `src/server.ts`.
* [x] **Task 0.4**: Dùng Playwright MCP mở `http://localhost:5000/client`, kiểm tra tải danh sách sinh viên thực tế và chụp ảnh màn hình lưu vào `docs/screenshots/module-0-client.png`.

---

### 🔹 Module 1: CSDL SQL Server & Sequelize Model User
* [x] **Task 1.1**: Viết script `sql/04-users-auth.sql` tạo bảng `dbo.Users` với các ràng buộc an toàn (ID Identity PK, fullName, email UNIQUE, passwordHash, role DEFAULT 'student').
* [x] **Task 1.2**: Chạy script SQL và cấp quyền SELECT, INSERT trên bảng `dbo.Users` cho tài khoản `sv_app`.
* [x] **Task 1.3**: Tạo Model Sequelize `src/models/user.model.ts` (không timestamps, schema `dbo`, table `Users`) và đăng ký trong `src/models/index.ts`. Xác nhận truy vấn `User.count()` thành công.

---

### 🔹 Module 2: Thư viện Bảo mật & JWT Utility
* [x] **Task 2.1**: Cài đặt các gói `bcrypt`, `jsonwebtoken`, `@types/bcrypt`, `@types/jsonwebtoken` bằng pnpm.
* [x] **Task 2.2**: Cấu hình biến `JWT_SECRET` trong `.env` và cập nhật `.env.example`.
* [x] **Task 2.3**: Tạo module `src/utils/jwt.ts` chứa hàm `generateToken` (ký HS256, hạn 1h) và `verifyToken` (xác minh chữ ký, hạn dùng, thuật toán). Chạy test đơn vị thành công (sinh token 3 phần, bắt lỗi sửa token).

---

### 🔹 Module 3: Chức năng Đăng ký tài khoản (Register)
* [x] **Task 3.1**: Định nghĩa schema/validation cho dữ liệu đăng ký (`fullName`, `email`, `password`).
* [x] **Task 3.2**: Viết `src/services/auth.service.ts`: kiểm tra email trùng (409), băm mật khẩu `bcrypt.hash(password, 12)`, gán cứng role `student` (từ chối role từ client).
* [x] **Task 3.3**: Viết `src/controllers/auth.controller.ts` và `src/routes/auth.routes.ts` (`POST /api/auth/register`), trả về 201 Created và thông tin user công khai (không trả passwordHash).

---

### 🔹 Module 4: Chức năng Đăng nhập & Cấp JWT (Login)
* [x] **Task 4.1**: Viết hàm `loginUser` trong `auth.service.ts`: tìm user theo email, so sánh bằng `bcrypt.compare`.
* [x] **Task 4.2**: Nếu sai email hoặc sai mật khẩu, trả lỗi chung 401 Unauthorized (không tiết lộ tài khoản tồn tại hay không).
* [x] **Task 4.3**: Nếu đúng, gọi `generateToken` và trả về `200 OK` kèm `{ accessToken, tokenType: "Bearer", expiresIn: 3600 }`.

---

### 🔹 Module 5: Middleware `isAuth` & API Xem Hồ sơ (Profile)
* [x] **Task 5.1**: Mở rộng khai báo kiểu Request của Express (`src/types/express.d.ts`) chứa `req.user: { id: string; role: string }`.
* [x] **Task 5.2**: Viết middleware `src/middlewares/isAuth.ts` đọc header `Authorization: Bearer <token>`, gọi `verifyToken`, gán `req.user` và gọi `next()` (chặn 401 nếu thiếu/sai/hết hạn).
* [x] **Task 5.3**: Viết endpoint `GET /api/auth/profile` được bảo vệ bởi `isAuth`, trả về thông tin người dùng đang đăng nhập.

---

### 🔹 Module 6: Middleware `isAdmin` & Phân quyền SinhVien
* [x] **Task 6.1**: Viết middleware `src/middlewares/isAdmin.ts` kiểm tra `req.user.role === 'admin'`. Nếu không phải admin trả về `403 Forbidden`.
* [x] **Task 6.2**: Gắn `isAuth, isAdmin` vào 3 Route: `POST /api/v1/sinh-vien`, `PUT /api/v1/sinh-vien/:maSV`, `DELETE /api/v1/sinh-vien/:maSV` trong `src/routes/sinhVien.routes.ts`.
* [x] **Task 6.3**: Giữ nguyên `GET /api/v1/sinh-vien` và `GET /api/v1/sinh-vien/:maSV` ở chế độ Public.

---

### 🔹 Module 7: Tạo Tài khoản Admin Môi trường Dev (Seed Admin)
* [ ] **Task 7.1**: Viết script `src/scripts/seed-admin.ts` kiểm tra tài khoản admin trong CSDL, băm mật khẩu và tạo user với `role: 'admin'`.
* [ ] **Task 7.2**: Thêm lệnh `"seed:admin": "tsx src/scripts/seed-admin.ts"` vào `package.json`, chạy thử nghiệm và xác nhận tài khoản admin tồn tại trong SQL Server.

---

### 🔹 Module 8: Cập nhật Swagger OpenAPI 3.0 YAML
* [ ] **Task 8.1**: Bổ sung `components.securitySchemes.bearerAuth` vào `docs/openapi.yaml`.
* [ ] **Task 8.2**: Khai báo 3 endpoint `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`.
* [ ] **Task 8.3**: Gắn `security: - bearerAuth: []` và mô tả response `401`, `403` cho các endpoint được bảo vệ.

---

### 🔹 Module 9: Kiểm thử Toàn diện 24 Ca Test Postman & Playwright
* [ ] **Task 9.1**: Cập nhật Collection Postman với đầy đủ 24 ca test (Nhóm A: A01–A12, Nhóm B: B01–B12).
* [ ] **Task 9.2**: Chạy kiểm thử tự động toàn diện và ghi lại bảng kết quả vào `docs/test-results.md`.
* [ ] **Task 9.3**: Chụp ảnh minh chứng ít nhất 401, 403, 200, 201, 409 lưu vào `docs/screenshots/`.

---

### 🔹 Module 10: Tổng kết, Báo cáo & Trả lời 8 Câu hỏi Bảo vệ Bài
* [ ] **Task 10.1**: Cập nhật nhật ký Vibe Coding trong `docs/prompt-log.md`.
* [ ] **Task 10.2**: Soạn thảo câu trả lời chi tiết cho 8 câu hỏi bảo vệ bài thực hành (trang 21).
* [ ] **Task 10.3**: Tổng hợp hồ sơ nộp bài hoàn chỉnh theo rubric chấm điểm 10/10 của giáo trình.
