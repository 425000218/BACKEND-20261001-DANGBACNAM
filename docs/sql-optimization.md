# BÁO CÁO PHÂN TÍCH & ĐO LƯỜNG TỐI ƯU HÓA TRUY VẤN SQL (SQL-OPTIMIZATION.MD)
## CHƯƠNG 09: KIỂM THỬ, BẢO MẬT & TRIỂN KHAI HỆ THỐNG BACKEND

Dự án: **backend-quan-ly-sinh-vien**  
Cơ sở dữ liệu: **Microsoft SQL Server (SQLEXPRESS / Port 14333) - QuanLySinhVienDB**  
Công cụ đo lường: **SQL Server Management Studio (SSMS) & sqlcmd (STATISTICS IO, TIME ON)**  
Sinh viên thực hiện: **Đặng Bắc Nam**  
Thời điểm đo lường: **2026-10-30**

---

## 1. Mục Tiêu & Phương Pháp Đo Lường

### 1.1. Mục tiêu
- Khảo sát và đo lường trực tiếp câu lệnh truy vấn danh sách sinh viên có tìm kiếm theo họ tên (`WHERE hoTen LIKE N'%Anh%'`).
- So sánh hiệu năng giữa phương pháp truy vấn ban đầu (SELECT toàn bộ cột, quét bảng) với phương pháp tối ưu hóa (Chiếu đúng 4 cột cần thiết, sắp xếp cố định theo khóa chính `maSV` và phân trang tại Database với mệnh đề `OFFSET/FETCH`).

### 1.2. Lệnh thiết lập đo lường trong SQL Server
```sql
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Chạy câu lệnh truy vấn cần kiểm tra

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
```

---

## 2. Câu Lệnh Truy Vấn Trước & Sau Tối Ưu

### Câu lệnh 1 (Trước tối ưu - Quét dữ liệu và nạp toàn bộ cột)
```sql
SELECT *
FROM dbo.SinhVien
WHERE hoTen LIKE N'%Anh%';
```

### Câu lệnh 2 (Sau tối ưu - Chỉ định cột cụ thể, sắp xếp ổn định và phân trang)
```sql
SELECT maSV, hoTen, email, maLop
FROM dbo.SinhVien
WHERE hoTen LIKE N'%Anh%'
ORDER BY maSV ASC
OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY;
```

---

## 3. Bảng Số Liệu Đo Lường Thực Tế (STATISTICS IO & TIME)

| Chỉ tiêu đo lường | Phiên bản Chưa Tối Ưu (Query 1) | Phiên bản Đã Tối Ưu (Query 2) | Nhận xét & Đánh giá kỹ thuật |
|---|:---:|:---:|---|
| **Số dòng dữ liệu trả về** | 3 bản ghi (toàn bộ kết quả lọc) | 2 bản ghi (đúng trang 1 limit 2) | Giảm số lượng bản ghi truyền tải qua mạng Node.js – SQL Server. |
| **Thứ tự bản ghi** | Tự nhiên theo Clustered Index | Cố định tăng dần theo `maSV` | Đảm bảo tính tất định (Deterministic) giữa các trang. |
| **Logical Reads (Số trang đọc logic)** | 2 trang | 2 trang | Đọc trực tiếp trên bộ nhớ đệm (Buffer Cache) của SQL Server. |
| **Physical Reads (Số trang đọc vật lý)** | 1 trang | 1 trang | Lần chạy đầu tiên nạp trang dữ liệu từ ổ đĩa vào RAM. |
| **CPU Time** | 0 ms | 0 ms | Thời gian xử lý của bộ vi xử lý cực nhanh trên tập dữ liệu mẫu. |
| **Elapsed Time (Thời gian thực thi)** | 1 ms | 1 ms | Độ trễ thực thi tại SQL Server xấp xỉ 1 ms. |
| **Thời gian đo từ Node.js client** | ~ 4.2 ms | ~ 3.1 ms | Tiết kiệm thời gian parse JSON và serialization đối tượng. |
| **Execution Plan (Kế hoạch thực thi)** | Clustered Index Scan | Clustered Index Scan + Top (RowCount: 2) | Query 2 bổ sung toán tử `Top` dừng đọc ngay khi đủ số bản ghi của trang. |
| **Tính bảo toàn dữ liệu** | Mốc chuẩn gốc | Bảo toàn đầy đủ dữ liệu | Các bản ghi trả về chính xác thuộc tập kết quả lọc. |

---

## 4. Phân Tích Kỹ Thuật & Đánh Giá Đề Xuất Của AI

### 4.1. Điểm nghẽn tiềm ẩn của truy vấn cũ
- **Lạm dụng `SELECT *`**: Truy vấn toàn bộ các cột trong bảng (kể cả những cột không cần hiển thị) gây lãng phí băng thông mạng và bộ nhớ đệm, đặc biệt khi schema sau này có thể bổ sung các cột kiểu dữ liệu lớn (`NVARCHAR(MAX)`, `VARBINARY`).
- **Thiếu phân trang tại tầng Database**: Khi số lượng sinh viên tăng lên hàng chục ngàn bản ghi, việc trả về toàn bộ mảng kết quả khiến máy chủ Node.js bị quá tải bộ nhớ và nghẽn I/O.
- **Thiếu `ORDER BY` rõ ràng**: Khi sử dụng `OFFSET/FETCH` mà không có `ORDER BY maSV`, SQL Server sẽ báo lỗi cú pháp hoặc cho ra thứ tự không đồng nhất giữa các lần truy vấn.

### 4.2. Đánh giá đề xuất tối ưu hóa
- **Đề xuất của AI**: Chỉ chọn 4 cột cụ thể (`maSV`, `hoTen`, `email`, `maLop`), kết hợp với `ORDER BY maSV ASC` và `OFFSET ... ROWS FETCH NEXT ... ROWS ONLY`.
- **Đánh giá thực tế**:
  - Với tập dữ liệu thử nghiệm nhỏ (5–10 sinh viên), thời gian CPU và Elapsed Time đo được là 0–1 ms, sự khác biệt về thời gian chưa rõ rệt do dữ liệu đã nằm gọn trong một vài data page của SQL Server.
  - Tuy nhiên, về mặt kiến trúc, câu lệnh tối ưu đã chèn thêm toán tử `Top` vào Execution Plan, giúp SQL Server dừng quét ngay khi đạt đủ số lượng bản ghi của trang hiện tại thay vì phải duyệt hết bảng dữ liệu.
  - Kết hợp với toán tử `[Op.like]` có tham số hóa, câu lệnh ngăn chặn triệt để SQL Injection so với phương pháp ghép chuỗi trực tiếp.
