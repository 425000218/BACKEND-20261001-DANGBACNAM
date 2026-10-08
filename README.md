# Backend Quản Lý Sinh Viên - Buổi 4 / Chương 3
## Kết Nối SQL Server & Sequelize ORM (TypeScript ESM)

Dự án phát triển Backend RESTful API Quản lý Sinh viên, chuyển đổi từ mô hình lưu trữ tạm thời trong bộ nhớ RAM sang lưu trữ bền vững trên **Microsoft SQL Server** thông qua **Sequelize ORM (v6)** và driver **Tedious**.

---

## 1. Yêu cầu môi trường & Công nghệ
- **Node.js**: >= 20 (Khuyến nghị LTS hoặc v22/v24)
- **Package Manager**: `pnpm` (v10)
- **Framework**: Express 5 (TypeScript với ESM / NodeNext)
- **Database**: Microsoft SQL Server (Local / SQLEXPRESS / Docker)
- **ORM / Driver**: `sequelize@6`, `tedious`

---

## 2. Cấu hình Cơ sở dữ liệu & SQL Scripts

Thực thi tuần tự các script trong thư mục `sql/` bằng **SQL Server Management Studio (SSMS)** hoặc công cụ quản trị SQL Server với tài khoản quản trị (sa hoặc Windows Authentication):

1. **`sql/01-quan-ly-sinh-vien.sql`**: Tạo Database `QuanLySinhVienDB` và bảng `dbo.SinhVien` với khóa chính `maSV` (VARCHAR(5)), không dùng id số tự tăng.
2. **`sql/02-seed.sql`**: Nạp dữ liệu mẫu ban đầu (`SV001`, `SV002`) nếu chưa tồn tại.
3. **`sql/03-app-login.sql`**: Tạo Login & User `sv_app`, cấp quyền tối thiểu `SELECT, INSERT` trên bảng `dbo.SinhVien`.
4. **`sql/04-lop-va-quan-he.sql`** *(Phần mở rộng)*: Tạo bảng `dbo.Lop`, thiết lập quan hệ 1-N qua Khóa ngoại `FK_SinhVien_Lop` và cấp quyền `SELECT` bảng `dbo.Lop` cho `sv_app`.

---

## 3. Cấu hình Biến môi trường (.env)

Sao chép `.env.example` thành `.env` tại thư mục gốc của dự án và cập nhật thông tin kết nối phù hợp:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=1433
DB_NAME=QuanLySinhVienDB
DB_USER=sv_app
DB_PASSWORD="MAT_KHAU_LOCAL_CUA_BAN"
DB_ENCRYPT=true
DB_TRUST_CERT=true
```

> **Lưu ý bảo mật:** Không commit file `.env` chứa mật khẩu thật lên Git repository. File `.gitignore` đã được cấu hình bỏ qua file `.env`.

---

## 4. Các lệnh thực thi (Commands)

```bash
# 1. Cài đặt các gói phụ thuộc
pnpm install

# 2. Biên dịch mã nguồn TypeScript sang JavaScript (dist/)
pnpm build

# 3. Kiểm tra kết nối độc lập tới SQL Server
pnpm check:db

# 4. Kiểm tra quan hệ 1-N (Lớp - Sinh viên) với Sequelize Include
pnpm check:relation

# 5. Khởi chạy server ở chế độ phát triển (Hot reload)
pnpm dev

# 6. Khởi chạy server môi trường Production sau khi build
pnpm start
```

---

## 5. Hợp đồng API (API Contracts)

| Method | Endpoint | Mô tả | Mã phản hồi |
|---|---|---|---|
| `GET` | `/` | Kiểm tra trạng thái hoạt động server | `200 OK` |
| `GET` | `/api/v1/sinh-vien` | Lấy danh sách toàn bộ sinh viên | `200 OK` |
| `GET` | `/api/v1/sinh-vien/:maSV` | Tìm sinh viên theo mã sinh viên | `200 OK` hoặc `404 Not Found` |
| `POST` | `/api/v1/sinh-vien` | Thêm mới sinh viên vào CSDL | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `*` | `*` | Tuyến đường không tồn tại | `404 Not Found` |

---

## 6. Kiểm thử với Postman

File collection đã được cập nhật sẵn sàng tại:
`Backend_Sinh_Vien_Buoi_4_SQL_Server.postman_collection.json`

Import file vào Postman, cấu hình biến `baseUrl` = `http://localhost:5000` và chạy toàn bộ các kịch bản kiểm thử từ T01 đến T12.
