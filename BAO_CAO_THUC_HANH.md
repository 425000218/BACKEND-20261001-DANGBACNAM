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

---

# PHẦN III: BÁO CÁO THỰC HÀNH CHƯƠNG 07 (BUỔI 08 - BUỔI 09)
## UPLOAD HÌNH ẢNH & KẾT NỐI FRONTEND – BACKEND (MULTER · VITE · REACT · AXIOS · CORS · JWT)

### 1. Mục tiêu và Đề bài thực hành Chương 07
* Tiếp nối trực tiếp từ hệ thống Quản lý sinh viên sau Chương 06, không tạo backend mới và không đổi sang domain khác.
* Xây dựng luồng tải lên ảnh đại diện an toàn cho tài khoản người dùng thông qua giao thức `multipart/form-data` và thư viện `multer`.
* Cấu hình các chốt chặn an ninh nghiêm ngặt: giới hạn dung lượng file tối đa $\le$ 2MB (2.097.152 bytes), sinh tên file ngẫu nhiên bằng UUID, thẩm định chữ ký nhị phân thực tế (Magic bytes) của ảnh PNG/JPEG và tự động dọn sạch file rác nếu phát hiện tệp tin giả mạo.
* Phân tách kiến trúc lưu trữ dữ liệu đa phương tiện: File nhị phân lưu tại thư mục vật lý [`public/uploads/`](file:///d:/BACKEND-20261001-DANGBACNAM/public/uploads), CSDL SQL Server chỉ lưu trữ chuỗi đường dẫn tương đối `/uploads/<uuid>.<ext>` tại cột `avatarUrl` trong bảng `dbo.Users`.
* Xây dựng ứng dụng Frontend độc lập bằng **Vite + React + TypeScript + Axios** đặt trong thư mục `frontend/`, kết nối an toàn với Backend qua chính sách **CORS Allowlist** (`http://localhost:5173`).
* Hiện thực hóa đầy đủ các màn hình giao diện: Bảng hiển thị danh sách sinh viên 4 cột kèm xử lý trạng thái Loading/Empty/Error/Retry, Form đăng nhập lưu token trong bộ nhớ và hiển thị Profile Card, Nút Xóa sinh viên chỉ hiển thị và thực thi với quyền Admin, Component tải ảnh đại diện trực tiếp kèm preview.

---

### 2. Thiết kế Cơ sở Dữ liệu Bổ sung (Cột `avatarUrl`)
File kịch bản: [`sql/05-add-avatar-url.sql`](file:///d:/BACKEND-20261001-DANGBACNAM/sql/05-add-avatar-url.sql)

```sql
USE QuanLySinhVienDB;
GO

-- 1. Bổ sung an toàn cột avatarUrl vào bảng dbo.Users nếu chưa tồn tại (Idempotent)
IF COL_LENGTH('dbo.Users', 'avatarUrl') IS NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD avatarUrl NVARCHAR(255) NULL;
    PRINT N'Đã thêm thành công cột avatarUrl NVARCHAR(255) NULL vào bảng dbo.Users.';
END;
GO

-- 2. Cấp quyền thao tác cho tài khoản ứng dụng sv_app
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO sv_app;
GO
```
* **Tính chất kỹ thuật**: Script có tính lũy kế (idempotent), cho phép chạy lặp lại nhiều lần mà không gây lỗi trùng cột, bảo toàn toàn bộ dữ liệu người dùng cũ và duy trì nguyên vẹn cấu trúc bảng.

---

### 3. Kiến trúc Hai Luồng Xử lý Xuyên suốt Chương 07

#### 🔹 Luồng A: Cập nhật Ảnh đại diện của Người dùng đang đăng nhập
```
[ React <input type="file"> ] 
        │ (Chọn ảnh ≤ 2MB, tạo FormData.append("avatar", file))
        ▼
[ Axios POST /api/auth/me/avatar + Header: Authorization: Bearer <JWT> ]
        │
        ▼
[ Express Router ] ──► [ isAuth Middleware ] (Chặn 401 nếu thiếu/sai JWT)
        │
        ▼ (Hợp lệ: Gán req.user = { id, role })
[ Multer Middleware ] (Kiểm tra kích thước ≤ 2MB, bắt mã 413 nếu quá tải)
        │
        ▼ (Lưu file tạm vào public/uploads/<UUID>.<ext>)
[ Magic Bytes Verifier ] (Đọc 8 byte đầu: PNG 89 50 4E 47 / JPEG FF D8 FF)
        │  ├── Giả mạo: Xóa ngay file rác trên đĩa ──► 400 Bad Request
        │
        ▼ (Hợp lệ)
[ Auth Controller & Service ] (Cập nhật avatarUrl = "/uploads/<UUID>.<ext>" vào dbo.Users)
        │
        ▼ (200 OK: Trả về { success: true, data: { avatarUrl } })
[ React UI ] (Cập nhật thẻ <img> hiển thị ảnh đại diện mới của chính chủ)
```

#### 🔹 Luồng B: Xem và Xóa Sinh viên trên Giao diện React
```
1. Xem danh sách:
   [ React SinhVienTable ] ──► [ Axios GET /api/v1/sinh-vien ] ──► [ Express ] ──► [ SQL Server ]
   (Nhận response.data.data ──► Render Bảng 4 cột: maSV, hoTen, email, maLop)

2. Xóa sinh viên (RBAC):
   [ Nút Xóa (Chỉ hiện khi profile.role === 'admin') ] ──► [ Confirm Popup ]
        │
        ▼
   [ Axios DELETE /api/v1/sinh-vien/:maSV + Header: Bearer <adminToken> ]
        │
        ▼
   [ isAuth Middleware ] ──► [ isAdmin Middleware ] (Chặn 403 Forbidden nếu là student)
        │
        ▼ (Quyền Admin hợp lệ)
   [ Controller & Service ] ──► [ SQL Server DELETE ] ──► [ 200 OK ] ──► [ Reload Table ]
```

---

### 4. Bảng Kết Quả Kiểm Thử Toàn Diện Chương 07

#### 🔹 Nhóm U: Ma trận 12 Ca Kiểm thử Upload & Multer (U01 - U12)
* **Kết quả**: **12 / 12 ca kiểm thử ĐẠT (100.0%)**

| Mã | Tình huống kiểm thử | Expected | Thực tế | Kết quả | Minh chứng 3 tầng (Postman · Đĩa · SSMS) |
|:---:|---|:---:|:---:|:---:|---|
| **U01** | Avatar PNG hợp lệ + Student JWT | 200 | 200 | ✅ PASS | Postman 200 OK; ổ đĩa thêm file UUID mới; SSMS cập nhật đúng `avatarUrl`. |
| **U02** | Avatar JPEG hợp lệ + Mở qua HTTP | 200 | 200 | ✅ PASS | Trả về 200 OK. Phục vụ tĩnh GET `/uploads/<file>.jpg` trả 200 OK, mở xem ảnh nét. |
| **U03** | Không có Authorization header | 401 | 401 | ✅ PASS | `isAuth` chặn trước khi vào Multer. Số file trên đĩa giữ nguyên, CSDL không đổi. |
| **U04** | JWT sai hoặc đã hết hạn | 401 | 401 | ✅ PASS | Bị chặn 401 Unauthorized, không sinh tệp mới trên đĩa. |
| **U05** | Form-data thiếu file | 400 | 400 | ✅ PASS | Bắt lỗi thiếu file, trả 400 Bad Request: "Không tìm thấy file tải lên". |
| **U06** | Sai tên field (photo thay vì avatar) | 400 | 400 | ✅ PASS | Multer bắt `LIMIT_UNEXPECTED_FILE`, trả 400 Bad Request. |
| **U07** | Kích thước file > 2MB (2.2MB) | 413 | 413 | ✅ PASS | Bắt `LIMIT_FILE_SIZE`, trả đúng mã 413 Payload Too Large. Tự dọn sạch file rác. |
| **U08** | File TXT giả mạo đuôi .png | 400 | 400 | ✅ PASS | Kiểm tra chữ ký nhị phân (magic bytes) thất bại, trả 400 và xóa ngay file rác. |
| **U09** | Đuôi .gif không cho phép | 400 | 400 | ✅ PASS | `fileFilter` chặn định dạng khác PNG/JPEG, trả 400 Bad Request. |
| **U10** | Upload liên tiếp 2 lần cùng tài khoản | 200 | 200 | ✅ PASS | CSDL nhận URL mới, tên file UUID tránh ghi đè ngẫu nhiên. |
| **U11** | Gửi kèm userId của B trong body | 200 | 200 | ✅ PASS | Server chỉ lấy ID từ JWT, bỏ qua body. Avatar của B hoàn toàn bất biến. |
| **U12** | GET Profile & Độ bền vững file | 200 | 200 | ✅ PASS | Profile trả đúng trường `avatarUrl` mới; HTTP GET ảnh tĩnh thành công 200 OK. |

#### 🔹 Nhóm F: Ma trận 12 Ca Kiểm thử Frontend Vite, Axios & CORS (F01 - F12)
* **Kết quả**: **12 / 12 ca kiểm thử ĐẠT (100.0%)**

| Mã | Tình huống kiểm thử | Expected | Thực tế | Kết quả | Ghi chú DevTools Network & Giao diện |
|:---:|---|---|---|:---:|---|
| **F01** | Vite chạy & Kiểm tra CORS allowlist | Status 200 OK, có header Access-Control-Allow-Origin | Status 200, Allow-Origin: http://localhost:5173 | ✅ PASS | Trình duyệt không chặn kết nối, không có lỗi CORS console. |
| **F02** | Render Bảng 4 cột Sinh viên | Hiển thị đủ 4 cột `maSV`, `hoTen`, `email`, `maLop` | Đủ 4 cột dữ liệu thực tế từ SQL Server | ✅ PASS | Đọc đúng mảng tại `res.data.data`, hiển thị badge trực quan. |
| **F03** | Xử lý danh sách rỗng (Empty state) | Khi CSDL không có sinh viên | Alert vàng thông báo danh sách trống | ✅ PASS | Ứng dụng ổn định, không bị crash trắng trang. |
| **F04** | Xử lý lỗi kết nối Backend tắt | Bắt lỗi mạng, tắt spinner loading, hiện nút "Thử lại" | Bắt lỗi kết nối, hiện alert lỗi và nút Thử lại | ✅ PASS | Tránh được vòng lặp loading vô hạn. |
| **F05** | Phục hồi kết nối với nút Thử lại | Gọi lại `fetchDanhSach()`, khôi phục dữ liệu | Status 200 OK, bảng dữ liệu hiện lại | ✅ PASS | Phục hồi bảng dữ liệu mượt mà không cần F5 toàn trang. |
| **F06** | Đăng nhập Student hợp lệ | Cấp JWT, hiển thị Profile Card sinh viên | Role STUDENT, email an.lab@example.com | ✅ PASS | Lưu token vào bộ nhớ React state an toàn. |
| **F07** | Đăng nhập sai mật khẩu | Báo lỗi 401 Unauthorized, không cấp token | Bắt 401, hiện alert đỏ, token null | ✅ PASS | Xử lý lỗi xác thực chuẩn xác. |
| **F08** | Xem Profile khi chưa đăng nhập | Chặn 401, yêu cầu đăng nhập lại | Chặn 401 Unauthorized | ✅ PASS | Bảo vệ danh tính người dùng chặt chẽ. |
| **F09** | Student ép gọi DELETE qua DevTools | Chặn 403 Forbidden, CSDL không đổi | Chặn 403 Forbidden | ✅ PASS | Phân quyền RBAC Backend hoạt động độc lập, không tin tưởng UI. |
| **F10** | Admin Xóa sinh viên test thành công | Trả 200 OK, CSDL xóa bản ghi, UI tự reload | Status 200 OK, xóa vĩnh viễn SV999 | ✅ PASS | Bảng sinh viên tự động cập nhật loại bỏ bản ghi. |
| **F11** | Upload Avatar từ React FormData | Trả 200, cập nhật ảnh preview và URL Profile | Status 200, ảnh hiển thị trực tiếp | ✅ PASS | Kết nối trọn vẹn từ React file input tới CSDL và thư mục đĩa. |
| **F12** | Chặn CORS từ Origin lạ | Trình duyệt chặn CORS, không cấp header allow-origin | Allow-Origin: null | ✅ PASS | CORS allowlist bảo vệ an toàn trước tấn công Cross-Origin. |

---

### 5. Bài học Vibe Coding & Phản biện Bảo mật (Security Review)
* Quá trình tích hợp Frontend - Backend giúp làm sáng tỏ sự khác biệt cơ bản giữa **Bảo vệ Giao diện (UI/UX)** và **Bảo vệ Máy chủ (Backend Security)**:
  * Việc ẩn nút Xóa trên giao diện chỉ là giải pháp tiện ích cho người dùng, hoàn toàn không thể thay thế cho middleware `isAdmin` ở backend.
  * Việc kiểm tra dung lượng 2MB tại trình duyệt (`file.size > 2MB`) chỉ giúp phản hồi nhanh cho người dùng, máy chủ Express vẫn bắt buộc phải cấu hình `limits.fileSize` trong Multer để chặn đứng các request gửi qua Postman/curl.
  * Việc kiểm tra đuôi mở rộng `.png` ở client chỉ là bộ lọc hiển thị tệp; server bắt buộc phải kiểm tra **chữ ký nhị phân 8 byte đầu (Magic bytes)** để ngăn chặn các tệp mã độc nguy hiểm giả mạo định dạng hình ảnh.

---

# PHẦN IV: BÁO CÁO THỰC HÀNH CHƯƠNG 08
## TRUY VẤN NÂNG CAO & PHÂN TRANG - XỬ LÝ LỖI TẬP TRUNG
### (Sequelize · SQL Server · Express 5 · React)

### 1. Mục tiêu và Kiến trúc Kỹ thuật

Trong Chương 08, hệ thống RESTful API Quản lý Sinh viên tiếp tục được nâng cấp hai mảng kiến trúc cốt lõi:

1. **Lab 1: Phân trang (Pagination) & Tìm kiếm (Search)**
   - Query Parameters chuẩn: `page` (trang hiện tại, mặc định 1), `limit` (số bản ghi/trang, mặc định 10, tối đa 50), `search` (chuỗi tìm kiếm họ tên gần đúng, tối đa 80 ký tự).
   - Middleware `validateSinhVienQuery`: Chuẩn hóa kiểu dữ liệu, cắt tỉa khoảng trắng (trim), trả về `400 Bad Request` nếu truyền tham số không hợp lệ.
   - Sequelize ORM `findAndCountAll`: Sử dụng toán tử `Op.like` cho SQL Server, đồng thời tính toán `totalItems`, `totalPages`, `page`, `limit`.

2. **Lab 2: Xử lý Lỗi Tập trung (Centralized Error Handling)**
   - Lớp lỗi nghiệp vụ `AppError`: Kế thừa `Error`, lưu trữ `statusCode` và cờ `isOperational: true`.
   - Middleware toàn cục `errorHandler`: Nhận 4 tham số `(err, req, res, next)`, kiểm tra `res.headersSent`, phân loại chính xác các mã HTTP (400, 401, 403, 404, 500).
   - Bảo mật thông tin máy chủ (Information Masking): Khi `NODE_ENV === 'production'`, lỗi 500 che giấu hoàn toàn stack trace và hiển thị thông điệp chung `"Lỗi hệ thống, vui lòng thử lại sau"`.

3. **Bài tập Mở rộng: 4 Kỹ thuật Truy vấn CSDL**
   - **Raw SQL Query**: Gọi `sequelize.query(...)` với `QueryTypes.SELECT` thực hiện `LEFT JOIN` và `GROUP BY`.
   - **Stored Procedure**: Tạo và thực thi thủ tục biên dịch sẵn `dbo.sp_ThongKeSinhVienTheoLop` trên SQL Server.
   - **Sequelize Group & Count**: Sử dụng `SinhVien.findAll` với `sequelize.fn('COUNT')` và mệnh đề `group: ['maLop']`.
   - **Eager Loading (JOIN Model)**: Sử dụng quan hệ liên kết `SinhVien.belongsTo(Lop)` để truy vấn thông tin sinh viên kèm tên lớp học.

---

### 2. Bảng Tổng hợp Kịch bản Kiểm thử

| Nhóm | Số lượng kịch bản | Phạm vi kiểm tra | Trạng thái kỹ thuật |
|---|:---:|---|---|
| **Nhóm P: Phân trang & Tìm kiếm** | 17 tình huống (P01–P17) | Mặc định, trang 1, 2, 4, 99; search tiếng Việt; kết hợp search & paging; validation lỗi 400 | Phản hồi đúng đặc tả JSON & metadata |
| **Nhóm E: Xử lý Lỗi & Bảo mật** | 10 tình huống (E01–E10) | Lỗi 404 sinh viên, 404 route, 400 JSON hỏng, 500 test & production masking, 401 Auth, 403 RBAC | Chuẩn hóa cấu trúc phản hồi lỗi |
| **Nhóm X: Truy vấn Mở rộng** | 4 kỹ thuật (X01–X04) | Raw SQL, Sequelize Group/Count, Stored Procedure, Eager Loading JOIN | Dữ liệu trả về đồng nhất và chính xác |

---

### 3. Tích hợp Giao diện Frontend React

- **Tệp component**: `frontend/src/components/SinhVienTable.tsx`
- **Ô tìm kiếm họ tên**: Nhập liệu thời gian thực, tự động reset về trang 1 khi từ khóa thay đổi.
- **Thanh điều hướng phân trang**:
  - Nút **Trang trước (Previous)** và **Trang sau (Next)** có trạng thái `disabled` phù hợp tại các trang biên.
  - Hiển thị tiến trình: `"Trang X / Y (Tổng số: Z sinh viên)"`.
  - Hộp chọn số lượng bản ghi hiển thị trên mỗi trang (`2, 5, 10, 20/trang`).

---

### 4. Hồ sơ Bàn giao & Tài liệu Đính kèm

Toàn bộ tài liệu chính thức của Chương 08 được lưu trữ tại thư mục `docs/`:
- **Báo cáo chính thức PDF**: [`docs/Bao_Cao_Thuc_Hanh_Chuong_08.pdf`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/Bao_Cao_Thuc_Hanh_Chuong_08.pdf)
- **Bản Word phục vụ lưu trữ**: [`docs/Bao_Cao_Thuc_Hanh_Chuong_08.docx`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/Bao_Cao_Thuc_Hanh_Chuong_08.docx)
- **File Postman Collection**: [`docs/Chuong08-Pagination-Error.postman_collection.json`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/Chuong08-Pagination-Error.postman_collection.json)
- **Hướng dẫn & Câu hỏi bảo vệ bài**: [`docs/bai_thuc_hanh_chuong_08.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/bai_thuc_hanh_chuong_08.md)
- **Đặc tả OpenAPI 3.0**: [`docs/openapi.yaml`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/openapi.yaml)
- **Ảnh chụp minh chứng kiểm thử**: Thư mục [`docs/screenshots/`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/screenshots/) (bao gồm ảnh Postman, Swagger UI, và Frontend React).



