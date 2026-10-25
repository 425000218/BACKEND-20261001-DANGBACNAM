# KẾ HOẠCH & THEO DÕI TIẾN ĐỘ THỰC HIỆN DỰ ÁN (TIEN_DO.MD)
## CHƯƠNG 07: UPLOAD HÌNH ẢNH & KẾT NỐI FRONTEND – BACKEND
### (Multer · Vite · React · Axios · CORS · JWT RBAC)

> [!IMPORTANT]
> **QUY ƯỚC TRẠNG THÁI TASK**:
> * `TODO`: Chưa thực hiện.
> * `IN PROCESS`: Đang thực hiện và kiểm thử.
> * `DONE`: Đã kiểm thử thành công, có bằng chứng xác minh (SSMS, Network, Postman, UI), commit git và hoàn thành.

---

## 📊 BẢNG TỔNG QUAN TIẾN ĐỘ THEO MODULE

| Mã Module | Tên Module / Phân hệ | Số Task | Trạng thái | Đầu ra & Minh chứng bắt buộc |
|:---:|---|:---:|:---:|---|
| **M00** | Khảo sát Dự án & Chốt Trạng thái Ban đầu (Bước 0) | 5 tasks | `DONE` | Báo cáo kiểm tra `pnpm build`, backup git, xác nhận API Chương 06 |
| **M01** | CSDL SQL Server & Cập nhật User Model (Bước 1) | 4 tasks | `DONE` | `sql/05-add-avatar-url.sql`, SSMS kiểm tra cột `avatarUrl`, User Model |
| **M02** | Cấu hình Multer & Kiểm soát An toàn File (Bước 2) | 5 tasks | `DONE` | `upload.middleware.ts`, magic bytes check, dọn file lỗi, bắt mã 413 |
| **M03** | Route, Controller & Service Upload Avatar (Bước 3) | 5 tasks | `DONE` | `POST /api/auth/me/avatar`, cập nhật đúng User từ JWT, static `/uploads` |
| **M04** | Kiểm thử Postman API Upload: 12 Ca U01–U12 (Bước 4) | 4 tasks | `DONE` | 3 lớp bằng chứng (Postman, Đĩa, SSMS), ma trận 12 ca test upload ĐẠT 100% |
| **M05** | Cập nhật Swagger OpenAPI 3.0 YAML (Bước 5) | 5 tasks | `DONE` | `docs/openapi.yaml` multipart binary + Bearer, Try It Out trên Swagger |
| **M06** | Khởi tạo Frontend React Vite & Thiết lập CORS (Bước 6) | 5 tasks | `DONE` | Thư mục `frontend/`, Axios client, CORS allowlist đúng Origin 5173 |
| **M07** | Giao diện Hiển thị Danh sách Sinh viên (Bước 7) | 4 tasks | `DONE` | Component `SinhVienTable`, 4 cột, Loading, Empty state, Error + Retry |
| **M08** | Giao diện Đăng nhập & Quản lý Token JWT (Bước 8) | 5 tasks | `DONE` | Component `LoginForm`, token in memory, `GET /api/auth/profile`, phân biệt 401 |
| **M09** | Tích hợp Nút Xóa Sinh viên với Phân quyền Admin (Bước 9) | 4 tasks | `DONE` | Nút Xóa chỉ hiện với Admin, confirm popup, gọi `DELETE`, refresh bảng |
| **M10** | Giao diện Upload Avatar Trực tiếp trên React (Bước 10) | 5 tasks | `DONE` | Component `AvatarUpload`, FormData, preview ảnh, reload Profile |
| **M11** | Kiểm thử Toàn diện Frontend: 12 Ca F01–F12 & Hồi quy | 3 tasks | `DONE` | Ma trận F01–F12 trên trình duyệt, kiểm thử hồi quy 24 ca C06 ĐẠT 100% |
| **M12** | Security Review, Trả lời 12 Câu hỏi & Hồ sơ Nộp bài | 5 tasks | `DONE` | Phản biện code AI 7 lỗ hổng, 12 câu hỏi bảo vệ bài, `prompt-log.md` hoàn thiện |

---

## 📝 CHI TIẾT CÁC TASK THEO TỪNG MODULE

### 🔹 Module 00: Khảo sát Dự án & Chốt Trạng thái Ban đầu (Bước 0)
*Mục tiêu: Đảm bảo nền tảng Chương 06 đang hoạt động hoàn hảo trước khi thêm tính năng mới.*
* [x] **Task 0.1**: Kiểm tra phiên bản môi trường (`node -v` v24.18.1, `pnpm -v` 10.34.6), cài đặt dependencies `pnpm install`, chạy lệnh `pnpm build` kiểm tra trạng thái TypeScript (tsc hoàn tất sạch sẽ không lỗi).
* [x] **Task 0.2**: Khởi động backend `pnpm dev`, mở `/api-docs` kiểm tra Swagger UI (200 OK) và gọi `GET /api/v1/sinh-vien` đảm bảo trả về HTTP 200 kèm mảng dữ liệu thật.
* [x] **Task 0.3**: Kiểm thử luồng Auth hiện tại: Chạy toàn bộ bộ kiểm thử 24 ca tự động của Chương 06 (`pnpm test:24`) đạt **24/24 PASS (100%)** (Login Student, Profile JWT, Admin Delete RBAC).
* [x] **Task 0.4**: Mở SSMS / truy vấn CSDL đối chiếu cấu trúc bảng `dbo.Users` (xác nhận 5 cột: `id`, `fullName`, `email`, `passwordHash`, `role` và xác nhận cột `avatarUrl` chưa tồn tại).
* [x] **Task 0.5**: Thực hiện commit / sao lưu phiên bản Chương 06 hoạt động ổn định trên Git làm mốc phục hồi an toàn (checkpoint).

---

### 🔹 Module 01: CSDL SQL Server & Cập nhật User Model (Bước 1)
*Mục tiêu: Thêm cột lưu trữ đường dẫn ảnh đại diện `avatarUrl` cho tài khoản người dùng một cách an toàn, không làm mất dữ liệu cũ.*
* [x] **Task 1.1**: Viết script `sql/05-add-avatar-url.sql` bổ sung cột `avatarUrl NVARCHAR(255) NULL` vào bảng `dbo.Users` với kiểm tra điều kiện an toàn (`IF COL_LENGTH('dbo.Users', 'avatarUrl') IS NULL`).
* [x] **Task 1.2**: Chạy script trong SQL Server, chạy thử lại lần 2 để chứng minh script có tính lũy kế (idempotent), không gây lỗi trùng cột và bảo toàn toàn bộ bản ghi người dùng cũ.
* [x] **Task 1.3**: Cập nhật Sequelize Model `src/models/user.model.ts` khai báo ánh xạ thuộc tính `avatarUrl` (kiểu chuỗi, cho phép `null`), không kích hoạt `sync({ force: true })` hay `sync({ alter: true })`.
* [x] **Task 1.4**: Chạy `pnpm build` để kiểm chứng mã TypeScript biên dịch hoàn toàn thành công sau khi cập nhật Model.

---

### 🔹 Module 02: Cấu hình Multer & Kiểm soát An toàn File (Bước 2)
*Mục tiêu: Xây dựng middleware nhận file upload multipart/form-data an toàn, chặn đứng file độc hại và giới hạn kích thước ≤ 2MB.*
* [x] **Task 2.1**: Cài đặt thư viện `multer` và gói type `@types/multer` bằng `pnpm add multer` và `pnpm add -D @types/multer`.
* [x] **Task 2.2**: Tạo module middleware `src/middlewares/upload.middleware.ts`: cấu hình `multer.diskStorage` lưu file vào thư mục `public/uploads/`, sinh tên file an toàn bằng UUID ngẫu nhiên (`randomUUID`), tuyệt đối không dùng nguyên tên gốc từ client.
* [x] **Task 2.3**: Thiết lập giới hạn kích thước file `limits: { fileSize: 2 * 1024 * 1024 }` (chính xác 2.097.152 bytes) và `fileFilter` kiểm tra đuôi mở rộng sơ bộ (`.jpg`, `.jpeg`, `.png`).
* [x] **Task 2.4**: Bổ sung cơ chế kiểm tra nội dung thực tế (magic bytes / file signature nhị phân của PNG và JPEG), tự động dọn dẹp (xóa ngay lập tức) file rác trên ổ đĩa nếu phát hiện tệp sai quy cách hoặc giả mạo extension.
* [x] **Task 2.5**: Cập nhật bộ xử lý lỗi `src/middlewares/error.middleware.ts` để bắt lỗi `MulterError: LIMIT_FILE_SIZE` và trả về đúng mã trạng thái HTTP 413 theo quy ước bài lab (không trả lỗi 500 chung chung).

---

### 🔹 Module 03: Route, Controller & Service Upload Avatar (Bước 3)
*Mục tiêu: Hiện thực hóa endpoint `/api/auth/me/avatar` được bảo vệ bởi JWT, cập nhật đường dẫn ảnh của chính chủ.*
* [x] **Task 3.1**: Viết hàm xử lý cập nhật trong `src/services/auth.service.ts`: nhận `userId` từ JWT và tên file hợp lệ, cập nhật `avatarUrl = "/uploads/<filename>"` vào DB; nếu cập nhật DB thất bại, thực hiện xóa file ảnh vừa upload để tránh tệp mồ côi.
* [x] **Task 3.2**: Viết controller `uploadAvatar` trong `src/controllers/auth.controller.ts`: kiểm tra sự tồn tại của `req.file` (trả 400 nếu thiếu file), lấy `userId` từ `req.user.id` (tuyệt đối không nhận `userId` từ `req.body`), trả response chuẩn `{ success: true, message: "...", data: { avatarUrl } }`.
* [x] **Task 3.3**: Đăng ký route trong `src/routes/auth.routes.ts`: `POST /me/avatar` áp dụng tuần tự middleware `isAuth` -> `uploadAvatarMiddleware` -> `uploadAvatar`.
* [x] **Task 3.4**: Cấu hình phục vụ file tĩnh trong file khởi động server (`src/server.ts`): `app.use("/uploads", express.static("public/uploads"))`, đảm bảo chỉ public đúng thư mục ảnh.
* [x] **Task 3.5**: Cập nhật endpoint `GET /api/auth/profile` để trả về thêm trường `avatarUrl` cho tài khoản đang đăng nhập (vẫn bảo mật không trả `passwordHash`).

---

### 🔹 Module 04: Kiểm thử Postman API Upload: 12 Ca U01–U12 (Bước 4)
*Mục tiêu: Đạt 100% các tiêu chí kiểm thử trên Postman với 3 lớp bằng chứng trước khi chuyển sang làm Frontend.*
* [x] **Task 4.1**: Thiết lập request trên Postman: `POST {{baseUrl}}/api/auth/me/avatar`, Authorization `Bearer {{studentToken}}`, Body `form-data` với key `avatar` (chọn kiểu File).
* [x] **Task 4.2**: Xác minh 3 lớp bằng chứng cho ca upload thành công: (1) Postman nhận 200 OK kèm `data.avatarUrl`, (2) Ổ đĩa `public/uploads` xuất hiện file mới, (3) Truy vấn SSMS thấy `avatarUrl` đã cập nhật và mở xem được trên trình duyệt qua `http://localhost:5000/uploads/<tên file>`.
* [x] **Task 4.3**: Thực hiện kiểm thử toàn bộ ma trận 12 ca upload (U01 đến U12):
  * **U01**: Avatar PNG hợp lệ + Student JWT -> 200.
  * **U02**: Avatar JPEG hợp lệ + Student JWT -> 200.
  * **U03**: Không có Authorization header -> 401, không sinh file, không update DB.
  * **U04**: JWT sai hoặc hết hạn -> 401.
  * **U05**: Body thiếu file -> 400.
  * **U06**: Tên field là photo thay vì avatar -> 400.
  * **U07**: Kích thước file > 2MB -> 413 LIMIT_FILE_SIZE, không để lại file rác.
  * **U08**: File TXT đổi đuôi thành avatar.png -> 400 (kiểm tra nội dung thực).
  * **U09**: Đuôi .gif / sai MIME -> 400.
  * **U10**: Upload liên tiếp 2 lần cùng tài khoản -> 200, cập nhật URL mới.
  * **U11**: Student A gửi `userId` của Student B trong body -> 200 (chỉ sửa avatar A, avatar B bất biến).
  * **U12**: Khởi động lại Backend server rồi gọi `GET /api/auth/profile` -> 200, URL avatar vẫn nguyên vẹn.
* [x] **Task 4.4**: Ghi chép trung thực toàn bộ kết quả kiểm thử vào bảng kết quả tại `docs/test-results.md`.

---

### 🔹 Module 05: Cập nhật Swagger OpenAPI 3.0 YAML (Bước 5)
*Mục tiêu: Tài liệu hóa chuẩn mực API upload file multipart và cấu hình phục vụ ảnh tĩnh trong hệ thống.*
* [x] **Task 5.1**: Cập nhật file `docs/openapi.yaml`, bổ sung route `/api/auth/me/avatar` dưới tag `Auth`.
* [x] **Task 5.2**: Định nghĩa `requestBody` chuẩn OpenAPI 3.0 cho multipart: `content: multipart/form-data` với schema có trường `avatar` mang `type: string, format: binary`.
* [x] **Task 5.3**: Thiết lập bảo mật `security: - bearerAuth: []` và mô tả đầy đủ các phản hồi: 200, 400, 401, 413, 500.
* [x] **Task 5.4**: Bổ sung thuộc tính `avatarUrl` trong schema response của `GET /api/auth/profile` và schema `UserDTO`.
* [x] **Task 5.5**: Mở giao diện Swagger UI `/api-docs` trên trình duyệt, thực hiện "Try it out" upload ảnh bằng JWT và kiểm tra phản hồi thành công.

---

### 🔹 Module 06: Khởi tạo Frontend React Vite & Thiết lập CORS (Bước 6)
*Mục tiêu: Thiết lập dự án Frontend độc lập bằng React + TypeScript và kết nối an toàn với Backend qua CORS allowlist.*
* [x] **Task 6.1**: Khởi tạo project React + TypeScript trong thư mục `frontend/` bằng lệnh `pnpm create vite frontend --template react-ts`.
* [x] **Task 6.2**: Cài đặt thư viện `axios` vào thư mục `frontend/` (`pnpm add axios`).
* [x] **Task 6.3**: Tạo file `frontend/.env.example` và `frontend/.env` khai báo biến môi trường công khai `VITE_API_BASE_URL=http://localhost:5000`.
* [x] **Task 6.4**: Tạo module gọi API `frontend/src/api/client.ts` khởi tạo instance Axios với `baseURL` từ biến môi trường.
* [x] **Task 6.5**: Phía Backend: cài đặt `cors`, cấu hình middleware `app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }))` chỉ cho phép đúng Origin của Vite, cấu hình Helmet `crossOriginResourcePolicy: { policy: 'cross-origin' }`.

---

### 🔹 Module 07: Giao diện Hiển thị Danh sách Sinh viên (Bước 7)
*Mục tiêu: Xây dựng bảng hiển thị dữ liệu sinh viên gọi API thật từ Backend, xử lý mượt mà mọi trạng thái giao diện.*
* [x] **Task 7.1**: Định nghĩa Interface TypeScript `ISinhVien` (`maSV`, `hoTen`, `email`, `maLop`) và kiểu dữ liệu response API.
* [x] **Task 7.2**: Tạo component `frontend/src/components/SinhVienTable.tsx` sử dụng Axios client gọi `GET /api/v1/sinh-vien` khi load trang.
* [x] **Task 7.3**: Đọc đúng cấu trúc dữ liệu `response.data.data` và render bảng danh sách gồm 4 cột (`maSV`, `hoTen`, `email`, `maLop`).
* [x] **Task 7.4**: Xử lý đầy đủ các trạng thái người dùng:
  * Trạng thái đang tải (Loading indicator).
  * Trạng thái rỗng (Empty state) khi backend trả mảng trống kèm lời nhắc rõ ràng.
  * Trạng thái lỗi (Error alert) khi Backend tắt hoặc lỗi mạng, kèm nút "Thử lại" (Retry).

---

### 🔹 Module 08: Giao diện Đăng nhập & Quản lý Token JWT (Bước 8)
*Mục tiêu: Đăng nhập an toàn qua giao diện, lưu trữ token trong bộ nhớ ứng dụng và hiển thị thông tin Profile.*
* [x] **Task 8.1**: Tạo component `frontend/src/components/LoginForm.tsx` gồm ô nhập Email, Mật khẩu, nút Đăng nhập và khu vực thông báo trạng thái.
* [x] **Task 8.2**: Gọi `POST /api/auth/login`, nhận JWT token và lưu vào React state trong bộ nhớ (In-memory token, giải thích rủi ro nếu lưu localStorage).
* [x] **Task 8.3**: Tự động gọi `GET /api/auth/profile` với header `Authorization: Bearer <token>` để hiển thị thông tin người dùng (`fullName`, `role`, `avatarUrl`).
* [x] **Task 8.4**: Xây dựng nút Đăng xuất (Logout) xóa sạch token khỏi bộ nhớ và khôi phục giao diện về trạng thái chưa xác thực.
* [x] **Task 8.5**: Xử lý phản hồi lỗi rõ ràng: phân biệt lỗi 401 (sai mật khẩu / token hết hạn yêu cầu đăng nhập lại) với lỗi CORS / Network Error.

---

### 🔹 Module 09: Tích hợp Nút Xóa Sinh viên với Phân quyền Admin (Bước 9)
*Mục tiêu: Phân quyền giao diện theo Role, kích hoạt chức năng xóa bản ghi chỉ dành cho Admin và bảo vệ 2 lớp.*
* [x] **Task 9.1**: Cập nhật `SinhVienTable.tsx` để render nút "Xóa" ở từng dòng chỉ khi người dùng đã đăng nhập và có `profile.role === 'admin'` (ẩn hoàn toàn với tài khoản Student).
* [x] **Task 9.2**: Thêm hộp thoại xác nhận (Confirm modal/dialog) hiển thị chính xác mã sinh viên sắp xóa trước khi gửi request.
* [x] **Task 9.3**: Gửi request `DELETE /api/v1/sinh-vien/:maSV` qua Axios kèm Bearer JWT.
* [x] **Task 9.4**: Xử lý phản hồi: khi nhận HTTP 200 thông báo thành công và tự động reload lại bảng danh sách sinh viên; hiển thị thông báo lỗi phù hợp khi nhận 401, 403 hoặc 404 mà không tự ý xóa dòng khỏi UI khi server thất bại.

---

### 🔹 Module 10: Giao diện Upload Avatar Trực tiếp trên React (Bước 10)
*Mục tiêu: Kết nối toàn diện luồng người dùng: Chọn ảnh -> Kiểm tra 2MB -> Gửi FormData + JWT -> Cập nhật hiển thị ảnh mới.*
* [x] **Task 10.1**: Tạo component `frontend/src/components/AvatarUpload.tsx` với thẻ `<input type="file" accept="image/png,image/jpeg" />`.
* [x] **Task 10.2**: Thêm kiểm tra kích thước file ngay tại Frontend (cảnh báo nếu file vượt quá 2MB trước khi gửi).
* [x] **Task 10.3**: Đóng gói file vào đối tượng `FormData` với `formData.append("avatar", file)`, gửi request `POST /api/auth/me/avatar` có header Bearer JWT, để trình duyệt tự động đính kèm `multipart/form-data` và boundary.
* [x] **Task 10.4**: Quản lý trạng thái upload: Đang tải (uploading spinner/progress), thông báo kết quả thành công / thất bại.
* [x] **Task 10.5**: Sau khi upload thành công (HTTP 200), tự động gọi lại API Profile để lấy `avatarUrl` mới nhất từ SQL Server và render ảnh đại diện qua URL `${VITE_API_BASE_URL}${avatarUrl}`.

---

### 🔹 Module 11: Kiểm thử Toàn diện Frontend: 12 Ca F01–F12 & Hồi quy
*Mục tiêu: Kiểm thử end-to-end trên trình duyệt thật (Chrome/Edge) và đảm bảo các tính năng cũ không bị ảnh hưởng.*
* [x] **Task 11.1**: Thực hiện kiểm tra 12 ca kiểm thử giao diện Frontend (F01 đến F12) qua DevTools:
  * **F01**: Vite chạy, Backend bật -> Trang mở bình thường, Network gọi GET thành công.
  * **F02**: GET danh sách có dữ liệu -> Render bảng 4 cột đúng dữ liệu SQL Server.
  * **F03**: Backend trả mảng rỗng -> Hiển thị Empty state, không crash app.
  * **F04**: Backend tắt khi gọi GET -> Hiển thị thông báo Error, không treo loading vô hạn.
  * **F05**: Bật lại Backend, bấm "Thử lại" -> Bảng tải lại thành công (200).
  * **F06**: Đăng nhập tài khoản Student hợp lệ -> 200, hiển thị Profile Student chính xác từ JWT.
  * **F07**: Đăng nhập sai mật khẩu -> 401, hiển thị thông báo lỗi, không lưu token giả.
  * **F08**: Gọi Profile khi thiếu token -> 401, yêu cầu đăng nhập lại, không lộ thông tin.
  * **F09**: Student tìm cách gọi API DELETE qua Network/DevTools -> 403 Forbidden, dữ liệu SQL không đổi.
  * **F10**: Admin bấm nút Xóa bản ghi test -> 200 OK, bảng tự reload loại bỏ sinh viên đã xóa.
  * **F11**: Upload ảnh đại diện hợp lệ từ giao diện React -> 200, ảnh hiển thị ngay trên UI, DB có URL mới.
  * **F12**: Gọi API từ một Origin lạ không nằm trong allowlist -> Trình duyệt chặn CORS.
* [x] **Task 11.2**: Chạy kiểm thử hồi quy cho các ca API cốt lõi của Chương 06 (`A08/A10`, `B01`, `B04`, `B09`, Zod validation) đạt 24/24 PASS (100%).
* [x] **Task 11.3**: Ghi nhận toàn bộ kết quả kiểm thử vào `docs/test-results.md`.

---

### 🔹 Module 12: Security Review, Trả lời 12 Câu hỏi & Hồ sơ Nộp bài
*Mục tiêu: Phản biện mã độc hại, tổng kết kiến thức lý thuyết & thực hành, hoàn thiện hồ sơ đạt điểm 10/10.*
* [x] **Task 12.1**: Thực hiện bài tập Phản biện đoạn code AI nguy hiểm (Prompt 11): phân tích 7 lỗ hổng (thiếu `isAuth`, tin `req.body.userId`, dùng nguyên `originalname`, thiếu giới hạn size, không kiểm MIME thực, CORS wildcard, lưu sai path), viết giải thích 8–10 câu và phương án khắc phục.
* [x] **Task 12.2**: Soạn thảo lời giải chi tiết cho 12 câu hỏi bảo vệ bài thực hành Chương 07 và đề xuất giải pháp cho các bài tập mở rộng (thu dọn file cũ, chuyển sang cloud object storage, Axios AbortController).
* [x] **Task 12.3**: Hoàn thiện tài liệu `docs/prompt-log.md` ghi nhận 13 module CTCO thực tế đã dùng và 2 lần review sửa lỗi code AI.
* [x] **Task 12.4**: Cập nhật tài liệu kiểm thử toàn diện `docs/test-results.md` (48 ca test PASS 100%).
* [x] **Task 12.5**: Rà soát toàn bộ dự án, dọn dẹp các tệp tạm, kiểm tra `.gitignore` loại trừ `node_modules`, `dist`, `.env` thật.

---

## 🏆 KẾT QUẢ KỲ VỌNG CUỐI CÙNG
- [x] Toàn bộ **13 Module (M00 đến M12)** hoàn thành với đầy đủ minh chứng thực tế.
- [x] Đạt **12/12 Ca test Upload (U01–U12)** và **12/12 Ca test Frontend (F01–F12)** đạt 100% PASS.
- [x] Luồng dữ liệu chạy mượt mà end-to-end từ giao diện React Vite tới SQL Server qua Express Backend và Multer.
- [x] Hồ sơ báo cáo, prompt log và câu hỏi bảo vệ bài đầy đủ, trung thực, đạt điểm 10/10 theo giáo trình.
