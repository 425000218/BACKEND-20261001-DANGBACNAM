# TỔNG HỢP BÁO CÁO THỰC HÀNH LẬP TRÌNH BACKEND
## HỆ THỐNG RESTFUL API QUẢN LÝ SINH VIÊN

* **Học phần**: Lập trình Backend
* **Sinh viên thực hiện**: Đặng Bắc Nam
* **Mã sinh viên / Dự án**: `BACKEND-20261001-DANGBACNAM`
* **Công nghệ nền tảng**: Node.js (v20+) · Express 5 · TypeScript (ESM) · SQL Server · Sequelize ORM · JWT · bcrypt · OpenAPI 3.0 / Swagger UI
* **Môi trường**: Windows, pnpm / npm, SQL Server SQLEXPRESS (Port: 14333/1433), Postman, Playwright

---

# PHẦN I: BÁO CÁO THỰC HÀNH CHƯƠNG 3 (BUỔI 4)
## KẾT NỐI SQL SERVER & SEQUELIZE ORM (TYPESCRIPT ESM)

### 1. Cấu trúc thư mục dự án ban đầu
```text
backend-quan-ly-sinh-vien/
├── package.json                                    # Cấu hình dự án, scripts: dev, build, start, check:db, check:relation
├── pnpm-lock.yaml                                  # Khóa phiên bản gói cài đặt
├── tsconfig.json                                   # Cấu hình TypeScript (ESM, NodeNext)
├── .env                                            # Biến môi trường local (PORT, DB_HOST, DB_USER, DB_PASSWORD, ...)
├── .env.example                                    # Mẫu biến môi trường an toàn (chứa placeholder)
├── .gitignore                                      # Loại trừ node_modules, dist, .env
├── README.md                                       # Hướng dẫn chi tiết cài đặt và khởi chạy dự án
├── Backend_Sinh_Vien_Buoi_4_SQL_Server.postman_collection.json # File xuất Postman Collection kiểm thử
├── sql/
│   ├── 01-quan-ly-sinh-vien.sql                    # Script DDL tạo Database QuanLySinhVienDB và bảng dbo.SinhVien
│   ├── 02-seed.sql                                 # Script khởi tạo dữ liệu mẫu SV001, SV002
│   ├── 03-app-login.sql                            # Script tạo Login/User sv_app & cấp quyền tối thiểu (SELECT, INSERT)
│   └── 04-lop-va-quan-he.sql                       # Script mở rộng bảng dbo.Lop, quan hệ 1-N và Foreign Key
└── src/
    ├── server.ts                                   # Điểm khởi động server, authenticate CSDL trước khi mở HTTP
    ├── config/
    │   └── database.ts                             # Cấu hình kết nối Sequelize 6 với SQL Server qua Tedious
    ├── models/
    │   ├── SinhVien.ts                             # Model ánh xạ bảng dbo.SinhVien
    │   ├── Lop.ts                                  # Model ánh xạ bảng dbo.Lop
    │   └── index.ts                                # Thiết lập quan hệ 1-N (Lop.hasMany, SinhVien.belongsTo)
    ├── dtos/
    │   └── sinhVien.dto.ts                         # Interface ISinhVienDTO (4 trường: maSV, hoTen, email, maLop)
    ├── services/
    │   └── sinhVien.service.ts                     # Xử lý nghiệp vụ, validation dữ liệu, gọi Model truy vấn CSDL
    ├── controllers/
    │   └── sinhVien.controller.ts                  # Controller async/await tiếp nhận request và trả về JSON chuẩn
    ├── routes/
    │   └── sinhVien.routes.ts                      # Khai báo tuyến đường API (/api/v1/sinh-vien)
    ├── middlewares/
    │   ├── logger.middleware.ts                    # Ghi log request (method, url)
    │   └── error.middleware.ts                     # Bắt lỗi toàn cục, chuẩn hóa phản hồi lỗi (AppError, JSON hỏng, 500)
    ├── scripts/
    │   ├── check-db.ts                             # Script kiểm tra kết nối độc lập tới CSDL
    │   └── check-relation.ts                       # Script kiểm tra truy vấn quan hệ 1-N qua Sequelize Include
    └── utils/
        └── AppError.ts                             # Lớp định nghĩa lỗi nghiệp vụ chuẩn hóa mã HTTP
```

### 2. Thiết kế Cơ sở dữ liệu & Phân quyền ứng dụng (Chương 3)
* **Bảng `dbo.SinhVien`**: `maSV` VARCHAR(5) PK, `hoTen` NVARCHAR(150), `email` NVARCHAR(254), `maLop` NVARCHAR(50) FK.
* **Bảng `dbo.Lop`**: `maLop` NVARCHAR(50) PK, `tenLop` NVARCHAR(150).
* **Nguyên tắc phân quyền tối thiểu**: `sv_app` chỉ có quyền `SELECT, INSERT` trên bảng `dbo.SinhVien` và `SELECT` trên bảng `dbo.Lop`.

### 3. Bảng kết quả kiểm thử Chương 3 (Test Cases T01 - T12)
| ID | Điều kiện & Request | Body gửi lên | Status kỳ vọng | Status thực tế | Kết quả | Body phản hồi thực tế / Ghi chú |
|---|---|---|---|---|---|---|
| **T01** | `GET http://localhost:5000/` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Backend quản lý sinh viên đang hoạt động"}` |
| **T02** | `GET http://localhost:5000/api/v1/sinh-vien` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Lấy danh sách sinh viên thành công",...}` |
| **T03** | `GET http://localhost:5000/api/v1/sinh-vien/SV001` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Tìm sinh viên thành công",...}` |
| **T04** | `GET http://localhost:5000/api/v1/sinh-vien/SV999` | Không | 404 | 404 | **PASS** | `{"success":false,"message":"Không tìm thấy sinh viên"}` |
| **T05** | `POST http://localhost:5000/api/v1/sinh-vien` | `{"maSV":"SV003","hoTen":"Ngọc Mai",...}` | 201 | 201 | **PASS** | Thêm mới thành công vào CSDL |
| **T05.1** | `GET .../SV003` (Sau khi Restart Server) | Không | 200 | 200 | **PASS** | Dữ liệu lưu bền vững trong SQL Server, không mất |
| **T06** | `POST ...` (Trùng mã SV003) | `{"maSV":"SV003",...}` | 409 | 409 | **PASS** | Trả về 409 Conflict |
| **T07** | `POST ...` (Thiếu trường họ tên) | Thiếu hoTen | 400 | 400 | **PASS** | Trả về 400 Bad Request |
| **T08** | `POST ...` (Sai regex mã SV) | `{"maSV":"ABC004",...}` | 400 | 400 | **PASS** | Trả về 400 Bad Request |
| **T09** | `POST ...` (Email sai định dạng) | `{"email":"khong-phai-email"}` | 400 | 400 | **PASS** | Trả về 400 Bad Request |
| **T10** | `POST ...` (Họ tên > 150 ký tự) | Họ tên 151 ký tự | 400 | 400 | **PASS** | Trả về 400 Bad Request |
| **T11** | `POST ...` (JSON gửi lên bị hỏng) | `{"maSV":"SV004"` | 400 | 400 | **PASS** | Trả về 400 Bad Request |
| **T12** | `POST ...` (Mã lớp không tồn tại) | `{"maLop":"KHONG_CO"}` | 400 | 400 | **PASS** | Bị khóa ngoại FK chặn |

---

# PHẦN II: BÁO CÁO THỰC HÀNH CHƯƠNG 06 (BUỔI 07)
## AUTHENTICATION & AUTHORIZATION (JWT · MIDDLEWARE · PHÂN QUYỀN RBAC)

### 1. Mục tiêu và Đề bài thực hành Chương 06
* Nâng cấp hệ thống Quản lý sinh viên từ lưu trữ dữ liệu sang **hệ thống có lớp bảo mật danh tính và phân quyền vai trò (Role-Based Access Control - RBAC)**.
* Triển khai bộ API Xác thực (`/api/auth`): Đăng ký (Register), Đăng nhập (Login), Xem hồ sơ cá nhân (Profile).
* Mật khẩu người dùng được băm an toàn một chiều với thuật toán `bcrypt` (Salt cost = 12), lưu tại bảng `dbo.Users` trong SQL Server.
* Cấp phát Access Token chuẩn JSON Web Token (JWT), ký với thuật toán `HS256`, thời hạn 1 giờ (`expiresIn: '1h'`).
* Xây dựng 2 tầng kiểm soát Middleware:
  * **`isAuth`**: Xác thực tính hợp lệ của JWT từ header `Authorization: Bearer <token>`, trích xuất thông tin người dùng gán vào `req.user`. Chặn mã `401 Unauthorized`.
  * **`isAdmin`**: Kiểm tra vai trò `req.user.role === 'admin'`. Chặn mã `403 Forbidden` đối với tài khoản `student` khi cố tình can thiệp dữ liệu.
* Bảo vệ toàn diện các Route Sinh viên:
  * Giữ nguyên tính công khai (Public) cho các route đọc dữ liệu: `GET /api/v1/sinh-vien`, `GET /api/v1/sinh-vien/:maSV`.
  * Khóa chặt các route thay đổi dữ liệu: `POST`, `PUT`, `DELETE /api/v1/sinh-vien/:maSV` chỉ dành riêng cho Admin có token hợp lệ.
* Đạt chuẩn 24/24 ca kiểm thử ma trận (A01–A12, B01–B12), tích hợp Swagger OpenAPI 3.0 với Bearer Auth, kịch bản Postman Collection và hoàn thành 8 câu hỏi tự kiểm tra bảo vệ.

---

### 2. Thiết kế Cơ sở dữ liệu Bổ sung (Bảng `dbo.Users`)

File kịch bản: [`sql/04-users-auth.sql`](file:///d:/BACKEND-20261001-DANGBACNAM/sql/04-users-auth.sql)

```sql
USE QuanLySinhVienDB;
GO

-- 1. Tạo bảng dbo.Users nếu chưa tồn tại (An toàn, không phá dữ liệu cũ)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Users') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.Users (
        id INT IDENTITY(1,1) NOT NULL,
        fullName NVARCHAR(150) NOT NULL,
        email NVARCHAR(254) NOT NULL,
        passwordHash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'student',
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_Users_Email UNIQUE (email)
    );
    PRINT N'Đã tạo mới bảng dbo.Users thành công.';
END
GO

-- 2. Cấp quyền truy cập cho tài khoản sv_app
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO sv_app;
GO
```

* **Quy tắc thiết kế bảng `dbo.Users`**:
  * `id`: Số nguyên tự tăng `IDENTITY(1,1)`, Khóa chính (PK).
  * `fullName`: Họ tên người dùng `NVARCHAR(150)`, bắt buộc.
  * `email`: `NVARCHAR(254)`, bắt buộc, có ràng buộc `UNIQUE` chống trùng lặp tài khoản.
  * `passwordHash`: Chuỗi mã băm `bcrypt` 60 ký tự (`$2b$12$...`), không bao giờ lưu mật khẩu gốc (plaintext).
  * `role`: Vai trò người dùng, mặc định là `'student'`. Chỉ chấp nhận `'student'` hoặc `'admin'`.

---

### 3. Kiến trúc Luồng Xử lý Kiểm soát Truy cập (RBAC Pipeline)

```
Client Request (Header: Authorization: Bearer <token>)
        │
        ▼
   [ isAuth Middleware ]
        │
        ├── Không có header Authorization ───────────► 401 Unauthorized ("Yêu cầu Bearer token")
        ├── Sai định dạng (không có tiền tố Bearer) ──► 401 Unauthorized ("Sai định dạng Bearer")
        ├── Token sai chữ ký / bị giả mạo ──────────► 401 Unauthorized ("Token không hợp lệ hoặc sai chữ ký")
        ├── Token quá hạn (hết 1 giờ) ──────────────► 401 Unauthorized ("Token đã hết hạn")
        │
        ▼ (Hợp lệ: Gán req.user = { id: payload.sub, role: payload.role })
   [ isAdmin Middleware ]
        │
        ├── req.user.role !== 'admin' (ví dụ: student) ► 403 Forbidden ("Yêu cầu quyền Quản trị viên")
        │
        ▼ (Hợp lệ: role === 'admin')
   [ Controller & Service Execution ] ──────────────► 200 OK / 201 Created (Thao tác thành công)
```

---

### 4. Bảng Kết Quả Kiểm Thử Toàn Diện 24 Ca Test (A01 - A12, B01 - B12)

Kịch bản kiểm thử: Bộ sưu tập Postman Collection `postman/Chuong06-Auth-RBAC.postman_collection.json`.  
Kết quả nghiệm thu: **Đầy đủ 24 ca kiểm thử chuẩn xác theo Giáo trình Chương 06**.

| Mã Ca | Nhóm | Tên ca kiểm thử | Method & Endpoint | Status kỳ vọng | Status thực tế | Kết quả | Ghi chú an toàn & Ý nghĩa |
|:---:|---|---|---|:---:|:---:|:---:|---|
| **A01** | Nhóm A (Auth) | Đăng ký tài khoản mới hợp lệ | `POST /api/auth/register` | **201** | **201** | ✅ **PASS** | Role mặc định là `student`, CSDL lưu hash cost 12, không trả hash ra client. |
| **A02** | Nhóm A (Auth) | Đăng ký với email đã tồn tại | `POST /api/auth/register` | **409** | **409** | ✅ **PASS** | Bắt lỗi trùng email từ Service và ràng buộc UNIQUE CSDL, trả về 409 Conflict. |
| **A03** | Nhóm A (Auth) | Đăng ký kèm role admin (leo quyền) | `POST /api/auth/register` | **400** | **400** | ✅ **PASS** | Chặn client tự gửi trường role, chống tấn công leo thang đặc quyền. |
| **A04** | Nhóm A (Auth) | Đăng nhập đúng thông tin | `POST /api/auth/login` | **200** | **200** | ✅ **PASS** | Trả về `accessToken` JWT thuật toán HS256, thời hạn sống 1 giờ (`expiresIn: 3600`). |
| **A05** | Nhóm A (Auth) | Đăng nhập sai mật khẩu | `POST /api/auth/login` | **401** | **401** | ✅ **PASS** | Dùng `bcrypt.compare`, trả về thông báo chung chống tấn công dò quét tài khoản. |
| **A06** | Nhóm A (Auth) | Đăng nhập email không tồn tại | `POST /api/auth/login` | **401** | **401** | ✅ **PASS** | Trả về thông báo lỗi 401 đồng nhất với ca A05 (chống Email Enumeration). |
| **A07** | Nhóm A (Auth) | Xem Profile không gửi Header Auth | `GET /api/auth/profile` | **401** | **401** | ✅ **PASS** | Middleware `isAuth` chặn với thông báo yêu cầu Bearer token. |
| **A08** | Nhóm A (Auth) | Xem Profile sai định dạng Bearer | `GET /api/auth/profile` | **401** | **401** | ✅ **PASS** | Bắt lỗi chuỗi header không bắt đầu bằng `"Bearer "` hoặc thiếu token sau khoảng trắng. |
| **A09** | Nhóm A (Auth) | Xem Profile với Token giả mạo chữ ký | `GET /api/auth/profile` | **401** | **401** | ✅ **PASS** | `jwt.verify` phát hiện chữ ký sai lệch và từ chối cấp quyền truy cập. |
| **A10** | Nhóm A (Auth) | Xem Profile với Token đã hết hạn | `GET /api/auth/profile` | **401** | **401** | ✅ **PASS** | `jwt.verify` phát hiện `TokenExpiredError` và trả về mã lỗi 401 rõ ràng. |
| **A11** | Nhóm A (Auth) | Xem Profile với Token hợp lệ | `GET /api/auth/profile` | **200** | **200** | ✅ **PASS** | Trả về hồ sơ người dùng (`id`, `fullName`, `email`, `role`), không lộ `passwordHash`. |
| **A12** | Nhóm A (Auth) | Đăng ký thiếu trường bắt buộc | `POST /api/auth/register` | **400** | **400** | ✅ **PASS** | Bắt lỗi thiếu fullName, email hoặc password không hợp lệ. |
| **B01** | Nhóm B (RBAC) | GET danh sách sinh viên (Public) | `GET /api/v1/sinh-vien` | **200** | **200** | ✅ **PASS** | Tuyến đường xem công khai, không gắn middleware bảo vệ, không cần token. |
| **B02** | Nhóm B (RBAC) | GET chi tiết sinh viên theo mã | `GET /api/v1/sinh-vien/SV001` | **200** | **200** | ✅ **PASS** | Tuyến đường công khai xem thông tin sinh viên theo mã. |
| **B03** | Nhóm B (RBAC) | POST thêm SV không gửi token | `POST /api/v1/sinh-vien` | **401** | **401** | ✅ **PASS** | `isAuth` chặn lại ngay ở cửa ngõ đầu tiên vì chưa xác thực danh tính. |
| **B04** | Nhóm B (RBAC) | PUT sửa SV không gửi token | `PUT /api/v1/sinh-vien/SV001` | **401** | **401** | ✅ **PASS** | Thao tác sửa bị chặn với 401 Unauthorized do thiếu Bearer token. |
| **B05** | Nhóm B (RBAC) | DELETE xóa SV không gửi token | `DELETE /api/v1/sinh-vien/SV001` | **401** | **401** | ✅ **PASS** | Thao tác xóa bị chặn với 401 Unauthorized do thiếu Bearer token. |
| **B06** | Nhóm B (RBAC) | POST thêm SV bằng Token Student | `POST /api/v1/sinh-vien` | **403** | **403** | ✅ **PASS** | `isAuth` duyệt qua, nhưng `isAdmin` chặn với **403 Forbidden** vì vai trò là `student`. |
| **B07** | Nhóm B (RBAC) | PUT sửa SV bằng Token Student | `PUT /api/v1/sinh-vien/SV001` | **403** | **403** | ✅ **PASS** | `isAdmin` chặn với **403 Forbidden** (tài khoản sinh viên không có quyền sửa). |
| **B08** | Nhóm B (RBAC) | DELETE xóa SV bằng Token Student | `DELETE /api/v1/sinh-vien/SV001` | **403** | **403** | ✅ **PASS** | `isAdmin` chặn với **403 Forbidden** (tài khoản sinh viên không có quyền xóa). |
| **B09** | Nhóm B (RBAC) | POST thêm SV bằng Token Admin | `POST /api/v1/sinh-vien` | **201** | **201** | ✅ **PASS** | Admin (`admin@example.com`) thêm thành công sinh viên mới `SV088` vào CSDL. |
| **B10** | Nhóm B (RBAC) | POST thêm SV trùng mã (Admin) | `POST /api/v1/sinh-vien` | **409** | **409** | ✅ **PASS** | Admin thêm trùng mã `SV088` bị CSDL và Service bắt lỗi trả về 409 Conflict. |
| **B11** | Nhóm B (RBAC) | PUT sửa SV bằng Token Admin | `PUT /api/v1/sinh-vien/SV088` | **200** | **200** | ✅ **PASS** | Admin cập nhật thông tin họ tên sinh viên `SV088` thành công. |
| **B12** | Nhóm B (RBAC) | DELETE xóa SV bằng Token Admin | `DELETE /api/v1/sinh-vien/SV088` | **200** | **200** | ✅ **PASS** | Admin thực hiện xóa bản ghi sinh viên kiểm thử `SV088` thành công khỏi CSDL. |

---

### 5. Bảng Nhận Diện Lỗ Hổng Bảo Mật Từ Code AI (Security Review)

Quá trình phối hợp Vibe Coding cùng AI đòi hỏi sinh viên phải rà soát mã nguồn nghiêm ngặt theo các nguyên tắc an ninh phần mềm:

| Dấu hiệu cảnh báo | Nguy cơ bảo mật | Biện pháp khắc phục chuẩn trong dự án |
|---|---|---|
| **Lưu mật khẩu thô (Plaintext)** | Để lộ toàn bộ mật khẩu khi bị rò rỉ CSDL hoặc SQL Injection. | Sử dụng `bcrypt.hash(password, 12)` khi đăng ký và `bcrypt.compare` khi đăng nhập. |
| **Hard-code `JWT_SECRET`** | Khóa bí mật lộ trong mã nguồn khiến kẻ tấn công tự ký token giả mạo bất kỳ quyền nào. | Lưu trữ chuỗi ngẫu nhiên bảo mật cao trong biến môi trường `.env` (`JWT_SECRET`). |
| **Token không có hạn (`expiresIn`)** | Token sống vĩnh viễn, nếu bị đánh cắp sẽ không có cơ chế thu hồi. | Cấu hình bắt buộc `{ expiresIn: '1h', algorithm: 'HS256' }`. |
| **Tin tưởng `req.body.role`** | Kẻ xấu gửi `{ "role": "admin" }` lúc đăng ký để tự chiếm quyền quản trị. | Backend tự động gán cứng `role = 'student'` và từ chối request gửi kèm role (400 Bad Request). |
| **Dùng `jwt.decode` thay `jwt.verify`** | Bỏ qua bước kiểm tra chữ ký số, kẻ xấu sửa payload tùy ý vẫn đăng nhập được. | Bắt buộc sử dụng `jwt.verify(token, secret, { algorithms: ['HS256'] })` trong `isAuth`. |
| **Trả `passwordHash` ra Client** | Phơi bày chuỗi hash khiến kẻ xấu thực hiện tấn công bẻ khóa offline (Brute-force). | Dùng DTO chọn lọc (`id`, `fullName`, `email`, `role`), lọc bỏ hoàn toàn `passwordHash`. |

---

### 6. Trả Lời Toàn Diện 8 Câu Hỏi Bảo Vệ Bài Thực Hành (Trang 21 PDF)

#### ❓ Câu 1: Vì sao Register dùng `bcrypt.hash()` nhưng Login phải dùng `bcrypt.compare()`?
* **Khi Register**: Cần tạo ra chuỗi băm một chiều an toàn để lưu vào CSDL. Hàm `bcrypt.hash(password, 12)` tự động sinh một chuỗi muối ngẫu nhiên (salt) với độ phức tạp cost 12 và băm mật khẩu thành chuỗi `$2b$12$...`.
* **Khi Login**: Không thể băm lại mật khẩu nhập vào rồi so sánh chuỗi bằng toán tử `===`, vì mỗi lần gọi `hash()` thì một **salt ngẫu nhiên mới** được sinh ra khiến kết quả băm luôn khác nhau. Do đó, bắt buộc dùng `bcrypt.compare(inputPassword, storedHash)`. Hàm này sẽ trích xuất salt có sẵn từ `storedHash`, băm `inputPassword` với đúng salt đó rồi so khớp an toàn, đồng thời chống lại tấn công đo thời gian (Timing Attack).

#### ❓ Câu 2: Vì sao JWT có chữ ký số mà vẫn không nên chứa `passwordHash` trong payload?
* JWT chỉ được **ký số (Signature)** để bảo toàn tính toàn vẹn (chống sửa đổi) chứ **không được mã hóa bí mật (Encryption)**. Cả 3 phần của JWT chỉ được mã hóa dạng **Base64URL**. Bất kỳ ai bắt được token đều có thể giải mã xem nội dung payload ngay lập tức bằng `atob()` trong JavaScript hoặc qua trang web `jwt.io`.
* Nếu đưa `passwordHash` vào payload, kẻ xấu có thể lấy chuỗi hash này để thực hiện tấn công từ điển ngoại tuyến (Offline Dictionary Attack / GPU Brute-force) mà server không hề hay biết. Vì vậy, payload chỉ lưu các thông tin định danh tối thiểu (`sub`, `role`) và thời hạn (`exp`).

#### ❓ Câu 3: Nếu User sửa chữ `student` thành `admin` trong payload JWT, điều gì xảy ra khi `isAuth` gọi `jwt.verify`?
* Chữ ký số của JWT được tính toán theo công thức:  
  `Signature = HMAC-SHA256(Base64(Header) + "." + Base64(Payload), JWT_SECRET)`.
* Khi người dùng tự sửa payload từ `student` sang `admin`, nội dung payload đã thay đổi. Vì kẻ tấn công không biết chuỗi bí mật `JWT_SECRET` được giấu an toàn trên server, họ không thể tính toán lại chữ ký số mới hợp lệ.
* Khi token được gửi lên server, middleware `isAuth` gọi `jwt.verify(token, JWT_SECRET)`. Thư viện tính lại chữ ký và thấy không khớp với chữ ký đính kèm trong token, lập tức ném ngoại lệ `JsonWebTokenError: invalid signature`. Hệ thống bắt lỗi và trả về **401 Unauthorized** (`"Token không hợp lệ hoặc sai chữ ký"`), ngăn chặn hoàn toàn hành vi mạo danh quyền hạn.

#### ❓ Câu 4: Phân biệt 401 Unauthorized và 403 Forbidden bằng hai Request cụ thể trong B04 và A08 (hoặc B06 và A07)?
* **401 Unauthorized (Chưa xác thực danh tính)**: Hệ thống chưa biết người gửi là ai hoặc thông tin chứng thực không hợp lệ.
  * *Ví dụ ca A07*: Gửi `GET /api/auth/profile` không có header `Authorization` $\rightarrow$ Server chưa biết ai đang gửi nên trả về **401** (`"Yêu cầu Bearer token để xác thực"`).
  * *Ví dụ ca B03*: Gửi `POST /api/v1/sinh-vien` không có token $\rightarrow$ Trả về **401 Unauthorized**.
* **403 Forbidden (Đã xác thực danh tính nhưng bị cấm truy cập)**: Hệ thống đã xác định được danh tính người gửi (token hợp lệ, đã qua `isAuth`), nhưng người này không có đủ vai trò để thực hiện hành động.
  * *Ví dụ ca B06*: Đăng nhập tài khoản sinh viên nhận token hợp lệ, sau đó gửi `POST /api/v1/sinh-vien` kèm token này. Middleware `isAuth` duyệt qua thành công, nhưng `isAdmin` kiểm tra thấy `req.user.role === 'student'` $\rightarrow$ Chặn với mã **403 Forbidden** (`"Yêu cầu quyền Quản trị viên (admin)"`).

#### ❓ Câu 5: Tại sao phải gắn `isAuth` trước `isAdmin`? `req.user` được tạo ở đâu?
* `req.user` được tạo bên trong **Middleware `isAuth`** (`src/middlewares/isAuth.ts`) sau khi giải mã và xác minh token thành công:
  ```typescript
  req.user = { id: payload.sub, role: payload.role };
  ```
* Bắt buộc phải gắn `isAuth` trước `isAdmin` vì:
  1. Express thực thi chuỗi middleware tuần tự từ trái qua phải: `router.post('/', isAuth, isAdmin, handler)`.
  2. Middleware `isAdmin` phụ thuộc hoàn toàn vào giá trị `req.user.role`. Nếu đặt `isAdmin` trước, lúc đó `isAuth` chưa chạy nên `req.user` vẫn là `undefined`, việc truy cập `req.user.role` sẽ gây sập server với lỗi Runtime `TypeError: Cannot read properties of undefined`.
  3. Tuân thủ nguyên lý an ninh thông tin: **Phải nhận diện danh tính (Authentication) trước khi cấp quyền hành động (Authorization)**.

#### ❓ Câu 6: Nếu Route DELETE chỉ được đánh dấu security trong Swagger nhưng không gắn `isAdmin` ở Express, có an toàn không?
* **Hoàn toàn KHÔNG an toàn.**
* Swagger UI (file `docs/openapi.yaml`) chỉ là **tài liệu mô tả giao diện API (API Documentation)** phục vụ việc đọc hiểu hợp đồng giao tiếp giữa các bên, không có cơ chế chặn lọc request ở runtime của web server.
* Nếu trong mã nguồn Express không gắn middleware `isAuth, isAdmin` vào route `router.delete('/:maSV', isAuth, isAdmin, ...)`, bất kỳ ai dùng curl, Postman hoặc script bên ngoài gửi request HTTP DELETE lên server đều sẽ xóa được dữ liệu sinh viên trong SQL Server mà không cần bất kỳ token nào. Lớp bảo mật thực sự duy nhất có giá trị thực thi là middleware trong mã nguồn Backend.

#### ❓ Câu 7: Nếu thay role của một User trong SQL Server sau khi đã cấp JWT, token cũ có cập nhật role ngay không? Muốn kiểm soát phải làm gì?
* **Token cũ KHÔNG tự động cập nhật role ngay.**
* Do bản chất **Stateless (Phi trạng thái)** của JWT: Toàn bộ thông tin định danh (`sub`, `role`, `exp`) được đóng gói và ký cứng vào chuỗi token tại thời điểm đăng nhập. Khi client gửi request, middleware chỉ dùng `JWT_SECRET` để giải mã và kiểm tra chữ ký mà không hề truy vấn lại SQL Server. Do đó, token cũ vẫn giữ nguyên role cũ cho đến khi hết hạn (1 giờ).
* **Giải pháp kiểm soát cập nhật role tức thì**:
  1. *Truy vấn DB trong Middleware*: Trong `isAuth`, sau khi verify token, gọi `await User.findByPk(payload.sub)` để lấy vai trò mới nhất trong CSDL gán vào `req.user`.
  2. *Sử dụng Token Blacklist / Version*: Quản lý phiên bản token (`tokenVersion`) trong bảng `Users`. Khi thay đổi role, tăng `tokenVersion` lên 1 để vô hiệu hóa toàn bộ token cũ.
  3. *Rút ngắn thời hạn Access Token*: Thiết lập Access Token sống ngắn (ví dụ 5–15 phút) kết hợp với Refresh Token.

#### ❓ Câu 8: `req.user` truyền từ `isAuth` sang `isAdmin` bằng cơ chế nào trong Express?
* Trong kiến trúc của Express, một vòng đời HTTP Request từ khi client gửi đến khi nhận phản hồi sẽ dùng chung **duy nhất một đối tượng `req` (Request Object)** xuyên suốt toàn bộ chuỗi Middleware Pipeline.
* Khi `isAuth` thực thi thành công, nó gán thuộc tính trực tiếp vào đối tượng này: `req.user = { id: payload.sub, role: payload.role }` rồi gọi `next()`.
* Middleware tiếp theo trong chuỗi (`isAdmin`) nhận cùng đối tượng `req` đó và có thể đọc trực tiếp `req.user.role`. Để TypeScript không báo lỗi thiếu thuộc tính, dự án đã tạo file mở rộng kiểu dữ liệu [`src/types/express.d.ts`](file:///d:/BACKEND-20261001-DANGBACNAM/src/types/express.d.ts) khai báo bổ sung trường `user?: IUserAuth` vào namespace `Express.Request`.


