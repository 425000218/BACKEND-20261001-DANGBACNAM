# Hướng Dẫn Chụp Và Lưu Ảnh Minh Chứng (docs/screenshots/)

Thư mục này dùng để lưu trữ 4 ảnh chụp màn hình minh chứng kết quả kiểm thử phục vụ nộp bài theo yêu cầu của Buổi 5 / Chương 4:

---

### 📸 1. `swagger-operations.png`
* **Mục đích**: Minh chứng giao diện tài liệu Swagger UI đã được tích hợp thành công.
* **Cách chụp**: Mở trình duyệt tại địa chỉ `http://localhost:5000/api-docs`. Chụp toàn bộ màn hình hiển thị nhóm **SinhVien** với đầy đủ 5 phương thức: `GET /api/v1/sinh-vien`, `POST /api/v1/sinh-vien`, `GET /api/v1/sinh-vien/{maSV}`, `PUT /api/v1/sinh-vien/{maSV}`, `DELETE /api/v1/sinh-vien/{maSV}`.
* **Lưu file**: `docs/screenshots/swagger-operations.png`.

---

### 📸 2. `post-created.png`
* **Mục đích**: Minh chứng thêm mới sinh viên `SV003` thành công vào CSDL.
* **Cách chụp**: Trên Postman hoặc Swagger UI, gửi request `POST /api/v1/sinh-vien` với body `SV003`. Chụp rõ phần Status `201 Created` và body phản hồi JSON có chứa thông tin `SV003`.
* **Lưu file**: `docs/screenshots/post-created.png`.

---

### 📸 3. `put-verified.png`
* **Mục đích**: Minh chứng cập nhật thông tin và kiểm chứng dữ liệu mới.
* **Cách chụp**: Gửi request `PUT /api/v1/sinh-vien/SV003` với `hoTen: "Ngọc Mai Updated"`, sau đó gửi tiếp `GET /api/v1/sinh-vien/SV003`. Chụp màn hình kết quả GET trả về `200 OK` với họ tên đã được cập nhật thành công.
* **Lưu file**: `docs/screenshots/put-verified.png`.

---

### 📸 4. `deleted-get-404.png`
* **Mục đích**: Minh chứng xóa sinh viên và kiểm chứng bản ghi không còn trong CSDL.
* **Cách chụp**: Gửi `DELETE /api/v1/sinh-vien/SV003` nhận status `200 OK`, sau đó gửi tiếp `GET /api/v1/sinh-vien/SV003`. Chụp màn hình kết quả GET trả về `404 Not Found` (`{"success":false,"message":"Không tìm thấy sinh viên"}`).
* **Lưu file**: `docs/screenshots/deleted-get-404.png`.
