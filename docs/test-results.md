# Báo Cáo Kết Quả Kiểm Thử (12 Test Cases) - Buổi 5
## Dự án: Quản lý sinh viên - RESTful CRUD & Swagger UI

* **Môi trường thực hiện**: Windows, Node.js v24, Express 5, TypeScript ESM, Sequelize 6, SQL Server local.
* **Cơ sở dữ liệu**: `QuanLySinhVienDB` (SQL Server), bảng `dbo.SinhVien`.
* **Cổng dịch vụ**: `http://localhost:5000`
* **Công cụ kiểm thử**: Postman Desktop v2.1 & Swagger UI (`/api-docs`).

---

## 1. Bảng tổng hợp kết quả 12 test cases bắt buộc

| ID | Điều kiện / Thao tác | Method & URL | Body gửi lên | Status kỳ vọng | Status thực tế | Kết quả | GET kiểm chứng / Ghi chú |
|---|---|---|---|---|---|---|---|
| **T01** | Lấy danh sách ban đầu | `GET /api/v1/sinh-vien` | *None* | 200 | 200 | **PASS** | `data` là mảng (gồm các SV mẫu `SV001`, `SV002`). |
| **T02** | Thêm mới `SV003` hợp lệ | `POST /api/v1/sinh-vien` | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 201 | 201 | **PASS** | `data.maSV` = `"SV003"`. Chuẩn bị cho các test tiếp theo. |
| **T03** | Thêm lại `SV003` lần 2 (Trùng mã) | `POST /api/v1/sinh-vien` | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 409 | 409 | **PASS** | Bị từ chối bởi Primary Key SQL Server: `"Mã sinh viên đã tồn tại"`. |
| **T04** | Thêm mã mới nhưng thiếu `hoTen` | `POST /api/v1/sinh-vien` | `{"maSV":"SV004","email":"thunghiem@example.com","maLop":"25CT114"}` | 400 | 400 | **PASS** | Validation chặn: không tạo bản ghi rác trong CSDL. |
| **T05** | Xem chi tiết `SV003` sau khi tạo | `GET /api/v1/sinh-vien/SV003` | *None* | 200 | 200 | **PASS** | Đọc thấy đủ 4 trường từ SQL Server: `maSV`, `hoTen`, `email`, `maLop`. |
| **T06** | Cập nhật `SV003` đủ 3 trường hợp lệ | `PUT /api/v1/sinh-vien/SV003` | `{"hoTen":"Ngọc Mai Updated","email":"ngocmai@example.com","maLop":"25CT114"}` | 200 | 200 | **PASS** | GET lại xác nhận: `hoTen` đã đổi thành `"Ngọc Mai Updated"`. |
| **T07** | Cập nhật `SV003` thiếu trường `email` | `PUT /api/v1/sinh-vien/SV003` | `{"hoTen":"Ngọc Mai Changed","maLop":"25CT114"}` | 400 | 400 | **PASS** | Bị từ chối. GET lại kiểm chứng: dữ liệu cũ của `SV003` vẫn được bảo toàn. |
| **T08** | Cập nhật mã `SV9999` không tồn tại | `PUT /api/v1/sinh-vien/SV9999` | `{"hoTen":"Non Existing","email":"non@example.com","maLop":"25CT114"}` | 404 | 404 | **PASS** | Báo lỗi `"Không tìm thấy sinh viên"`, không sinh thêm mã mới. |
| **T09** | Tìm kiếm mã `SV9999` không có | `GET /api/v1/sinh-vien/SV9999` | *None* | 404 | 404 | **PASS** | Phản hồi `{"success":false,"message":"Không tìm thấy sinh viên"}`. |
| **T10** | Xóa sinh viên `SV003` | `DELETE /api/v1/sinh-vien/SV003` | *None* | 200 | 200 | **PASS** | Phản hồi `{"success":true,"message":"Xóa sinh viên thành công"}` (không có `data`). |
| **T11** | Kiểm chứng `SV003` sau khi xóa | `GET /api/v1/sinh-vien/SV003` | *None* | 404 | 404 | **PASS** | **Chứng minh bản ghi đã thực sự bị xóa khỏi SQL Server**. |
| **T12** | Xóa lại `SV003` lần 2 | `DELETE /api/v1/sinh-vien/SV003` | *None* | 404 | 404 | **PASS** | Trả về 404 hợp lệ vì bản ghi không còn tồn tại trong hệ thống. |

---

## 2. Chi tiết và Phân tích chuyên sâu từng ca kiểm thử

### Ca kiểm thử T06 & T07 (Quy tắc nghiệp vụ PUT)
* **T06**: Khi gửi request `PUT /api/v1/sinh-vien/SV003` với đầy đủ 3 trường hợp lệ (`hoTen`, `email`, `maLop`), server cập nhật thông tin trong SQL Server và trả về status `200 OK`. 
* **T07**: Khi gửi PUT thiếu trường `email`, server lập tức bắt lỗi tại tầng Service validation và trả về `400 Bad Request`. Tiếp tục gọi `GET /api/v1/sinh-vien/SV003` kiểm chứng lại thì thấy họ tên của sinh viên không bị thay đổi thành `"Ngọc Mai Changed"`, chứng minh nghiệp vụ bảo toàn dữ liệu khi có lỗi xảy ra.

### Ca kiểm thử T10, T11 & T12 (Quy tắc nghiệp vụ DELETE)
* **T10**: Gửi `DELETE /api/v1/sinh-vien/SV003`, server thực hiện lệnh xóa trong database và trả về status `200 OK` cùng thông báo `"Xóa sinh viên thành công"`.
* **T11**: **Đây là bước kiểm chứng quan trọng nhất**. Gọi tiếp `GET /api/v1/sinh-vien/SV003`, kết quả trả về `404 Not Found`. Điều này chứng minh rằng dữ liệu đã thực sự được xóa khỏi CSDL SQL Server chứ không phải chỉ là phản hồi JSON giả mạo.
* **T12**: Gọi lại `DELETE /api/v1/sinh-vien/SV003` lần thứ hai, server trả về `404 Not Found`. Đây là kết quả **PASS** hoàn toàn chính xác theo nguyên tắc thiết kế RESTful API (tài nguyên không còn tồn tại để xóa).

---

## 3. Kết luận
* Toàn bộ 12 ca kiểm thử đều đạt kết quả **PASS 100%**.
* Hệ thống xử lý chính xác các mã trạng thái HTTP chuẩn mực: `200`, `201`, `400`, `404`, `409`.
* Dữ liệu được lưu trữ và thao tác trực tiếp trên CSDL SQL Server, đảm bảo tính toàn vẹn và nhất quán.
