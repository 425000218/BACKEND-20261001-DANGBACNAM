# BÁO CÁO KẾT QUẢ KIỂM THỬ TOÀN DIỆN (TEST-RESULTS.MD)
## CHƯƠNG 06: AUTHENTICATION & AUTHORIZATION (JWT · MIDDLEWARE · PHÂN QUYỀN RBAC)

Dự án: **backend-quan-ly-sinh-vien**  
Sinh viên thực hiện: **Đặng Bắc Nam**  
Thời điểm kiểm thử: **2026-10-18**  
Công cụ kiểm thử: **Automated TypeScript Test Runner (`pnpm run test:24`), Postman Collection v2.1, Playwright MCP**

---

## 📊 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ

| Chỉ số | Giá trị | Tỷ lệ |
|---|:---:|:---:|
| **Tổng số ca kiểm thử** | **24** | 100% |
| **Số ca kiểm thử ĐẠT (Passed)** | **24** | **100.0%** |
| **Số ca kiểm thử HỎNG (Failed)** | **0** | **0.0%** |
| **Nhóm A: Xác thực tài khoản (Auth)** | **12 / 12** | 100% |
| **Nhóm B: Phân quyền RBAC & CRUD SinhVien** | **12 / 12** | 100% |
| **Nhóm U: Upload Avatar & Multer (Chương 07)** | **12 / 12** | 100% |
| **Nhóm F: Frontend React, Axios & CORS (Chương 07)** | **12 / 12** | 100% |
| **TỔNG CỘNG TOÀN DỰ ÁN (C6 + C7)** | **48 / 48** | **100.0%** |

---

## 📋 2. MA TRẬN CHI TIẾT 24 CA KIỂM THỬ

### 🔹 Nhóm A: Xác thực tài khoản (Authentication - A01 đến A12)

| Mã Ca | Tên Ca Kiểm Thử | Tuyến đường (Endpoint) | HTTP Kỳ vọng | HTTP Thực tế | Đạt/Không | Chi tiết & Ghi chú kiểm thử |
|:---:|---|---|:---:|:---:|:---:|---|
| **A01** | Đăng ký tài khoản mới hợp lệ | `POST /api/auth/register` | **201** | **201** | ✅ ĐẠT | Trả về 201 Created, `role: 'student'` mặc định, password được băm bằng bcrypt cost factor 12, không để lộ `passwordHash` trong response. |
| **A02** | Đăng ký với email đã tồn tại | `POST /api/auth/register` | **409** | **409** | ✅ ĐẠT | Bắt trùng email trong CSDL, trả về 409 Conflict với thông điệp: `"Email đã được sử dụng"`. |
| **A03** | Đăng ký cố tình gán role admin | `POST /api/auth/register` | **400** | **400** | ✅ ĐẠT | Ngăn chặn tấn công leo thang đặc quyền (Privilege Escalation), từ chối khi client truyền `role`, trả về 400 Bad Request. |
| **A04** | Đăng nhập thông tin chính xác | `POST /api/auth/login` | **200** | **200** | ✅ ĐẠT | Trả về 200 OK kèm payload `{ accessToken, tokenType: "Bearer", expiresIn: 3600 }`. Token ký bằng HS256 với secret chuẩn. |
| **A05** | Đăng nhập sai mật khẩu | `POST /api/auth/login` | **401** | **401** | ✅ ĐẠT | bcrypt so sánh trả về false, trả về 401 Unauthorized kèm thông báo chung `"Email hoặc mật khẩu không chính xác"` (chống enumeration). |
| **A06** | Đăng nhập email không tồn tại | `POST /api/auth/login` | **401** | **401** | ✅ ĐẠT | Không tìm thấy email, trả về cùng mã 401 và cùng thông báo lỗi chung như ca A05 để không để lộ sự tồn tại của email. |
| **A07** | Xem hồ sơ không gửi Header Authorization | `GET /api/auth/profile` | **401** | **401** | ✅ ĐẠT | Middleware `isAuth` phát hiện thiếu header `Authorization`, chặn và trả về 401: `"Yêu cầu Bearer token để xác thực"`. |
| **A08** | Xem hồ sơ header sai định dạng | `GET /api/auth/profile` | **401** | **401** | ✅ ĐẠT | Gửi `Basic ...` hoặc không có tiền tố `Bearer `, `isAuth` chặn với 401: `"Định dạng Authorization header không hợp lệ"`. |
| **A09** | Xem hồ sơ với Token giả mạo/chữ ký sai | `GET /api/auth/profile` | **401** | **401** | ✅ ĐẠT | Chữ ký số không khớp với `JWT_SECRET`, `verifyToken` ném lỗi và trả về 401: `"Token không hợp lệ hoặc sai chữ ký"`. |
| **A10** | Xem hồ sơ với Token đã hết hạn | `GET /api/auth/profile` | **401** | **401** | ✅ ĐẠT | Gửi token có `exp` nhỏ hơn thời điểm hiện tại, `verifyToken` phát hiện hết hạn và trả về 401: `"Token đã hết hạn sử dụng"`. |
| **A11** | Xem hồ sơ với Token hợp lệ | `GET /api/auth/profile` | **200** | **200** | ✅ ĐẠT | `isAuth` giải mã gán `req.user`, trả về 200 OK với thông tin profile: `id`, `fullName`, `email`, `role`, tuyệt đối không lộ hash. |
| **A12** | Đăng ký thiếu trường bắt buộc | `POST /api/auth/register` | **400** | **400** | ✅ ĐẠT | Thiếu fullName hoặc password, validation chặn và trả về 400 Bad Request. |

---

### 🔹 Nhóm B: Phân quyền RBAC & CRUD SinhVien (B01 đến B12)

| Mã Ca | Tên Ca Kiểm Thử | Tuyến đường (Endpoint) | HTTP Kỳ vọng | HTTP Thực tế | Đạt/Không | Chi tiết & Ghi chú kiểm thử |
|:---:|---|---|:---:|:---:|:---:|---|
| **B01** | GET danh sách sinh viên (Public) | `GET /api/v1/sinh-vien` | **200** | **200** | ✅ ĐẠT | Tuyến đường công khai, truy cập thành công trả về mảng danh sách sinh viên mà không yêu cầu Bearer token. |
| **B02** | GET chi tiết sinh viên theo mã (Public) | `GET /api/v1/sinh-vien/SV001` | **200** | **200** | ✅ ĐẠT | Tuyến đường công khai, xem thông tin sinh viên `SV001` thành công không cần token. |
| **B03** | POST thêm sinh viên không gửi Token | `POST /api/v1/sinh-vien` | **401** | **401** | ✅ ĐẠT | Middleware `isAuth` bảo vệ route POST, chặn người dùng chưa đăng nhập với 401 Unauthorized. |
| **B04** | PUT cập nhật sinh viên không gửi Token | `PUT /api/v1/sinh-vien/SV001` | **401** | **401** | ✅ ĐẠT | Middleware `isAuth` bảo vệ route PUT, chặn người dùng chưa đăng nhập với 401 Unauthorized. |
| **B05** | DELETE xóa sinh viên không gửi Token | `DELETE /api/v1/sinh-vien/SV001` | **401** | **401** | ✅ ĐẠT | Middleware `isAuth` bảo vệ route DELETE, chặn người dùng chưa đăng nhập với 401 Unauthorized. |
| **B06** | POST thêm sinh viên với Token Student | `POST /api/v1/sinh-vien` | **403** | **403** | ✅ ĐẠT | Vượt qua `isAuth` nhưng bị `isAdmin` chặn với 403 Forbidden: `"Yêu cầu quyền Quản trị viên (admin)"`. |
| **B07** | PUT cập nhật sinh viên với Token Student | `PUT /api/v1/sinh-vien/SV001` | **403** | **403** | ✅ ĐẠT | Sinh viên không có quyền chỉnh sửa, bị `isAdmin` chặn với 403 Forbidden. |
| **B08** | DELETE xóa sinh viên với Token Student | `DELETE /api/v1/sinh-vien/SV001` | **403** | **403** | ✅ ĐẠT | Sinh viên không có quyền xóa dữ liệu, bị `isAdmin` chặn với 403 Forbidden. |
| **B09** | POST thêm sinh viên với Token Admin | `POST /api/v1/sinh-vien` | **201** | **201** | ✅ ĐẠT | Tài khoản Admin thực hiện thêm mới sinh viên `SV088` thành công, lưu vào SQL Server và trả về 201 Created. |
| **B10** | POST thêm sinh viên trùng mã (Admin) | `POST /api/v1/sinh-vien` | **409** | **409** | ✅ ĐẠT | Admin thêm lại sinh viên `SV088` đã tồn tại, hệ thống báo lỗi 409 Conflict: `"Mã sinh viên đã tồn tại"`. |
| **B11** | PUT cập nhật sinh viên với Token Admin | `PUT /api/v1/sinh-vien/SV088` | **200** | **200** | ✅ ĐẠT | Admin cập nhật họ tên, email thành công, trả về 200 OK. |
| **B12** | DELETE xóa sinh viên với Token Admin | `DELETE /api/v1/sinh-vien/SV088` | **200** | **200** | ✅ ĐẠT | Admin thực hiện xóa bản ghi sinh viên `SV088` thành công, trả về 200 OK. |

---

### 🔹 Nhóm U: Upload Avatar & Multer (Chương 07 - U01 đến U12)

| Mã Ca | Tên Ca Kiểm Thử | Tình huống & Yêu cầu | HTTP Kỳ vọng | HTTP Thực tế | Đạt/Không | 3 Lớp Bằng Chứng Nghiệm Thu (Postman · Đĩa · SSMS) |
|:---:|---|---|:---:|:---:|:---:|---|
| **U01** | Upload Avatar PNG hợp lệ | File PNG 1x1 chuẩn kèm Bearer JWT Student A | **200** | **200** | ✅ ĐẠT | 1. Postman: 200 OK, trả `data.avatarUrl`.<br>2. Ổ đĩa: Thêm file mới tại `public/uploads/` tên UUID.<br>3. SSMS: Cột `avatarUrl` trong `dbo.Users` cập nhật đúng URL. |
| **U02** | Upload Avatar JPEG hợp lệ & Mở tĩnh | File JPEG chuẩn, kiểm tra phục vụ file tĩnh | **200** | **200** | ✅ ĐẠT | Trả về 200 OK. Trình duyệt gọi `GET /uploads/<filename>.jpg` trả về HTTP 200 OK, ảnh hiển thị sắc nét. |
| **U03** | Thiếu Authorization Header | Gửi file không truyền Bearer token | **401** | **401** | ✅ ĐẠT | `isAuth` chặn trước khi vào Multer. Số lượng file trên ổ đĩa giữ nguyên, CSDL không bị UPDATE. |
| **U04** | JWT hết hạn hoặc chữ ký sai | Gửi token đã quá hạn 1h hoặc sai secret | **401** | **401** | ✅ ĐẠT | `isAuth` bắt lỗi token, trả về 401 Unauthorized. Không tạo file mới trên đĩa. |
| **U05** | Form-data thiếu file | Gửi body rỗng không có key avatar | **400** | **400** | ✅ ĐẠT | Controller kiểm tra `!req.file` và trả về 400 Bad Request: "Không tìm thấy file tải lên". CSDL không đổi. |
| **U06** | Sai tên field (photo thay avatar) | Gửi form-data với key `photo` | **400** | **400** | ✅ ĐẠT | Multer bắt `LIMIT_UNEXPECTED_FILE`, trả về 400 Bad Request yêu cầu đúng field name là `avatar`. |
| **U07** | Kích thước file > 2MB | Gửi file buffer 2.2MB (> 2.097.152 bytes) | **413** | **413** | ✅ ĐẠT | Multer bắt `LIMIT_FILE_SIZE`, trả đúng mã 413 Payload Too Large. Tự động dọn sạch file rác. |
| **U08** | File TXT giả mạo đuôi .png | Đổi file văn bản thành .png (Magic bytes) | **400** | **400** | ✅ ĐẠT | `verifyImageSignature` kiểm tra chữ ký nhị phân thất bại, trả 400 Bad Request và xóa file rác ngay lập tức. |
| **U09** | Đuôi .gif không cho phép | Gửi file đuôi `.gif` | **400** | **400** | ✅ ĐẠT | `fileFilter` từ chối định dạng khác PNG/JPEG, trả về 400 Bad Request, không ghi file vào ổ đĩa. |
| **U10** | Upload 2 lần liên tiếp | Upload lần 2 cùng tài khoản Student A | **200** | **200** | ✅ ĐẠT | Trả về 200 OK, CSDL nhận `avatarUrl` mới khác lần 1. Tên file UUID tránh ghi đè ngẫu nhiên. |
| **U11** | Gửi kèm userId của B trong body | Student A gửi `userId=Student B` | **200** | **200** | ✅ ĐẠT | Server chỉ đọc `req.user.id` từ JWT, bỏ qua body. Avatar của Student B hoàn toàn bất biến. |
| **U12** | GET Profile & Độ bền vững | Gọi lại `GET /api/auth/profile` | **200** | **200** | ✅ ĐẠT | Profile trả về đúng trường `avatarUrl` vừa cập nhật. File tĩnh trên đĩa mở thành công 200. |

---

### 🔹 Nhóm F: Kiểm thử Frontend React Vite, Axios & CORS (Chương 07 - F01 đến F12)

| Mã Ca | Tên Ca Kiểm Thử | Tình huống kiểm thử | Kỳ vọng | Thực tế | Đạt/Không | Ghi chú DevTools Network & Giao diện |
|:---:|---|---|---|---|:---:|---|
| **F01** | Vite chạy & Kiểm tra CORS | Mở app Vite `http://localhost:5173` gọi API | Status 200, có header `Access-Control-Allow-Origin: http://localhost:5173` | Status 200, Allow-Origin: http://localhost:5173 | ✅ ĐẠT | Trình duyệt cho phép kết nối, không báo lỗi CORS console. |
| **F02** | Render Bảng 4 cột Sinh viên | Gọi `GET /api/v1/sinh-vien` thành công | Bảng hiển thị đủ 4 cột `maSV`, `hoTen`, `email`, `maLop` | Đủ 4 cột dữ liệu từ CSDL | ✅ ĐẠT | Đọc đúng mảng tại `res.data.data`, hiển thị badge lớp học trực quan. |
| **F03** | Xử lý danh sách rỗng | Khi CSDL không có sinh viên (`data = []`) | Hiển thị thông báo Empty state, không crash app | Render alert vàng thông báo danh sách trống | ✅ ĐẠT | Kiểm soát mảng rỗng mượt mà, ứng dụng hoạt động ổn định. |
| **F04** | Xử lý Backend tắt / Lỗi mạng | Gọi API khi Backend offline hoặc lỗi mạng | Bắt lỗi mạng, tắt spinner loading, hiện nút "Thử lại" | Bắt lỗi mạng, tắt loading, hiện error alert | ✅ ĐẠT | Giao diện không bị treo vòng lặp loading vô hạn. |
| **F05** | Phục hồi kết nối với nút Thử lại | Bật lại Backend và bấm nút "Thử lại" | Gọi lại `fetchDanhSach()`, phục hồi bảng | Status 200 OK, danh sách sinh viên hiện lại | ✅ ĐẠT | Người dùng có thể tự khôi phục dữ liệu mà không cần F5 toàn trang. |
| **F06** | Đăng nhập Student hợp lệ | Đăng nhập `an.lab@example.com` | Cấp JWT, hiển thị card Profile có họ tên, role, email | Role STUDENT, email an.lab@example.com | ✅ ĐẠT | Lưu token vào bộ nhớ React state an toàn. |
| **F07** | Đăng nhập sai mật khẩu | Nhập mật khẩu sai | Báo lỗi 401 Unauthorized, không lưu token | Bắt 401, hiện cảnh báo đỏ, token null | ✅ ĐẠT | Xử lý lỗi xác thực chuẩn xác. |
| **F08** | Xem Profile khi chưa đăng nhập | Gọi Profile thiếu Bearer header | Chặn 401, chuyển hướng / yêu cầu đăng nhập | Chặn 401 Unauthorized | ✅ ĐẠT | Bảo vệ danh tính người dùng 2 lớp. |
| **F09** | Student ép gọi DELETE | Student gửi request xóa sinh viên | Chặn 403 Forbidden, dữ liệu SQL không đổi | Bắt lỗi 403 Forbidden | ✅ ĐẠT | Phân quyền RBAC Backend hoạt động độc lập, không tin tưởng UI. |
| **F10** | Admin Xóa sinh viên thành công | Admin bấm nút Xóa có hộp thoại xác nhận | Trả 200 OK, CSDL xóa bản ghi, UI tự reload | Status 200 OK, CSDL xóa bản ghi | ✅ ĐẠT | Xóa sinh viên test thành công, danh sách tự động cập nhật loại bỏ bản ghi. |
| **F11** | Upload Avatar từ React FormData | Chọn ảnh ≤ 2MB và bấm Tải lên | Trả 200, cập nhật preview và avatarUrl trong Profile | Status 200, ảnh hiển thị trực tiếp | ✅ ĐẠT | Kết nối mượt mà từ React `<input type="file">` tới SQL Server và thư mục đĩa. |
| **F12** | Chặn CORS từ Origin lạ | Gửi request từ domain ngoài allowlist | Trình duyệt chặn CORS, không cấp header allow-origin | Allow-Origin header: null | ✅ ĐẠT | Chính sách CORS allowlist bảo vệ an toàn trước tấn công Cross-Origin. |

---

## 📸 3. DANH SÁCH ẢNH CHỤP MINH CHỨNG THEO TỪNG MODULE

1. **Khởi tạo giao diện trực quan**: [`docs/screenshots/module-0-client.png`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/module-0-client.png)
2. **Đăng ký tài khoản (201 & 409)**: [`docs/screenshots/module-3-register.png`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/module-3-register.png)
3. **Đăng nhập & Nhận JWT (200)**: [`docs/screenshots/module-4-login.png`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/module-4-login.png)
4. **Xem Hồ sơ bảo vệ bằng `isAuth` (200)**: [`docs/screenshots/module-5-profile.png`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/module-5-profile.png)
5. **Sinh viên bị chặn quyền ghi (403 Forbidden)**: [`docs/screenshots/module-6-rbac.png`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/module-6-rbac.png)
6. **Admin thực hiện thêm sinh viên (201 Created)**: [`docs/screenshots/module-7-seed-admin.png`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/module-7-seed-admin.png)
7. **Tài liệu Swagger OpenAPI 3.0 với BearerAuth**: [`docs/screenshots/module-8-swagger.png`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/module-8-swagger.png)

---

## 🎯 4. KẾT LUẬN
Hệ thống backend đáp ứng đầy đủ và vượt trội các tiêu chí kiểm thử của Chương 06:
- Tỷ lệ vượt qua kiểm thử: **24/24 ca kiểm thử ĐẠT (100%)**.
- Bảo mật: Băm bcrypt cost 12, JWT HS256 hạn 1 giờ, chống Privilege Escalation, chống Email Enumeration, phân quyền Role-Based Access Control chặt chẽ.
- Tài liệu kiểm thử: Đầy đủ Postman Collection JSON, OpenAPI 3.0 YAML, test runner tự động `pnpm run test:24`.
