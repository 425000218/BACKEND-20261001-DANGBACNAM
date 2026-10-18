# Backend Quản Lý Sinh Viên

> **Hệ thống RESTful API Quản lý Sinh viên & Phân quyền Học vụ**  
> **Chương 06: Authentication & Authorization (JWT · Middleware · Phân quyền RBAC)**  
> **Công nghệ:** Node.js (v20+) · Express 5 · TypeScript (ESM) · SQL Server · Sequelize ORM · JWT · bcrypt · Swagger OpenAPI 3.0

---

## 📑 MỤC LỤC
1. [Giới thiệu dự án & Điểm mới Chương 06](#1-giới-thiệu-dự-án--điểm-mới-chương-06)
2. [Yêu cầu môi trường & Công nghệ](#2-yêu-cầu-môi-trường--công-nghệ)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Hướng dẫn cài đặt & Cấu hình từng bước](#4-hướng-dẫn-cài-đặt--cấu-hình-từng-bước)
5. [Cách chạy dự án (pnpm & npm)](#5-cách-chạy-dự-án-pnpm--npm)
6. [Ghi chú kiến trúc Chương 06 (Auth & RBAC)](#6-ghi-chú-kiến-trúc-chương-06-auth--rbac)
7. [Hợp đồng API (API Contracts)](#7-hợp-đồng-api-api-contracts)
8. [Kiểm thử & Bằng chứng nghiệm thu (24 Ca Test)](#8-kiểm-thử--bằng-chứng-nghiệm-thu-24-ca-test)

---

## 1. Giới thiệu dự án & Điểm mới Chương 06

Dự án tiếp nối từ Chương 05 (CRUD Sinh viên, Validation, Sequelize trên SQL Server). Trong **Chương 06**, hệ thống được nâng cấp lớp bảo mật toàn diện:
- **Đăng ký / Đăng nhập (`/api/auth`)**: Lưu trữ tài khoản người dùng vào bảng `dbo.Users` trên SQL Server. Mật khẩu được băm một chiều an toàn với thuật toán `bcrypt` (Salt cost = 12).
- **Cấp Access Token JWT**: Khi đăng nhập thành công, server cấp Token JWT có thời hạn 1 giờ (`expiresIn: '1h'`) ký bằng thuật toán `HS256`.
- **Phân quyền RBAC 2 lớp Middleware**:
  - `isAuth`: Trích xuất và xác minh Bearer Token từ header `Authorization`, chặn `401 Unauthorized` nếu thiếu, sai định dạng, hết hạn hoặc sai chữ ký.
  - `isAdmin`: Kiểm tra vai trò người dùng (`req.user.role === 'admin'`), chặn `403 Forbidden` nếu người dùng thông thường (`student`) cố tình thực hiện thao tác ghi.
- **Bảo vệ API Sinh viên**: Các route `POST`, `PUT`, `DELETE` sinh viên được bảo vệ nghiêm ngặt chỉ dành riêng cho Admin; các route xem `GET` vẫn giữ công khai (Public).

---

## 2. Yêu cầu môi trường & Công nghệ

- **Node.js**: Phiên bản `>= 20.x` (Khuyến nghị LTS hoặc mới hơn).
- **Trình quản lý gói**: `pnpm` (khuyến nghị trên máy cá nhân) hoặc `npm` (mặc định theo Node.js).
- **Cơ sở dữ liệu**: Microsoft SQL Server (2019/2022 Local, Docker hoặc SQL Server Express).
- **Ngôn ngữ & Nền tảng**: TypeScript v5 (ESM Module), Express v5.
- **Thư viện cốt lõi**:
  - ORM & Driver: `sequelize@6`, `tedious`
  - Bảo mật: `bcrypt`, `jsonwebtoken`
  - Tài liệu API: `swagger-ui-express`, `js-yaml` (OpenAPI 3.0)

---

## 3. Cấu trúc thư mục

```
backend-quan-ly-sinh-vien/
├── docs/                               # Toàn bộ tài liệu & Báo cáo đồ án
│   ├── bai_thuc_hanh_chuong_06.md      # Số hóa 21 trang giáo trình PDF & đối chiếu thực tế
│   ├── openapi.yaml                    # Đặc tả OpenAPI 3.0 có cấu hình Bearer Auth
│   ├── prompt-log.md                   # Nhật ký AI Vibe Coding & Trả lời 8 câu hỏi bảo vệ
│   ├── test-results.md                 # Báo cáo kết quả 24 ca test tự động
│   └── screenshots/                    # Ảnh chụp minh chứng kiểm thử Playwright
├── postman/                            # Bộ kịch bản Postman Collection
│   └── Chuong06-Auth-RBAC.postman_collection.json
├── sql/                                # Kịch bản CSDL SQL Server chạy theo thứ tự
│   ├── 01-quan-ly-sinh-vien.sql        # Tạo CSDL và bảng SinhVien
│   ├── 02-seed.sql                     # Dữ liệu sinh viên mẫu
│   ├── 03-app-login.sql                # Tạo tài khoản sv_app & cấp quyền tối thiểu
│   ├── 04-lop-va-quan-he.sql           # Bảng Lop & Khóa ngoại
│   └── 04-users-auth.sql               # Tạo bảng Users & cấp quyền cho sv_app (Chương 6)
├── src/                                # Mã nguồn TypeScript
│   ├── config/                         # Cấu hình CSDL (database.ts) & Swagger (swagger.config.ts)
│   ├── controllers/                    # Điều phối Request: auth.controller.ts, sinhVien.controller.ts
│   ├── middlewares/                    # isAuth.ts, isAdmin.ts, error.middleware.ts, logger.middleware.ts
│   ├── models/                         # Sequelize models: User, SinhVien, Lop
│   ├── routes/                         # Router: auth.routes.ts, sinhVien.routes.ts
│   ├── scripts/                        # Scripts: seed-admin.ts, run-24-tests.ts, check-db.ts
│   ├── services/                       # Nghiệp vụ: auth.service.ts, sinhVien.service.ts
│   ├── types/                          # Khai báo mở rộng TypeScript: express.d.ts (req.user)
│   ├── utils/                          # jwt.ts, AppError.ts
│   └── server.ts                       # Entry point Express App
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── .env.example                        # Mẫu biến môi trường
```

---

## 4. Hướng dẫn cài đặt & Cấu hình từng bước

### Bước 1: Cài đặt thư viện phụ thuộc
Bạn có thể dùng `pnpm` hoặc `npm` tùy theo môi trường máy:

```bash
# Cách 1: Sử dụng pnpm (Khuyến nghị)
pnpm install

# Cách 2: Sử dụng npm (Nếu máy chưa cài pnpm)
npm install
```

### Bước 2: Thiết lập file cấu hình môi trường (.env)
Sao chép file `.env.example` thành `.env` tại thư mục gốc:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=1433
DB_NAME=QuanLySinhVienDB
DB_USER=sv_app
DB_PASSWORD="MatKhauCuaBan123!"
DB_ENCRYPT=true
DB_TRUST_CERT=true
JWT_SECRET="chuoi_bi_mat_jwt_ngau_nhien_dai_it_nhat_32_ky_tu_an_toan"
```

> [!WARNING]
> Tuyệt đối không commit file `.env` lên GitHub để tránh làm lộ mật khẩu CSDL và khóa bí mật JWT.

### Bước 3: Chạy kịch bản CSDL SQL Server
Mở **SSMS** (hoặc Azure Data Studio) bằng quyền Admin (`sa` hoặc Windows Authentication) và thực thi lần lượt:
1. `sql/01-quan-ly-sinh-vien.sql`: Tạo CSDL `QuanLySinhVienDB` và bảng `dbo.SinhVien`.
2. `sql/02-seed.sql`: Nạp sinh viên mẫu `SV001`, `SV002`.
3. `sql/03-app-login.sql`: Tạo Login/User `sv_app` với quyền hạn tối thiểu.
4. `sql/04-users-auth.sql`: **(Quan trọng cho Chương 6)** Tạo bảng `dbo.Users` và cấp quyền `SELECT, INSERT` cho `sv_app`:
   - Cấu trúc bảng `dbo.Users`: `id` (INT Identity PK), `fullName` (NVARCHAR), `email` (NVARCHAR UNIQUE), `passwordHash` (VARCHAR), `role` (VARCHAR DEFAULT 'student').

### Bước 4: Khởi tạo tài khoản Quản trị viên (Admin Seed)
Hệ thống không cho phép đăng ký quyền Admin qua API công khai (để chống tấn công leo quyền). Hãy chạy script seed để tạo sẵn tài khoản Admin trong CSDL:

```bash
# Bằng pnpm:
pnpm seed:admin

# Hoặc bằng npm:
npm run seed:admin
```

* **Tài khoản Admin mặc định:** `admin@example.com` / `Admin@123` (Role: `admin`).

---

## 5. Cách chạy dự án (pnpm & npm)

Hệ thống hỗ trợ đồng thời cả `pnpm` và `npm`:

| Thao tác | Lệnh bằng `pnpm` | Lệnh bằng `npm` | Mục đích |
|---|---|---|---|
| **Chạy kiểm tra CSDL** | `pnpm check:db` | `npm run check:db` | Kiểm tra kết nối độc lập tới SQL Server |
| **Khởi chạy Dev** | `pnpm dev` | `npm run dev` | Chạy server Hot-reload tại `http://localhost:5000` |
| **Chạy 24 Ca Test** | `pnpm test:24` | `npm run test:24` | Chạy bộ kiểm thử tự động toàn diện A01–A12, B01–B12 |
| **Biên dịch TypeScript** | `pnpm build` | `npm run build` | Biên dịch toàn bộ code sang JavaScript thuần (`dist/`) |
| **Khởi chạy Production** | `pnpm start` | `npm start` | Chạy bản build JavaScript trong `dist/server.js` |

---

## 6. Ghi chú kiến trúc Chương 06 (Auth & RBAC)

### 1. Luồng xử lý kiểm soát truy cập (Pipeline)
Mọi request can thiệp dữ liệu (`POST / PUT / DELETE`) đều bắt buộc đi qua 2 trạm gác:

```
Request Client (Header: Authorization: Bearer <token>)
        │
        ▼
   [ isAuth ] ──────────(Không hợp lệ / Thiếu / Hết hạn) ────────► 401 Unauthorized
        │
        ▼ (Hợp lệ: Gán req.user = { id, role })
   [ isAdmin ] ─────────(Role !== 'admin', ví dụ student) ───────► 403 Forbidden
        │
        ▼ (Role === 'admin')
   [ Controller / Service / SQL Server ] ────────────────────────► 200 OK / 201 Created
```

### 2. Nguyên tắc an toàn & Chuẩn HTTP Status Code
- **401 Unauthorized**: Lỗi về mặt **Xác thực danh tính (Authentication)**. Xảy ra khi request không gửi Bearer token, token sai cú pháp, token bị giả mạo chữ ký, hoặc token đã quá hạn 1 giờ.
- **403 Forbidden**: Lỗi về mặt **Phân quyền truy cập (Authorization)**. Xảy ra khi danh tính người dùng đã được xác định hợp lệ (đã login), nhưng người dùng đó không có đủ thẩm quyền (ví dụ: tài khoản `student` gọi API thêm/sửa/xóa sinh viên).
- **Chống lộ thông tin (Information Leakage)**:
  - Khi login thất bại (dù sai mật khẩu hay không tìm thấy email), server luôn trả về thông điệp chung `401: "Email hoặc mật khẩu không chính xác"` để chống tấn công dò quét email (Email Enumeration).
  - Không bao giờ trả trường `passwordHash` trong response DTO của API Register, Profile hay Login.
- **Chống leo thang đặc quyền (Privilege Escalation)**:
  - API `POST /api/auth/register` tự động gán cố định `role = 'student'`. Nếu client cố tình truyền `{ "role": "admin" }` trong body, server lập tức từ chối với lỗi `400 Bad Request`.

---

## 7. Hợp đồng API (API Contracts)

### Nhóm 1: Xác thực tài khoản (Auth)
| Method | Endpoint | Quyền hạn | Mô tả | Mã trạng thái |
|---|---|:---:|---|:---:|
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản sinh viên mới | `201 Created`, `400`, `409 Conflict` |
| `POST` | `/api/auth/login` | Public | Đăng nhập nhận JWT Access Token | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/auth/profile` | `isAuth` | Xem thông tin hồ sơ của tài khoản đang đăng nhập | `200 OK`, `401 Unauthorized` |

### Nhóm 2: Quản lý sinh viên (SinhVien CRUD)
| Method | Endpoint | Quyền hạn | Mô tả | Mã trạng thái |
|---|---|:---:|---|:---:|
| `GET` | `/api/v1/sinh-vien` | Public | Lấy danh sách toàn bộ sinh viên | `200 OK` |
| `GET` | `/api/v1/sinh-vien/:maSV` | Public | Tìm chi tiết sinh viên theo mã | `200 OK`, `404 Not Found` |
| `POST` | `/api/v1/sinh-vien` | `isAuth` + `isAdmin` | Thêm mới sinh viên vào CSDL | `201 Created`, `400`, `401`, `403`, `409` |
| `PUT` | `/api/v1/sinh-vien/:maSV` | `isAuth` + `isAdmin` | Cập nhật thông tin sinh viên | `200 OK`, `400`, `401`, `403`, `404` |
| `DELETE` | `/api/v1/sinh-vien/:maSV` | `isAuth` + `isAdmin` | Xóa sinh viên khỏi CSDL | `200 OK`, `401`, `403`, `404` |

---

## 8. Kiểm thử & Bằng chứng nghiệm thu (24 Ca Test)

Hệ thống đã được thiết kế và vượt qua bộ ma trận kiểm thử 24 ca test chuẩn theo giáo trình:

### 1. Tài liệu Swagger UI (OpenAPI 3.0)
Khởi động server và mở trình duyệt tại:
```
http://localhost:5000/api-docs
```
- Đã cấu hình `components.securitySchemes.bearerAuth`.
- Bấm nút **Authorize**, dán mã JWT Token dạng `Bearer <token>` để test trực tiếp tất cả các API có bảo vệ.

### 2. Kiểm thử tự động với Test Runner (A01 – A12, B01 – B12)
Chạy lệnh kiểm thử độc lập:
```bash
pnpm test:24
# hoặc
npm run test:24
```
* **Kết quả nghiệm thu:** **24 / 24 ca kiểm thử ĐẠT (Tỷ lệ: 100.0%)**.
  - **Nhóm A (Auth & JWT - 12 ca)**: Kiểm thử đăng ký thành công, bắt trùng email, chặn client tự gửi role admin, đăng nhập sai/đúng, xác thực token thiếu/sai/hết hạn/hợp lệ.
  - **Nhóm B (RBAC & Sinh viên - 12 ca)**: Kiểm thử GET công khai, chặn 401 khi ghi dữ liệu không có token, chặn 403 khi dùng token student, chấp thuận 201/200 khi dùng token admin.

### 3. Tài liệu đối chiếu chi tiết trong thư mục `docs/`:
- [`docs/bai_thuc_hanh_chuong_06.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/bai_thuc_hanh_chuong_06.md): Bản số hóa toàn bộ 21 trang giáo trình kèm mục đối chiếu mã nguồn và ảnh minh chứng.
- [`docs/prompt-log.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/prompt-log.md): Nhật ký kỹ thuật theo chuẩn CTCO, bảng Security Review các lỗ hổng thường gặp và lời giải chi tiết cho **8 câu hỏi bảo vệ bài thi**.
- [`docs/test-results.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/test-results.md): Bảng tổng hợp chi tiết kết quả 24 ca kiểm thử kèm mã phản hồi và thời gian thực thi.
- [`postman/Chuong06-Auth-RBAC.postman_collection.json`](file:///d:/BACKEND-20261001-DANGBACNAM/postman/Chuong06-Auth-RBAC.postman_collection.json): Bộ sưu tập Postman Collection đầy đủ 24 request để import và chạy thử.
