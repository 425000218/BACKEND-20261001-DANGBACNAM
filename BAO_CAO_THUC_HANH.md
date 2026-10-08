# BÁO CÁO THỰC HÀNH CHƯƠNG 3 (BUỔI 4)
## KẾT NỐI SQL SERVER & SEQUELIZE ORM (TYPESCRIPT ESM)

* **Học phần**: Lập trình Backend
* **Dự án**: Quản lý sinh viên với Node.js, Express 5, TypeScript và Sequelize ORM (v6)
* **Cơ sở dữ liệu**: Microsoft SQL Server (Database: `QuanLySinhVienDB`, User: `sv_app`)
* **Môi trường**: Windows, Node.js v22/v24, pnpm v10, tsx, Postman v2.1

---

## 1. Cấu trúc thư mục dự án nâng cấp

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

---

## 2. Thiết kế Cơ sở dữ liệu & Phân quyền ứng dụng

### 2.1. Bảng `dbo.SinhVien`
* `maSV`: `VARCHAR(5)`, **PRIMARY KEY**, `NOT NULL` — Định danh duy nhất theo định dạng chuỗi (`SV001`), không dùng `id` số tự tăng nhằm giữ tính tương thích với DTO từ chương trước.
* `hoTen`: `NVARCHAR(150)`, `NOT NULL` — Lưu họ tên tiếng Việt có dấu.
* `email`: `NVARCHAR(254)`, `NOT NULL` — Lưu email chuẩn RFC.
* `maLop`: `NVARCHAR(50)`, `NOT NULL` — Lưu mã lớp học (khóa ngoại tham chiếu `dbo.Lop(maLop)`).

### 2.2. Bảng `dbo.Lop` (Mở rộng quan hệ 1-N)
* `maLop`: `NVARCHAR(50)`, **PRIMARY KEY**, `NOT NULL` — Mã lớp (ví dụ: `25CT114`).
* `tenLop`: `NVARCHAR(150)`, `NOT NULL` — Tên lớp học chi tiết.
* **Ràng buộc toàn vẹn**: `FK_SinhVien_Lop` (`SinhVien.maLop` tham chiếu `Lop.maLop`). Không sử dụng `CASCADE DELETE` để đảm bảo an toàn dữ liệu sinh viên.

### 2.3. Nguyên tắc cấp quyền tối thiểu (Least Privilege) cho `sv_app`
* Tài khoản ứng dụng `sv_app` chỉ được cấp quyền `SELECT` và `INSERT` trên bảng `dbo.SinhVien`, và `SELECT` trên bảng `dbo.Lop`.
* Tuyệt đối không cấp quyền `sysadmin`, `db_owner`, `UPDATE` hay `DELETE` trong phạm vi bài chính, giúp hạn chế tối đa rủi ro bảo mật CSDL.

---

## 3. Bảng kết quả kiểm thử (Test Cases T01 - T12)

| ID | Điều kiện & Request | Body gửi lên | Status kỳ vọng | Status thực tế | Kết quả | Body phản hồi thực tế / Ghi chú |
|---|---|---|---|---|---|---|
| **T01** | `GET http://localhost:5000/` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Backend quản lý sinh viên đang hoạt động"}` |
| **T02** | `GET http://localhost:5000/api/v1/sinh-vien` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Lấy danh sách sinh viên thành công","data":[{"maSV":"SV001","hoTen":"Minh Nhật","email":"minhnhat@example.com","maLop":"25CT114"},{"maSV":"SV002","hoTen":"Lan Anh","email":"lananh@example.com","maLop":"25CT114"}]}` |
| **T03** | `GET http://localhost:5000/api/v1/sinh-vien/SV001` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Tìm sinh viên thành công","data":{"maSV":"SV001","hoTen":"Minh Nhật","email":"minhnhat@example.com","maLop":"25CT114"}}` |
| **T04** | `GET http://localhost:5000/api/v1/sinh-vien/SV999` | Không | 404 | 404 | **PASS** | `{"success":false,"message":"Không tìm thấy sinh viên"}` |
| **T05** | `POST http://localhost:5000/api/v1/sinh-vien` (Thêm SV003 hợp lệ) | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 201 | 201 | **PASS** | `{"success":true,"message":"Thêm sinh viên thành công","data":{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}}` |
| **T05.1** | `GET http://localhost:5000/api/v1/sinh-vien/SV003` *(Sau khi tắt & khởi động lại Server)* | Không | 200 | 200 | **PASS** | `{"success":true,"data":{"maSV":"SV003","hoTen":"Ngọc Mai",...}}` **(Chứng minh dữ liệu lưu bền vững trong SQL Server, không bị mất khi restart)** |
| **T06** | `POST http://localhost:5000/api/v1/sinh-vien` (Gửi lại SV003 trùng mã) | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 409 | 409 | **PASS** | `{"success":false,"message":"Mã sinh viên đã tồn tại"}` (Bảo vệ bởi PK SQL Server) |
| **T07** | `POST http://localhost:5000/api/v1/sinh-vien` (Thiếu họ tên / tên rỗng) | `{"maSV":"SV004","email":"test@example.com","maLop":"25CT114"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Cần cung cấp đủ 4 trường maSV, hoTen, email, maLop có kiểu chuỗi (string)"}` |
| **T08** | `POST http://localhost:5000/api/v1/sinh-vien` (Mã SV sai regex `ABC004`) | `{"maSV":"ABC004","hoTen":"Test","email":"test@test.com","maLop":"25CT114"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Mã sinh viên không đúng định dạng..."}` |
| **T09** | `POST http://localhost:5000/api/v1/sinh-vien` (Email sai cú pháp) | `{"maSV":"SV004","hoTen":"Test","email":"khong-phai-email","maLop":"25CT114"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Email không đúng định dạng"}` |
| **T10** | `POST http://localhost:5000/api/v1/sinh-vien` (Họ tên dài > 150 ký tự) | `{"maSV":"SV004","hoTen":"[151 ký tự]","email":"v@test.com","maLop":"25CT114"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Họ tên không được vượt quá 150 ký tự"}` |
| **T11** | `POST http://localhost:5000/api/v1/sinh-vien` (JSON hỏng cú pháp) | `{"maSV":"SV004"` | 400 | 400 | **PASS** | `{"success":false,"message":"Dữ liệu JSON gửi lên không đúng cú pháp"}` |
| **T12** | `POST http://localhost:5000/api/v1/sinh-vien` (Mã lớp không tồn tại trong bảng Lop) | `{"maSV":"SV004","hoTen":"Test","email":"v@test.com","maLop":"LOP_KHONG_TON_TAI"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Mã lớp không tồn tại"}` (Bảo vệ bởi quan hệ Khóa ngoại FK) |

---

## 4. Bằng chứng kiểm tra độc lập (CLI Commands)

### 4.1. Kiểm tra kết nối CSDL (`pnpm check:db`)
```text
> tsx src/scripts/check-db.ts
Executing (default): SELECT 1+1 AS result
DB connected: QuanLySinhVienDB
```

### 4.2. Kiểm tra quan hệ 1-N Lớp & Sinh viên (`pnpm check:relation`)
```text
> tsx src/scripts/check-relation.ts
--- KẾT NỐI CSDL THÀNH CÔNG ---

=== 1. DANH SÁCH SINH VIÊN KÈM THÔNG TIN LỚP (SinhVien -> Lop) ===
[SV001] Minh Nhật - Email: minhnhat@example.com | Lớp: 25CT114 - Lớp Công Nghệ Thông Tin K114
[SV002] Lan Anh - Email: lananh@example.com | Lớp: 25CT114 - Lớp Công Nghệ Thông Tin K114

=== 2. DANH SÁCH LỚP VÀ CÁC SINH VIÊN THUỘC LỚP (Lop -> SinhViens) ===
Lớp: [25CT114] Lớp Công Nghệ Thông Tin K114
Số lượng sinh viên: 2
  - SV001: Minh Nhật (minhnhat@example.com)
  - SV002: Lan Anh (lananh@example.com)

--- KIỂM TRA QUAN HỆ 1-N HOÀN TẤT THÀNH CÔNG ---
```

---

## 5. Nhật ký Prompt (Vibe Coding Log)

### Prompt 1: Tạo Database, bảng SinhVien và dữ liệu mẫu
* **Mục tiêu**: Tạo các script SQL Server độc lập cho DDL và DML.
* **Yêu cầu & Ràng buộc**: Tạo DB `QuanLySinhVienDB`, bảng `dbo.SinhVien` với `maSV` VARCHAR(5) là Khóa chính. Dùng lệnh `IF NOT EXISTS` và mệnh đề `GO` phân tách batch để script có thể chạy lại an toàn mà không làm mất dữ liệu cũ.

### Prompt 2: Tạo Login sv_app và phân quyền tối thiểu
* **Mục tiêu**: Tạo tài khoản xác thực SQL Authentication chuyên dụng cho Backend.
* **Yêu cầu & Ràng buộc**: Tạo Login `sv_app` trong `master`, User `sv_app` trong `QuanLySinhVienDB`. Chỉ `GRANT SELECT, INSERT` trên bảng `dbo.SinhVien`. Tuyệt đối không dùng `sa` hay gán quyền `db_owner`.

### Prompt 3: Cấu hình kết nối Sequelize 6 và Model SinhVien
* **Mục tiêu**: Thiết lập file `src/config/database.ts` và model `src/models/SinhVien.ts`.
* **Yêu cầu & Ràng buộc**: Sử dụng Sequelize 6 + TypeScript ESM NodeNext, driver `tedious`, đọc cấu hình từ `.env` an toàn. Khai báo model dùng từ khóa `declare` để tránh ghi đè getter/setter của Sequelize, thiết lập `timestamps: false` và `schema: 'dbo'`.

### Prompt 4: Chuyển đổi Service & Controller sang bất đồng bộ (async/await)
* **Mục tiêu**: Thay thế mảng RAM bằng các truy vấn Sequelize (`findAll`, `findByPk`, `create`).
* **Yêu cầu & Ràng buộc**: Giữ nguyên tên hàm và chuẩn DTO 4 trường. Thêm kiểm tra độ dài chuỗi (`hoTen <= 150`, `email <= 254`, `maLop <= 50`). Controller phải `await` toàn bộ các hàm Service trước khi trả response JSON nhằm tránh gửi Promise rỗng về client.

### Prompt 5: Khởi động an toàn & Mở rộng quan hệ 1-N (Lop - SinhVien)
* **Mục tiêu**: Sửa `src/server.ts` để `await sequelize.authenticate()` trước khi `app.listen()`, đồng thời bổ sung quan hệ 1-N với bảng `dbo.Lop`.
* **Yêu cầu & Ràng buộc**: Kiểm tra `Lop.findByPk(maLop)` khi thêm sinh viên, xử lý `ForeignKeyConstraintError` thành mã lỗi `400` với thông báo `"Mã lớp không tồn tại"`. Cung cấp script `src/scripts/check-relation.ts` sử dụng `include` để kiểm tra quan hệ mà không làm thay đổi DTO API chính.

---

## 6. Tự trả lời 5 câu hỏi cốt lõi

### 1. DTO và Model khác nhau thế nào?
* **DTO (Data Transfer Object)**: Là đối tượng định nghĩa cấu trúc dữ liệu dùng để **trao đổi giữa Client và Server qua giao thức HTTP**. DTO chỉ chứa dữ liệu thuần túy (plain object), không chứa logic nghiệp vụ hay logic truy vấn CSDL, giúp che giấu cấu trúc lưu trữ nội bộ và chỉ phơi bày những thông tin cần thiết.
* **Model (Sequelize Model)**: Là đối tượng đại diện và **ánh xạ trực tiếp tới một bảng (Table) trong Cơ sở dữ liệu quan hệ**. Model chứa các thuộc tính ánh xạ cột, định kiểu SQL, các phương thức truy vấn (`findAll`, `create`, `findByPk`) và các quan hệ liên kết (Associations: `hasMany`, `belongsTo`).

### 2. Vì sao Controller cần `await` sau khi đổi Service?
* Khi chuyển từ mảng bộ nhớ RAM sang SQL Server, các thao tác đọc/ghi CSDL là các tác vụ I/O qua mạng nên các hàm Service trở thành **hàm bất đồng bộ (async)** và trả về một `Promise`.
* Nếu Controller không dùng từ khóa `await`, hàm sẽ không chờ kết quả từ CSDL mà lập tức thực thi dòng lệnh gửi response JSON tiếp theo. Kết quả là dữ liệu gửi về Client sẽ là một đối tượng `Promise {}` chưa hoàn thành thay vì dữ liệu thật hoặc phát sinh lỗi xử lý sau khi response đã đóng.

### 3. Vì sao restart server không dùng để reset test nữa?
* Ở bài trước (Chương 2), dữ liệu nằm trong bộ nhớ RAM của tiến trình Node.js, nên mỗi khi tắt server (Ctrl+C) và bật lại, bộ nhớ RAM được khởi tạo lại từ đầu với mảng mẫu.
* Ở bài này (Chương 3/Buổi 4), dữ liệu đã được **lưu trữ bền vững (Persistent Storage)** trong file dữ liệu của SQL Server trên ổ đĩa cứng. Khi Node.js tắt và bật lại, dữ liệu trong CSDL vẫn giữ nguyên vẹn. Do đó, muốn chạy lại kịch bản test từ đầu, cần dùng mã sinh viên mới hoặc dùng script SQL quản trị để dọn dẹp dữ liệu kiểm thử.

### 4. Primary Key (PK) bảo vệ chống trùng mã thế nào?
* Ở tầng ứng dụng, Service đã kiểm tra trước bằng `SinhVien.findByPk(maSV)` để trả về lỗi 409 nếu mã đã có.
* Tuy nhiên, nếu có hai request gửi lên gần như đồng thời (Race Condition), cả hai có thể vượt qua bước kiểm tra của Service. Lúc này, **ràng buộc Khóa chính (PRIMARY KEY constraint)** tại tầng CSDL SQL Server sẽ chặn đứng hành động chèn bản ghi thứ hai và kích hoạt lỗi `UniqueConstraintError`. Khối `try/catch` trong Service sẽ bắt lỗi này và chuẩn hóa thành phản hồi `HTTP 409 Conflict`, đảm bảo tính toàn vẹn dữ liệu tuyệt đối.

### 5. Tại sao POST và GET phải đọc/ghi cùng nguồn dữ liệu?
* Để đảm bảo **tính nhất quán của dữ liệu (Data Consistency)** trong toàn bộ hệ thống.
* Nếu `POST` ghi vào CSDL SQL Server nhưng `GET` lại đọc từ mảng trong RAM (hoặc ngược lại), người dùng sau khi thêm sinh viên thành công sẽ không thể nhìn thấy sinh viên đó trong danh sách, dẫn đến hiện tượng sai lệch dữ liệu nghiêm trọng và vi phạm hợp đồng API.
