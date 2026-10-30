# GIÁO TRÌNH THỰC HÀNH · LẬP TRÌNH BACKEND

# CHƯƠNG 09: KIỂM THỬ, BẢO MẬT & TRIỂN KHAI HỆ THỐNG BACKEND

## JEST · SUPERTEST · HELMET · RATE LIMIT · SQL SERVER · DOCKER

### Nối tiếp Hệ thống Quản lý Sinh viên từ Chương 08

---

## MỤC LỤC

1. [01 / ĐỊNH HƯỚNG: Mục tiêu và Lộ trình 3 Buổi](#01--định-hướng-mục-tiêu-và-lộ-trình-3-buổi)
2. [02 / BẢN ĐỒ PROJECT: Bổ sung file đúng vị trí, bảo toàn mã nguồn cũ](#02--bản-đồ-project-bổ-sung-file-đúng-vị-trí-bảo-toàn-mã-nguồn-cũ)
3. [03 / BUỔI 12 · LAB 1: Kiểm thử tự động với Jest & Supertest](#03--buổi-12--lab-1-kiểm-thử-tự-động-với-jest--supertest)
4. [04 / BUỔI 13 · LAB 2: Bảo mật API với Helmet, Rate Limit & Tối ưu SQL](#04--buổi-13--lab-2-bảo-mật-api-với-helmet-rate-limit--tối-ưu-sql)
5. [05 / BUỔI 14 · LAB 3: Đóng gói Docker, Docker Compose & Dữ liệu bền vững](#05--buổi-14--lab-3-đóng-gói-docker-docker-compose--dữ-liệu-bền-vững)
6. [06 / MỞ RỘNG: Triển khai GitHub, Hosting & Unit Test Giỏ hàng](#06--mở-rộng-triển-khai-github-hosting--unit-test-giỏ-hàng)
7. [07 / MA TRẬN NGHIỆM THU: T01–T05, A01–A07, S01–S07, D01–D09, R01–R05](#07--ma-trận-nghiệm-thu-t01t05-a01a07-s01s07-d01d09-r01r05)
8. [08 / DANH MỤC HỒ SƠ BÀN GIAO & HƯỚNG DẪN VẬN HÀNH](#08--danh-mục-hồ-sơ-bàn-giao--hướng-dẫn-vận-hành)

---

## 01 / ĐỊNH HƯỚNG: Mục tiêu và Lộ trình 3 Buổi

Bài thực hành Chương 09 tiếp nối trực tiếp từ dự án `backend-quan-ly-sinh-vien` hoàn thành Chương 08. Không tạo project mới và không đổi sang ví dụ bán hàng khác.

- **Buổi 12 (Lab 1: Automated Testing)**:
  - Cấu hình Jest, ts-jest và Supertest cho môi trường TypeScript ESM / NodeNext.
  - Viết 5 Unit Test cho logic Đăng nhập (`tests/unit/login.test.ts`: T01–T05) với Mock dependencies.
  - Viết 7 API Test với Supertest (`tests/api/auth.api.test.ts`: A01–A07) kiểm thử mã HTTP và JWT.
  - Đọc báo cáo Coverage và phân tích tình huống kiểm thử FAIL có chủ đích.
- **Buổi 13 (Lab 2: Security & SQL Optimization)**:
  - Cấu hình `helmet` bổ sung HTTP security headers.
  - Thiết lập `express-rate-limit` giới hạn riêng endpoint `POST /api/auth/login` (5 req / 60s) nhận HTTP 429.
  - Lập báo cáo Security Review (`docs/security-report.md`) phân tích SQL Injection, XSS, lộ bí mật.
  - Đo lường và phân tích hiệu năng truy vấn SQL Server thật bằng `STATISTICS IO/TIME` (`docs/sql-optimization.md`).
- **Buổi 14 (Lab 3: Dockerization & Deployment)**:
  - Xây dựng `Dockerfile` đa tầng (multi-stage build) và `.dockerignore`.
  - Khai báo cụm dịch vụ `compose.yaml` (Backend + SQL Server 2022) với Named Volumes lưu trữ bền vững.
  - Kiểm chứng dữ liệu không biến mất sau khi `docker compose down` rồi `docker compose up -d`.
  - Lập báo cáo triển khai (`docs/deployment-report.md`).

---

## 02 / BẢN ĐỒ PROJECT: Bổ sung file đúng vị trí, bảo toàn mã nguồn cũ

```text
backend-quan-ly-sinh-vien/
├── package.json
├── tsconfig.json
├── tsconfig.spec.json                      # [MỚI - BUỔI 12] Cấu hình TypeScript cho test
├── jest.config.mjs                         # [MỚI - BUỔI 12] Cấu hình Jest ESM
├── Dockerfile                              # [MỚI - BUỔI 14] Multi-stage build
├── .dockerignore                           # [MỚI - BUỔI 14] Loại trừ tệp khỏi Docker context
├── compose.yaml                            # [MỚI - BUỔI 14] Khai báo orchestration
├── src/
│   ├── app.ts                              # [CHUẨN HÓA] Tách Express app phục vụ Supertest
│   ├── server.ts                           # Khởi động kết nối CSDL và mở cổng lắng nghe
│   ├── config/database.ts
│   ├── routes/auth.routes.ts, sinhVien.routes.ts
│   ├── controllers/...
│   ├── services/...
│   └── middlewares/
│       ├── rate-limit.middleware.ts        # [MỚI - BUỔI 13] loginLimiter (5 req / 60s)
│       ├── error.middleware.ts
│       ├── isAuth.ts, isAdmin.ts
│       └── upload.middleware.ts
├── tests/
│   ├── smoke.test.ts                       # Kiểm tra cấu hình Jest ESM
│   ├── unit/
│   │   ├── login.test.ts                   # [MỚI - BUỔI 12] 5 Unit Tests Login với Mock (T01-T05)
│   │   └── cart.test.ts                    # [MỚI - BUỔI 12] Mở rộng Unit Test logic giỏ hàng (C01-C05)
│   └── api/
│       └── auth.api.test.ts                # [MỚI - BUỔI 12] 7 API Tests với Supertest (A01-A07)
├── docs/
│   ├── security-report.md                  # [MỚI - BUỔI 13] Báo cáo rà soát bảo mật
│   ├── sql-optimization.md                 # [MỚI - BUỔI 13] Báo cáo đo lường STATISTICS IO/TIME
│   ├── deployment-report.md                # [MỚI - BUỔI 14] Báo cáo đóng gói Docker
│   ├── Chuong09-Test-Security-Docker.postman_collection.json # Collection Postman
│   ├── openapi.yaml
│   └── test-results.md
```

---

## 03 / BUỔI 12 · LAB 1: Kiểm thử tự động với Jest & Supertest

### 1. Phân biệt kiểu kiểm thử
- **Unit Test**: Kiểm tra một đơn vị logic độc lập (hàm `loginUser`). Các phụ thuộc bên ngoài (`User.findOne`, `bcrypt.compare`) được thay thế bằng Mock để bài test chạy nhanh và không phụ thuộc vào SQL Server.
- **API Test (Supertest)**: Kiểm tra hành vi ở giao diện HTTP của toàn bộ pipeline Express (Route -> Controller -> Service -> Middleware), xác minh mã trạng thái HTTP (200, 400, 401, 500) và cấu trúc JSON phản hồi.

### 2. Tách `app.ts` và `server.ts`
- `src/app.ts`: Khởi tạo Express app, gắn toàn bộ middlewares và routes, export `app`.
- `src/server.ts`: Import `app`, kiểm tra kết nối SQL Server qua `sequelize.authenticate()`, sau đó gọi `app.listen(PORT)`.
- Nhờ tách biệt này, Supertest gọi `request(app)` trực tiếp trong bộ nhớ mà không cần mở cổng mạng, tránh xung đột cổng.

---

## 04 / BUỔI 13 · LAB 2: Bảo mật API với Helmet, Rate Limit & Tối ưu SQL

### 1. Bảo vệ Headers với Helmet
- Loại bỏ header tiết lộ nền tảng máy chủ `X-Powered-By`.
- Gắn `X-Content-Type-Options: nosniff` chống MIME sniffing.
- Gắn `X-Frame-Options: SAMEORIGIN` chống Clickjacking.

### 2. Giới hạn tần suất gọi Login (Rate Limiting)
- Sử dụng thư viện `express-rate-limit` thiết lập `loginLimiter`:
  - Cửa sổ thời gian: 60 giây (`windowMs = 60 * 1000`).
  - Hạn mức: Tối đa 5 request (`limit = 5`).
  - Yêu cầu thứ 6 trong cùng cửa sổ nhận mã `HTTP 429 Too Many Requests`.
  - Phản hồi JSON chuẩn: `{ "success": false, "status": 429, "message": "Bạn đã gửi quá nhiều yêu cầu", "data": null }`.

### 3. Phân tích & Đo lường SQL Server (STATISTICS IO/TIME)
- Thực hiện đo trực tiếp trên SQL Server với hai phiên bản:
  - Chưa tối ưu: `SELECT * FROM dbo.SinhVien WHERE hoTen LIKE N'%Anh%';`
  - Đã tối ưu: `SELECT maSV, hoTen, email, maLop FROM dbo.SinhVien WHERE hoTen LIKE N'%Anh%' ORDER BY maSV ASC OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY;`
- Ghi nhận `logical reads` và `CPU/elapsed time` bằng `SET STATISTICS IO ON; SET STATISTICS TIME ON;`.

---

## 05 / BUỔI 14 · LAB 3: Đóng gói Docker, Docker Compose & Dữ liệu bền vững

### 1. Dockerfile Multi-Stage
- **Stage build**: Sử dụng `node:22-bookworm-slim`, cài đặt `corepack` và `pnpm`, copy mã nguồn và chạy `pnpm build` biên dịch TypeScript ra thư mục `dist/`.
- **Stage runtime**: Sử dụng `node:22-bookworm-slim`, chỉ cài `dependencies` phục vụ production (`pnpm install --prod --frozen-lockfile`), copy `dist/` và `docs/`, khởi chạy bằng `node dist/server.js`.

### 2. Cụm dịch vụ `compose.yaml` & Dữ liệu bền vững (Persistence)
- Dịch vụ `backend`: Kết nối cơ sở dữ liệu qua tên service `DB_HOST=sqlserver`.
- Dịch vụ `sqlserver`: Sử dụng image `mcr.microsoft.com/mssql/server:2022-latest`, có `healthcheck` xác nhận engine SQL sẵn sàng.
- Named Volumes: `sqlserver-data` (lưu CSDL) và `uploads-data` (lưu ảnh đại diện avatar).
- Thử nghiệm dữ liệu bền vững: Sau khi `docker compose down` (không dùng cờ `-v`), chạy lại `docker compose up -d`, toàn bộ dữ liệu sinh viên và ảnh avatar trong thư mục upload vẫn được bảo toàn nguyên vẹn.
