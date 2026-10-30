# GIÁO TRÌNH THỰC HÀNH · LẬP TRÌNH BACKEND

# CHƯƠNG 08: TRUY VẤN NÂNG CAO & PHÂN TRANG - XỬ LÝ LỖI TẬP TRUNG

## SEQUELIZE · SQL SERVER · EXPRESS 5 · REACT

### Nối tiếp Hệ thống Quản lý Sinh viên từ Chương 06 & Chương 07

---

## MỤC LỤC

1. [01 / ĐỊNH HƯỚNG: Mục tiêu và Chuẩn đầu ra](#01--định-hướng-mục-tiêu-và-chuẩn-đầu-ra)
2. [02 / HỢP ĐỒNG API: Chuẩn hóa Phân trang & Cấu trúc Phản hồi](#02--hợp-đồng-api-chuẩn-hóa-phân-trang--cấu-trúc-phản-hồi)
3. [03 / LAB 1: Phân trang (Pagination) & Tìm kiếm (Search) với Sequelize](#03--lab-1-phân-trang-pagination--tìm-kiếm-search-với-sequelize)
4. [04 / LAB 2: Xử lý Lỗi Tập trung (Centralized Error Handling) & AppError](#04--lab-2-xử-lý-lỗi-tập-trung-centralized-error-handling--apperror)
5. [05 / BÀI TẬP MỞ RỘNG: Raw Query, Stored Procedure, Group/Count & JOIN](#05--bài-tập-mở-rộng-raw-query-stored-procedure-groupcount--join)
6. [06 / TÍCH HỢP FRONTEND: Giao diện React Phân trang & Tìm kiếm](#06--tích-hợp-frontend-giao-diện-react-phân-trang--tìm-kiếm)
7. [07 / TÀI LIỆU API: Cập nhật Swagger OpenAPI 3.0](#07--tài-liệu-api-cập-nhật-swagger-openapi-30)
8. [08 / DANH MỤC KIỂM THỬ: Postman Collection & Kiểm thử Tự động](#08--danh-mục-kiểm-thử-postman-collection--kiểm-thử-tự-động)
9. [09 / CÂU HỎI BẢO VỆ BÀI THỰC HÀNH](#09--câu-hỏi-bảo-vệ-bài-thực-hành)

---

## 01 / ĐỊNH HƯỚNG: Mục tiêu và Chuẩn đầu ra

Bài thực hành tiếp nối trực tiếp từ hệ thống Quản lý Sinh viên (Node.js/Express 5, TypeScript ESM, SQL Server, Sequelize ORM, React Vite).

### Mục tiêu kỹ thuật:
- **Lab 1 - Phân trang & Tìm kiếm**:
  - Triển khai phân trang chuẩn qua query parameters `page` (trang hiện tại, mặc định 1) và `limit` (số lượng bản ghi/trang, mặc định 10, tối đa 50).
  - Tích hợp tính năng lọc/tìm kiếm gần đúng theo họ tên sinh viên qua query parameter `search` với toán tử `Op.like` `%search%`.
  - Áp dụng phương thức `findAndCountAll` của Sequelize để trả về đồng thời danh sách dữ liệu và metadata phân trang (`totalItems`, `totalPages`, `page`, `limit`).
- **Lab 2 - Xử lý Lỗi Tập trung**:
  - Định nghĩa lớp lỗi nghiệp vụ tùy biến `AppError` kế thừa từ `Error` nguyên bản của JavaScript.
  - Xây dựng middleware xử lý lỗi tập trung `errorHandler` 4 tham số `(err, req, res, next)`.
  - Phân loại chính xác các mã trạng thái HTTP: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error).
  - Che giấu chi tiết ngăn xếp (stack trace) của lỗi 500 khi ở môi trường production (`NODE_ENV === 'production'`) nhằm bảo mật an toàn thông tin máy chủ.
- **Phần mở rộng**:
  - Thực thi truy vấn SQL nguyên bản (Raw Query) tổng hợp thống kê số lượng sinh viên theo từng lớp.
  - Xây dựng và thực thi Stored Procedure `sp_ThongKeSinhVienTheoLop` trên SQL Server.
  - Sử dụng phương thức gom nhóm và đếm bản ghi của Sequelize (`GROUP BY` & `COUNT`).
  - Áp dụng kỹ thuật nối bảng Eager Loading (`include`) giữa Model `SinhVien` và `Lop`.

---

## 02 / HỢP ĐỒNG API: Chuẩn hóa Phân trang & Cấu trúc Phản hồi

### 1. Phản hồi thành công GET `/api/v1/sinh-vien?page=1&limit=2&search=Anh`
Mã trạng thái: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "maSV": "SV002",
      "hoTen": "Nguyễn Lan Anh",
      "email": "lananh@example.com",
      "maLop": "CNTT01"
    },
    {
      "maSV": "SV004",
      "hoTen": "Nguyễn Tuấn Anh",
      "email": "tuananh@example.com",
      "maLop": "CNTT02"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "totalItems": 3,
    "totalPages": 2
  }
}
```

### 2. Phản hồi lỗi chuẩn tắc
```json
{
  "success": false,
  "status": 404,
  "message": "Không tìm thấy sinh viên",
  "data": null
}
```

---

## 03 / LAB 1: Phân trang (Pagination) & Tìm kiếm (Search) với Sequelize

### 1. Validation Query Parameters (`src/validations/sinhVien.query.ts`)
- Kiểm tra `page`: Phải là số nguyên dương $\ge 1$.
- Kiểm tra `limit`: Phải là số nguyên dương trong khoảng $[1, 50]$.
- Kiểm tra `search`: Chuỗi văn bản, cắt bỏ khoảng trắng thừa (trim), độ dài tối đa 80 ký tự.

### 2. Xử lý Service (`src/services/sinhVien.service.ts`)
```typescript
const where: WhereOptions = {};
if (query.search && query.search.trim() !== '') {
  where.hoTen = { [Op.like]: `%${query.search.trim()}%` };
}

const { count, rows } = await SinhVien.findAndCountAll({
  where,
  limit: query.limit,
  offset: (query.page - 1) * query.limit,
  order: [['maSV', 'ASC']]
});
```

---

## 04 / LAB 2: Xử lý Lỗi Tập trung (Centralized Error Handling) & AppError

### 1. Lớp lỗi nghiệp vụ `AppError` (`src/middlewares/error.middleware.ts`)
```typescript
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### 2. Middleware `errorHandler`
- Bắt lỗi `AppError` và trả về `status: err.statusCode`.
- Bắt lỗi `SyntaxError` (JSON hỏng từ client) trả `400 Bad Request`.
- Bắt lỗi không mong muốn (500):
  - Môi trường development: Trả `message` gốc kèm `stack`.
  - Môi trường production: Che giấu chi tiết kỹ thuật, trả thông điệp `"Lỗi hệ thống, vui lòng thử lại sau"`, không trả `stack`.
- Kiểm tra `res.headersSent` trước khi gửi phản hồi.

---

## 05 / BÀI TẬP MỞ RỘNG: Raw Query, Stored Procedure, Group/Count & JOIN

1. **Raw SQL Query**:
   ```sql
   SELECT l.maLop, l.tenLop, COUNT(sv.maSV) AS soLuongSinhVien
   FROM dbo.Lop l
   LEFT JOIN dbo.SinhVien sv ON l.maLop = sv.maLop
   GROUP BY l.maLop, l.tenLop
   ```
2. **Stored Procedure**:
   Tạo thủ tục `dbo.sp_ThongKeSinhVienTheoLop` trong CSDL `QuanLySinhVienDB` và cấp quyền thực thi `GRANT EXECUTE TO sv_app`.
3. **Sequelize Group & Count**:
   Sử dụng `SinhVien.findAll` kết hợp thuộc tính `attributes: ['maLop', [sequelize.fn('COUNT', sequelize.col('maSV')), 'soLuong']]`, `group: ['maLop']`.
4. **Eager Loading JOIN**:
   Sử dụng `SinhVien.findAll({ include: [{ model: Lop, attributes: ['tenLop'] }] })`.

---

## 06 / TÍCH HỢP FRONTEND: Giao diện React Phân trang & Tìm kiếm

- Tệp component: `frontend/src/components/SinhVienTable.tsx`
- Bổ sung ô nhập liệu tìm kiếm theo họ tên (Debounced/Controlled input). Khi thay đổi từ khóa, tự động quay lại trang 1.
- Thanh công cụ phân trang:
  - Nút chuyển trang **Trang trước (Previous)** và **Trang sau (Next)** có trạng thái `disabled` tương ứng ở đầu và cuối danh sách.
  - Nhãn hiển thị tiến trình: `"Trang X / Y (Tổng số: Z sinh viên)"`.
  - Hộp chọn số lượng bản ghi hiển thị trên mỗi trang (`2, 5, 10, 20/trang`).

---

## 07 / TÀI LIỆU API: Cập nhật Swagger OpenAPI 3.0

- Tệp đặc tả: `docs/openapi.yaml`
- Bổ sung các query parameters `page`, `limit`, `search` cho tuyến đường `GET /api/v1/sinh-vien`.
- Cập nhật schema phản hồi 200 bao gồm object `pagination` và mảng `data`.
- Khai báo schema phản hồi lỗi chuẩn 400 Bad Request khi tham số phân trang không hợp lệ.

---

## 08 / DANH MỤC KIỂM THỬ: Postman Collection & Kiểm thử Tự động

- File Postman Collection: `docs/Chuong08-Pagination-Error.postman_collection.json`
- Script kiểm thử tự động: `src/scripts/run-chapter8-tests.ts`
- Bao quát đầy đủ các tình huống:
  - **P01 - P05**: Phân trang mặc định, trang 1, trang 2, giới hạn bản ghi.
  - **P06 - P11**: Tìm kiếm họ tên sinh viên (tìm thấy, rỗng, kết hợp phân trang, phân biệt ký tự).
  - **P12 - P17**: Kiểm tra lỗi tham số phân trang (`page <= 0`, `limit <= 0`, `limit > 50`, `page` chữ).
  - **E01 - E04**: Xử lý lỗi 404 không tìm thấy sinh viên và đường dẫn không tồn tại.
  - **E05 - E07**: Lỗi 400 JSON hỏng và lỗi 500 che giấu thông tin nội bộ.
  - **E08 - E10**: Bảo vệ xác thực 401 và phân quyền 403.
  - **X01 - X04**: Kiểm tra 4 phương thức truy vấn nâng cao (Raw SQL, Group/Count, Stored Procedure, JOIN).

---

## 09 / CÂU HỎI BẢO VỆ BÀI THỰC HÀNH

1. **Tại sao nên sử dụng `findAndCountAll` thay vì gọi riêng `count()` rồi mới `findAll()`?**
   *Trả lời*: `findAndCountAll` thực hiện tối ưu hóa truy vấn trong một lần gọi ORM, giảm độ trễ I/O mạng giữa Node.js và SQL Server, đồng thời bảo đảm tính nhất quán của dữ liệu (tránh tình trạng bản ghi bị thêm/xóa ở giữa 2 truy vấn riêng biệt).
2. **Toán tử `Op.like` hoạt động thế nào trên SQL Server với dữ liệu Unicode?**
   *Trả lời*: Khi truyền chuỗi tìm kiếm, Sequelize ánh xạ sang cú pháp SQL Server `LIKE N'%từ_khóa%'`. Với kiểu dữ liệu `NVARCHAR` và Collation phù hợp của SQL Server, phép so sánh xử lý tốt tiếng Việt có dấu và không phân biệt chữ hoa chữ thường.
3. **Tại sao phải che giấu stack trace của lỗi 500 ở môi trường Production?**
   *Trả lời*: Stack trace chứa chi tiết cấu trúc thư mục, phiên bản thư viện, tên tệp và dòng code cụ thể. Kẻ tấn công có thể khai thác các thông tin này (Information Disclosure) để tìm kiếm các lỗ hổng đã biết nhằm tấn công hệ thống.
4. **Phân biệt tính năng của Stored Procedure và ORM trong hệ thống doanh nghiệp?**
   *Trả lời*: Stored Procedure được biên dịch và tối ưu hóa sẵn kế hoạch thực thi (execution plan) trên SQL Server, thích hợp cho các tác vụ tổng hợp dữ liệu lớn và báo cáo phức tạp. ORM (Sequelize) mang lại tính trừu tượng hóa, dễ bảo trì, sinh mã an toàn chống SQL Injection và tăng tốc độ phát triển cho các tác vụ CRUD thông thường.
