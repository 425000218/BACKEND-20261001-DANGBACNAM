# Backend & Frontend Quản Lý Sinh Viên

> **Hệ thống RESTful API Quản lý Sinh viên & Phân quyền Học vụ**  
> **Chương 06: Authentication & Authorization (JWT · Middleware · Phân quyền RBAC)**  
> **Chương 07: Upload Hình Ảnh & Kết Nối Frontend – Backend (Multer · Vite · React · Axios · CORS · JWT)**  
> **Chương 08: Truy Vấn Nâng Cao & Phân Trang - Xử Lý Lỗi Tập Trung (Sequelize · SQL Server · Express 5 · React)**  
> **Chương 09: Kiểm Thử Tự Động, Bảo Mật API & Đóng Gói Triển Khai Docker (Jest · Supertest · Helmet · Rate Limit · SQL Optimization · Docker Compose)**  
> **Công nghệ:** Node.js (v20+) · Express 5 · TypeScript · SQL Server · Sequelize ORM · JWT · Multer · React 19 · Vite · Axios · Jest · Supertest · Helmet · Rate Limit · Docker · Docker Compose · Swagger OpenAPI 3.0

---

## 📑 MỤC LỤC

1. [Giới thiệu dự án &amp; Điểm mới Chương 06](#1-giới-thiệu-dự-án--điểm-mới-chương-06)
2. [Yêu cầu môi trường &amp; Công nghệ](#2-yêu-cầu-môi-trường--công-nghệ)
3. [Cấu trúc thư mục dự án](#3-cấu-trúc-thư-mục-dự-án)
4. [Quy trình triển khai &amp; Chạy bài tập Chương 06 (Từ A - Z)](#4-quy-trình-triển-khai--chạy-bài-tập-chương-06-từ-a---z)
5. [Ghi chú kiến trúc Chương 06 (Auth &amp; RBAC)](#5-ghi-chú-kiến-trúc-chương-06-auth--rbac)
6. [Hợp đồng API (API Contracts)](#6-hợp-đồng-api-api-contracts)
7. [Các phương pháp kiểm thử chi tiết (4 Cách Test)](#7-các-phương-pháp-kiểm-thử-chi-tiết-4-cách-test)
8. [Tài liệu đối chiếu &amp; Minh chứng nghiệm thu](#8-tài-liệu-đối-chiếu--minh-chứng-nghiệm-thu)

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

- **Node.js**: Phiên bản `>= 20.x` (Khuyến nghị LTS hoặc v22/v24).
- **Trình quản lý gói**: `pnpm` (khuyến nghị trên máy cá nhân) hoặc `npm` (mặc định theo Node.js).
- **Cơ sở dữ liệu**: Microsoft SQL Server (2019/2022 Local, Docker hoặc SQL Server Express).
- **Ngôn ngữ & Nền tảng**: TypeScript v5 (ESM Module), Express v5.
- **Thư viện cốt lõi**:
  - ORM & Driver: `sequelize@6`, `tedious`
  - Bảo mật: `bcrypt`, `jsonwebtoken`
  - Tài liệu API: `swagger-ui-express`, `js-yaml` (OpenAPI 3.0)

---

## 3. Cấu trúc thư mục dự án

```
backend-quan-ly-sinh-vien/
├── docs/                               # Toàn bộ tài liệu & Báo cáo đồ án
│   ├── bai_thuc_hanh_chuong_06.md      # Số hóa giáo trình PDF Chương 06
│   ├── bai_thuc_hanh_chuong_07.md      # Số hóa giáo trình PDF Chương 07
│   ├── openapi.yaml                    # Đặc tả OpenAPI 3.0 có Bearer Auth & Upload Multipart
│   ├── prompt-log.md                   # Nhật ký AI Vibe Coding & 12 câu hỏi bảo vệ bài
│   ├── test-results.md                 # Báo cáo kết quả 48 ca test (C6 + C7 ĐẠT 100%)
│   └── screenshots/                    # Ảnh chụp minh chứng kiểm thử Postman / UI
├── frontend/                           # [CHƯƠNG 07] Ứng dụng Giao diện Vite + React + TypeScript
│   ├── src/
│   │   ├── api/client.ts               # Axios instance cấu hình baseURL
│   │   ├── components/                 # SinhVienTable, LoginForm, AvatarUpload
│   │   ├── App.tsx                     # Ứng dụng chính kết nối end-to-end
│   │   └── main.tsx
│   ├── .env.example                    # VITE_API_BASE_URL=http://localhost:5000
│   └── package.json
├── postman/                            # Bộ kịch bản Postman Collection
│   ├── Chuong06-Auth-RBAC.postman_collection.json
│   └── Chuong07-Upload-Avatar.postman_collection.json
├── public/
│   └── uploads/                        # [CHƯƠNG 07] Lưu trữ ảnh đại diện vật lý (<uuid>.<ext>)
├── sql/                                # Kịch bản CSDL SQL Server chạy theo thứ tự
│   ├── 01-quan-ly-sinh-vien.sql        # Tạo CSDL và bảng SinhVien
│   ├── 02-seed.sql                     # Dữ liệu sinh viên mẫu
│   ├── 03-app-login.sql                # Tạo tài khoản sv_app & cấp quyền tối thiểu
│   ├── 04-lop-va-quan-he.sql           # Bảng Lop & Khóa ngoại
│   ├── 04-users-auth.sql               # Tạo bảng Users & cấp quyền cho sv_app
│   └── 05-add-avatar-url.sql           # [CHƯƠNG 07] Bổ sung cột avatarUrl vào dbo.Users
├── src/                                # Mã nguồn TypeScript Backend
│   ├── config/                         # Cấu hình CSDL (database.ts) & Swagger (swagger.config.ts)
│   ├── controllers/                    # Điều phối Request: auth.controller.ts, sinhVien.controller.ts
│   ├── middlewares/                    # isAuth.ts, isAdmin.ts, upload.middleware.ts, error.middleware.ts
│   ├── models/                         # Sequelize models: User, SinhVien, Lop
│   ├── routes/                         # Router: auth.routes.ts, sinhVien.routes.ts
│   ├── scripts/                        # Scripts: run-upload-12-tests.ts, run-frontend-12-tests.ts,...
│   ├── services/                       # Nghiệp vụ: auth.service.ts, sinhVien.service.ts
│   ├── types/                          # Khai báo mở rộng TypeScript: express.d.ts (req.user)
│   ├── utils/                          # jwt.ts, AppError.ts
│   └── server.ts                       # Entry point Express App (CORS allowlist & static /uploads)
├── setup-sql-server.bat                # Script 1-click tự động cấu hình SQL Server & Seed Admin
├── setup-sql-server.ps1                # PowerShell script tự động thiết lập CSDL
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── .env.example                        # Mẫu biến môi trường
```

---

## 4. Quy trình triển khai & Chạy bài tập Chương 06 (Từ A - Z)

Để chạy trọn vẹn dự án từ máy mới, bạn thực hiện tuần tự theo 5 bước sau:

### 🔹 Bước 1: Clone dự án & Mở thư mục

Mở terminal trong Antigravity IDE hoặc VS Code tại thư mục dự án:

```powershell
cd d:\BACKEND-20261001-DANGBACNAM
```

### 🔹 Bước 2: Cài đặt thư viện phụ thuộc (Dependencies)

Bạn có thể dùng `pnpm` hoặc `npm`:

```powershell
# Cách 1: Dùng pnpm (Khuyên dùng)
pnpm install

# Cách 2: Dùng npm (Nếu máy chưa cài pnpm)
npm install
```

### 🔹 Bước 3: Cấu hình biến môi trường (.env)

Sao chép file `.env.example` thành file `.env` tại thư mục gốc:

```powershell
cp .env.example .env
```

Kiểm tra nội dung file `.env` phù hợp với máy của bạn:

Sử dụng local nên cho push github

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=14333
DB_NAME=QuanLySinhVienDB
DB_USER=sv_app
DB_PASSWORD="AppPassword123!"
DB_ENCRYPT=true
DB_TRUST_CERT=true
JWT_SECRET="ChuoiBiMatSieuBaoMatChoJWTChuyenDeChuong06_2026"
```

> [!WARNING]
> Không commit file `.env` chứa mật khẩu thật lên GitHub. File `.gitignore` đã được cấu hình chặn file `.env`.

### 🔹 Bước 4: Thiết lập Cơ sở dữ liệu SQL Server & Nạp dữ liệu Admin

Bạn có thể chọn 1 trong 2 cách sau:

#### 👉 Cách 4A: Tự động 1-Click (Khuyến nghị)

Nhấp đúp chuột vào file **`setup-sql-server.bat`** (hoặc chạy trong PowerShell):

```powershell
.\setup-sql-server.ps1
```

Script sẽ tự động:

1. Bật TCP/IP và cấu hình Mixed Mode cho SQL Server.
2. Thực thi lần lượt 5 script SQL: `01` $\rightarrow$ `02` $\rightarrow$ `03` $\rightarrow$ `04-lop` $\rightarrow$ **`04-users-auth.sql`** (Tạo bảng `dbo.Users`).
3. Tự động chạy **Seed Admin** (`admin@example.com` / `Admin@123`).
4. Kiểm tra kết nối CSDL với Sequelize (`check:db`).

#### 👉 Cách 4B: Thực hiện thủ công qua SSMS

Nếu muốn tự chạy trong SQL Server Management Studio (SSMS):

1. Mở SSMS bằng quyền `sa` hoặc Windows Authentication.
2. Mở và thực thi lần lượt các file trong thư mục `sql/`:
   - `sql/01-quan-ly-sinh-vien.sql`
   - `sql/02-seed.sql`
   - `sql/03-app-login.sql`
   - `sql/04-lop-va-quan-he.sql`
   - `sql/04-users-auth.sql`
3. Chạy lệnh seed tài khoản Admin bằng terminal:
   ```powershell
   pnpm seed:admin
   # hoặc: npm run seed:admin
   ```

### 🔹 Bước 5: Khởi chạy Server Backend

Chạy server ở chế độ phát triển (Hot-reload):

```powershell
# Bằng pnpm:
pnpm dev

# Hoặc bằng npm:
npm run dev
```

Khi màn hình xuất hiện:

```
Kết nối CSDL thành công tới: QuanLySinhVienDB
Server đang chạy tại http://localhost:5000
```

Server đã sẵn sàng tiếp nhận request!

---

## 5. Ghi chú kiến trúc Chương 06 (Auth & RBAC)

### 1. Luồng xử lý kiểm soát truy cập (Pipeline)

Mọi request can thiệp dữ liệu (`POST / PUT / DELETE`) đều bắt buộc đi qua 2 trạm gác theo thứ tự nghiêm ngặt:

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

## 6. Hợp đồng API (API Contracts)

### Nhóm 1: Xác thực tài khoản (Auth)

| Method | Endpoint             | Quyền hạn | Mô tả                                            |            Mã trạng thái             |
| ------ | -------------------- | :-------: | ------------------------------------------------ | :----------------------------------: |
| `POST` | `/api/auth/register` |  Public   | Đăng ký tài khoản sinh viên mới                  | `201 Created`, `400`, `409 Conflict` |
| `POST` | `/api/auth/login`    |  Public   | Đăng nhập nhận JWT Access Token                  |     `200 OK`, `401 Unauthorized`     |
| `GET`  | `/api/auth/profile`  | `isAuth`  | Xem thông tin hồ sơ của tài khoản đang đăng nhập |     `200 OK`, `401 Unauthorized`     |

### Nhóm 2: Quản lý sinh viên (SinhVien CRUD)

| Method   | Endpoint                  |      Quyền hạn       | Mô tả                           |               Mã trạng thái               |
| -------- | ------------------------- | :------------------: | ------------------------------- | :---------------------------------------: |
| `GET`    | `/api/v1/sinh-vien`       |        Public        | Lấy danh sách toàn bộ sinh viên |                 `200 OK`                  |
| `GET`    | `/api/v1/sinh-vien/:maSV` |        Public        | Tìm chi tiết sinh viên theo mã  |         `200 OK`, `404 Not Found`         |
| `POST`   | `/api/v1/sinh-vien`       | `isAuth` + `isAdmin` | Thêm mới sinh viên vào CSDL     | `201 Created`, `400`, `401`, `403`, `409` |
| `PUT`    | `/api/v1/sinh-vien/:maSV` | `isAuth` + `isAdmin` | Cập nhật thông tin sinh viên    |   `200 OK`, `400`, `401`, `403`, `404`    |
| `DELETE` | `/api/v1/sinh-vien/:maSV` | `isAuth` + `isAdmin` | Xóa sinh viên khỏi CSDL         |       `200 OK`, `401`, `403`, `404`       |

---

## 7. Các phương pháp kiểm thử chi tiết (4 Cách Test)

Bạn có thể kiểm thử toàn diện hệ thống bằng một trong 4 phương pháp sau:

### 🧪 Cách 1: Chạy bộ kiểm thử tự động 24 ca test (Automated Test Suite)

Đây là cách nhanh nhất và chính xác nhất để nghiệm thu toàn bộ 24 kịch bản của giáo trình.

- **Lệnh chạy:**

  ```powershell
  # Bằng pnpm:
  pnpm test:24

  # Hoặc bằng npm:
  npm run test:24
  ```

- **Ma trận 24 ca test chuẩn theo giáo trình:**
  - **Nhóm A: Auth & JWT (12 ca)**:
    - `A01`: Đăng ký thành công $\rightarrow$ `201 Created`, role mặc định `student`.
    - `A02`: Đăng ký trùng email $\rightarrow$ `409 Conflict`.
    - `A03`: Đăng ký kèm role admin (leo quyền) $\rightarrow$ `400 Bad Request`.
    - `A04`: Đăng nhập đúng $\rightarrow$ `200 OK` kèm `accessToken` (1h).
    - `A05`: Đăng nhập sai mật khẩu $\rightarrow$ `401 Unauthorized` (thông báo chung).
    - `A06`: Đăng nhập email không tồn tại $\rightarrow$ `401 Unauthorized` (thông báo chung).
    - `A07`: Gọi `/profile` không có Token $\rightarrow$ `401` (`"Yêu cầu Bearer token"`).
    - `A08`: Gọi `/profile` token sai định dạng $\rightarrow$ `401` (`"Sai định dạng Bearer"`).
    - `A09`: Gọi `/profile` token giả mạo chữ ký $\rightarrow$ `401` (`"Token không hợp lệ hoặc sai chữ ký"`).
    - `A10`: Gọi `/profile` token hết hạn $\rightarrow$ `401` (`"Token đã hết hạn"`).
    - `A11`: Gọi `/profile` token hợp lệ $\rightarrow$ `200 OK` (thông tin user, không lộ hash).
    - `A12`: Đăng ký thiếu trường bắt buộc $\rightarrow$ `400 Bad Request`.
  - **Nhóm B: Phân quyền RBAC Sinh viên (12 ca)**:
    - `B01`: `GET /sinh-vien` công khai không cần token $\rightarrow$ `200 OK`.
    - `B02`: `GET /sinh-vien/:maSV` công khai không cần token $\rightarrow$ `200 OK`.
    - `B03`: `POST /sinh-vien` không có token $\rightarrow$ `401 Unauthorized`.
    - `B04`: `PUT /sinh-vien/:maSV` không có token $\rightarrow$ `401 Unauthorized`.
    - `B05`: `DELETE /sinh-vien/:maSV` không có token $\rightarrow$ `401 Unauthorized`.
    - `B06`: `POST /sinh-vien` dùng Token Student $\rightarrow$ `403 Forbidden` (`"Yêu cầu quyền Quản trị viên"`).
    - `B07`: `PUT /sinh-vien/:maSV` dùng Token Student $\rightarrow$ `403 Forbidden`.
    - `B08`: `DELETE /sinh-vien/:maSV` dùng Token Student $\rightarrow$ `403 Forbidden`.
    - `B09`: `POST /sinh-vien` dùng Token Admin $\rightarrow$ `201 Created`.
    - `B10`: `POST /sinh-vien` trùng mã sinh viên $\rightarrow$ `409 Conflict`.
    - `B11`: `PUT /sinh-vien/:maSV` dùng Token Admin $\rightarrow$ `200 OK`.
    - `B12`: `DELETE /sinh-vien/:maSV` dùng Token Admin $\rightarrow$ `200 OK`.

- **Kết quả:** **24 / 24 ca test ĐẠT (100.0%)**.

---

### 🌐 Cách 2: Kiểm thử tương tác trực quan trên Swagger UI (OpenAPI 3.0)

Giao diện trực quan dành cho giảng viên và lập trình viên kiểm thử API trực tiếp:

1. Mở trình duyệt và truy cập: **`http://localhost:5000/api-docs`**.
2. **Lấy Token Admin**:
   - Chọn `POST /api/auth/login` $\rightarrow$ Bấm **Try it out**.
   - Nhập body:
     ```json
     {
       "email": "admin@example.com",
       "password": "Admin@123"
     }
     ```
   - Bấm **Execute** $\rightarrow$ Copy chuỗi `accessToken` trong JSON phản hồi.
3. **Gắn Token vào hệ thống (Authorize)**:
   - Cuộn lên đầu trang, bấm vào nút **Authorize** (biểu tượng ổ khóa màu xanh).
   - Dán chuỗi token vừa copy vào ô `Value` (Swagger tự thêm tiền tố Bearer hoặc bạn nhập `Bearer <token>`).
   - Bấm **Authorize** $\rightarrow$ Bấm **Close**.
4. **Kiểm thử các API được bảo vệ**:
   - Gọi `GET /api/auth/profile` $\rightarrow$ Nhận mã `200 OK` hiển thị role `admin`.
   - Gọi `POST /api/v1/sinh-vien` thêm sinh viên mới $\rightarrow$ Nhận mã `201 Created`.
   - Thử đăng nhập tài khoản sinh viên (`student`), lấy token dán vào Authorize rồi gọi lại `POST /api/v1/sinh-vien` $\rightarrow$ Trả về mã **`403 Forbidden`** chứng minh phân quyền RBAC hoạt động chính xác!

---

### 📬 Cách 3: Kiểm thử bằng Postman Collection

Bộ sưu tập Postman Collection đã được tạo sẵn theo chuẩn bài học:

1. Mở ứng dụng **Postman**.
2. Chọn **Import** $\rightarrow$ Chọn các file:
   - `postman/Chuong06-Auth-RBAC.postman_collection.json` (Kiểm thử 24 ca Auth & RBAC)
   - `postman/Chuong07-Upload-Avatar.postman_collection.json` (Kiểm thử 12 ca Upload Multer U01-U12)
3. Trong Collection, kiểm tra biến môi trường `baseUrl`:
   - `baseUrl`: `http://localhost:5000`
4. Chạy từng request riêng lẻ hoặc chọn **Run Collection** để chạy tự động.

---

### 🚀 Cách 5: [CHƯƠNG 07] Chạy Frontend Vite React & Kiểm thử Tích hợp

1. **Khởi động Backend** (Cổng 5000):
   ```bash
   pnpm run dev
   ```

2. **Khởi động Frontend Vite React** (Cổng 5173):
   ```bash
   pnpm run dev:frontend
   ```
   Mở trình duyệt truy cập: **`http://localhost:5173`**.

3. **Chạy các bộ kiểm thử tự động Chương 07**:
   ```bash
   # Chạy 12 ca kiểm thử Upload Avatar Multer (U01 - U12)
   pnpm run test:upload

   # Chạy 12 ca kiểm thử Frontend React & CORS (F01 - F12)
   pnpm run test:frontend
   ```

---

### 💻 Cách 4: Kiểm thử nhanh qua dòng lệnh (cURL / PowerShell)

#### 1. Đăng ký tài khoản Sinh viên mới (Student):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"Nguyen Van A\", \"email\": \"nguyenvana@example.com\", \"password\": \"MatKhau@123\"}"
```

#### 2. Đăng nhập lấy Token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@example.com\", \"password\": \"Admin@123\"}"
```

#### 3. Xem Profile với Bearer Token:

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <DAN_ACCESS_TOKEN_VAO_DAY>"
```

#### 4. Thử thêm sinh viên bằng Token Student (Kỳ vọng: 403 Forbidden):

```bash
curl -X POST http://localhost:5000/api/v1/sinh-vien \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_STUDENT>" \
  -d "{\"maSV\": \"SV999\", \"hoTen\": \"Test Student\", \"email\": \"sv999@example.com\", \"gioiTinh\": \"Nam\", \"ngaySinh\": \"2003-01-01\", \"maLop\": \"CNTT01\"}"
```

---

## 8. Tài liệu đối chiếu & Minh chứng nghiệm thu

Tất cả báo cáo chi tiết phục vụ việc bảo vệ và chấm thi được lưu trong thư mục `docs/`:

1. [`docs/bai_thuc_hanh_chuong_06.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/bai_thuc_hanh_chuong_06.md):
   - Bản số hóa Markdown toàn bộ 21 trang giáo trình PDF.
   - Tích hợp khối đối chiếu mã nguồn thực tế và vị trí file kiểm thử cho từng bước trong đề bài.
2. [`docs/prompt-log.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/prompt-log.md):
   - Nhật ký thực hiện theo chuẩn cấu trúc CTCO (Context - Task - Constraint - Output).
   - Bảng Security Review phân tích 6 lỗ hổng bảo mật phổ biến do AI sinh code và cách khắc phục.
   - **Lời giải chi tiết cho 8 câu hỏi bảo vệ bài thi** (ở trang 21 của giáo trình).
3. [`docs/test-results.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/test-results.md):
   - Bảng tổng hợp chi tiết kết quả 24 ca test A01–A12, B01–B12 kèm mã phản hồi thực tế và ghi chú an toàn.
4. [`postman/Chuong06-Auth-RBAC.postman_collection.json`](file:///d:/BACKEND-20261001-DANGBACNAM/postman/Chuong06-Auth-RBAC.postman_collection.json):
   - File JSON chứa toàn bộ 24 request Postman đã cấu hình sẵn kịch bản test.
5. [`docs/Bao_Cao_Thuc_Hanh_Chuong_08.pdf`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/Bao_Cao_Thuc_Hanh_Chuong_08.pdf):
   - Báo cáo chính thức Chương 08: Phân trang & Tìm kiếm, Xử lý lỗi tập trung `AppError`, Truy vấn mở rộng (Raw Query, Stored Procedure, Group/Count, JOIN) kèm đầy đủ ảnh chụp Postman và Frontend UI.
6. [`docs/Chuong08-Pagination-Error.postman_collection.json`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/Chuong08-Pagination-Error.postman_collection.json):
   - File Postman Collection đầy đủ 27 request kiểm thử phân trang và xử lý lỗi cho Chương 08.
7. [`docs/bai_thuc_hanh_chuong_08.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/bai_thuc_hanh_chuong_08.md):
   - Bản số hóa và hướng dẫn triển khai chi tiết Chương 08 cùng 4 câu hỏi bảo vệ bài thực hành.
8. [`docs/Bao_Cao_Thuc_Hanh_Chuong_09.pdf`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/Bao_Cao_Thuc_Hanh_Chuong_09.pdf):
   - Báo cáo chính thức Chương 09: Kiểm thử tự động (Jest, Supertest), Bảo mật API (Rate Limiting, Helmet, Security Review), Tối ưu hóa truy vấn SQL Server (SET STATISTICS IO/TIME, OFFSET...FETCH NEXT), Đóng gói ứng dụng với Docker & Docker Compose đa dịch vụ kèm ảnh chụp minh chứng thực tế.
9. [`docs/Chuong09-Test-Security-Docker.postman_collection.json`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/Chuong09-Test-Security-Docker.postman_collection.json):
   - Bộ sưu tập Postman Collection đầy đủ kịch bản kiểm thử API Authentication, Profile, Rate Limiting (HTTP 429), Helmet Security Headers, RBAC Authorization và Hồi quy hệ thống.
10. [`docs/bai_thuc_hanh_chuong_09.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/bai_thuc_hanh_chuong_09.md):
    - Bản số hóa Markdown chi tiết toàn bộ giáo trình thực hành Chương 09 (Buổi 12, Buổi 13, Buổi 14) cùng đối chiếu mã nguồn và câu hỏi bảo vệ.
11. [`docs/security-report.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/security-report.md) & [`docs/sql-optimization.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/sql-optimization.md):
    - Báo cáo rà soát 6 hạng mục an ninh bảo mật và bảng đối chiếu hiệu năng truy vấn SQL Server thực tế trên SQL Server 2022.
12. [`docs/deployment-report.md`](file:///d:/BACKEND-20261001-DANGBACNAM/docs/deployment-report.md):
    - Tài liệu kiến trúc triển khai Docker Compose, phân tích mạng nội bộ, cơ chế kiểm tra sức khỏe CSDL và xác minh tính bền vững dữ liệu qua Named Volumes.

---

## 9. Hướng dẫn chạy kiểm thử Chương 09

### 9.1. Chạy Unit Test & API Test tự động bằng Jest (Buổi 12)
```bash
# Chạy toàn bộ 18 test cases (Smoke test, Unit tests Login & Cart, Supertest API tests)
pnpm test

# Chạy kiểm thử kèm báo cáo độ phủ mã nguồn (Code Coverage)
pnpm test:coverage
```

### 9.2. Chạy kiểm thử An ninh & Rate Limiting trực tiếp (Buổi 13)
```bash
# Kiểm tra HTTP 429 Too Many Requests, Helmet Headers, RBAC và hồi quy
pnpm test:c9
```

### 9.3. Đo lường hiệu năng SQL Server
```bash
# Đo lường và in ra số liệu STATISTICS IO và STATISTICS TIME từ SQL Server
npx tsx src/scripts/measure-sql.ts
```

### 9.4. Sinh lại báo cáo Word, PDF và chụp ảnh tự động
```bash
# Sinh lại 8 ảnh chụp minh chứng sắc nét
pnpm screenshots:c9

# Sinh file Word và xuất file PDF chính thức
pnpm report:pdf:c9
```
