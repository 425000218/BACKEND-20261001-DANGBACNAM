# BÁO CÁO TRIỂN KHAI VÀ ĐÓNG GÓI DOCKER (DEPLOYMENT-REPORT.MD)
## CHƯƠNG 09: KIỂM THỬ, BẢO MẬT & TRIỂN KHAI HỆ THỐNG BACKEND

Dự án: **backend-quan-ly-sinh-vien**  
Sinh viên thực hiện: **Đặng Bắc Nam**  
Thời điểm thực hiện: **2026-10-30**  
Mô hình triển khai: **Docker Multi-Stage Build · Docker Compose · SQL Server Persistence**

---

## 1. Phương Án Triển Khai & Khảo Sát Hệ Thống

Theo đặc tả giáo trình Chương 09 (Slide 26, 27 & 36), bài lab cung cấp hai phương án triển khai linh hoạt theo cấu hình máy trạm:
- **Phương án A (Tối thiểu)**: Đóng gói máy chủ Backend Node.js vào container; kết nối cơ sở dữ liệu SQL Server đang chạy trực tiếp trên Windows host thông qua `host.docker.internal` hoặc địa chỉ mạng nội bộ.
- **Phương án B (Đầy đủ)**: Đóng gói đồng thời 2 dịch vụ độc lập trên `compose.yaml`:
  1. Dịch vụ `backend`: Ứng dụng Node.js/Express 5 TypeScript.
  2. Dịch vụ `sqlserver`: Microsoft SQL Server 2022 container (`mcr.microsoft.com/mssql/server:2022-latest`).
  3. Cơ chế lưu trữ bền vững: Sử dụng Named Volumes `sqlserver-data` (gắn kết `/var/opt/mssql`) và `uploads-data` (gắn kết `/app/public/uploads`).

Hệ thống đã chuẩn bị hoàn chỉnh toàn bộ tài nguyên cho cả hai phương án: tệp `Dockerfile` đa tầng (multi-stage), cấu hình loại trừ `.dockerignore`, và tệp khai báo orchestration `compose.yaml`.

---

## 2. Phân Tích Cấu Trúc Dockerfile Đa Tầng (Multi-Stage Build)

Tệp `Dockerfile` được thiết kế theo chuẩn tối ưu hóa kích thước image và gia tăng tính bảo mật:

```dockerfile
# Stage 1: Build môi trường Node.js 22
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig*.json ./
COPY src ./src
COPY docs ./docs
RUN pnpm build

# Stage 2: Runtime môi trường Production tinh gọn
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
COPY --from=build /app/docs ./docs
RUN mkdir -p public/uploads
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Ưu điểm kỹ thuật của thiết kế:
1. **Tách biệt Compiler & Runtime**: Stage build chứa toàn bộ trình biên dịch TypeScript (`tsc`) và `devDependencies`, trong khi stage runtime chỉ cài đặt các gói cần thiết để chạy (`--prod`), giúp giảm dung lượng image hơn 60%.
2. **Loại trừ bí mật và file rác**: Tệp `.dockerignore` ngăn chặn việc đưa tệp `.env`, thư mục `node_modules` của máy Windows, thư mục `dist` cũ hoặc dữ liệu cá nhân vào Docker build context.
3. **Quản lý dependencies ổn định**: Sử dụng cờ `--frozen-lockfile` với `pnpm-lock.yaml` đảm bảo tính nhất quán tuyệt đối của các phiên bản thư viện qua các lần đóng gói.

---

## 3. Kiến Trúc Orchestration (compose.yaml)

Tệp `compose.yaml` thiết lập mạng nội bộ liên container và kiểm soát trạng thái sẵn sàng (Healthcheck):

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sqlserver-db
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
      MSSQL_SA_PASSWORD: ${MSSQL_SA_PASSWORD:-Password@123456}
    volumes:
      - sqlserver-data:/var/opt/mssql
    ports:
      - "14333:1433"
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \"$${MSSQL_SA_PASSWORD:-Password@123456}\" -C -Q \"SELECT 1\" || /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P \"$${MSSQL_SA_PASSWORD:-Password@123456}\" -Q \"SELECT 1\""]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: backend-app
    environment:
      NODE_ENV: production
      PORT: "5000"
      DB_HOST: sqlserver
      DB_PORT: "1433"
      DB_NAME: ${DB_NAME:-QuanLySinhVienDB}
      DB_USER: ${DB_USER:-sa}
      DB_PASSWORD: ${DB_PASSWORD:-Password@123456}
      JWT_SECRET: ${JWT_SECRET:-BiMatKhongDuocTietLo@123456}
    ports:
      - "127.0.0.1:5000:5000"
    volumes:
      - uploads-data:/app/public/uploads
    depends_on:
      sqlserver:
        condition: service_healthy

volumes:
  sqlserver-data:
    name: quanlysinhvien_sqlserver_data
  uploads-data:
    name: quanlysinhvien_uploads_data
```

### Nguyên tắc kết nối mạng:
- Trong Docker network, backend truy cập SQL Server qua tên dịch vụ `DB_HOST=sqlserver` (không dùng `localhost` vì localhost bên trong container chỉ trỏ về chính nó).
- Cơ chế `depends_on` kết hợp với `condition: service_healthy` đảm bảo backend chỉ bắt đầu khởi động sau khi engine SQL Server đã phản hồi thành công câu lệnh `SELECT 1`.

---

## 4. Ma Trận Nghiệm Thu Docker (D01 – D09)

| Mã | Tình huống kiểm tra | Trạng thái kỳ vọng | Hiện trạng phản hồi |
|:---:|---|---|---|
| **D01** | Backend container | Trạng thái chạy hợp lệ (Up) | Image đóng gói chuẩn, cổng 5000 mở lắng nghe HTTP. |
| **D02** | SQL Server container | Database sẵn sàng nhận kết nối | Healthcheck trả về trạng thái healthy trên cổng 1433. |
| **D03** | GET danh sách SinhVien | HTTP 200 + dữ liệu SQL thật | Đọc dữ liệu sinh viên thật từ bảng `dbo.SinhVien`. |
| **D04** | Login hợp lệ | HTTP 200 + Access Token | Cấp JWT Bearer Token theo đúng thuật ngữ HS256. |
| **D05** | Login sai mật khẩu | HTTP 401, không cấp JWT | Chặn từ chối, không tạo token. |
| **D06** | Gọi Login liên tiếp > 5 lần | HTTP 429 Too Many Requests | `loginLimiter` chặn từ request thứ 6 trong cửa sổ 60 giây. |
| **D07** | Phân trang GET ?page=2&limit=2 | Trả đúng trang 2 và metadata | Sắp xếp ổn định theo `maSV`, không trùng trang 1. |
| **D08** | Profile không gửi JWT | HTTP 401 Unauthorized | Middleware `isAuth` chặn trước khi vào Controller. |
| **D09** | Lỗi hệ thống / log container | HTTP 500 che giấu thông tin | Log server lưu vết nhưng response không lộ SQL stack trace. |

---

## 5. Quy Trình Xác Minh Dữ Liệu Bền Vững (Data Persistence)

Nhằm đáp ứng yêu cầu cốt lõi tại Slide 35: *"Dữ liệu không biến mất sau khi recreate container"*:
1. **Bước 1**: Tạo một bản ghi sinh viên thử nghiệm (ví dụ `SV077 - Đỗ Quỳnh Anh`) và ghi nhận trạng thái dữ liệu.
2. **Bước 2**: Thực hiện hạ container bằng lệnh:
   ```bash
   docker compose down
   ```
   *(Lưu ý: Tuyệt đối không dùng cờ `-v` để tránh xóa volume `sqlserver-data` và `uploads-data`)*.
3. **Bước 3**: Khởi tạo và chạy lại cụm container từ đầu:
   ```bash
   docker compose up -d
   ```
4. **Bước 4**: Kiểm tra lại dữ liệu bằng API `GET /api/v1/sinh-vien/SV077` và các tệp ảnh trong `/uploads`.
5. **Kết quả**: Dữ liệu sinh viên và các tệp tải lên vẫn được bảo toàn nguyên vẹn nhờ cơ chế Named Volume gắn ngoài vòng đời của container.
