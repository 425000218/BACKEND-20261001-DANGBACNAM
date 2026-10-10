# Nhật Ký Prompt & Kỹ Năng Prompt Engineering (Buổi 5)
## Phương pháp Vibe Coding theo khung CTCO (Context - Task - Constraint - Output)

---

## 1. Khung Prompt Engineering CTCO là gì?
* **C - Context (Bối cảnh)**: Mô tả dự án hiện tại, công nghệ đang dùng, cấu trúc thư mục, các file hiện có.
* **T - Task (Nhiệm vụ)**: Nêu rõ tác vụ cụ thể cần AI thực hiện (chỉ làm một việc tại một thời điểm).
* **C - Constraint (Ràng buộc)**: Đặt ra các giới hạn kỹ thuật nghiêm ngặt (không đổi kiến trúc, không đổi nguồn dữ liệu, giữ mã lỗi HTTP, giữ DTO,...).
* **O - Output (Đầu ra)**: Định rõ định dạng kết quả mong muốn (code đầy đủ, bảng phân tích, lệnh kiểm thử).

---

## 2. Nhật ký Prompt thực tế các bước phát triển

### 📝 Prompt 1: Bổ sung chức năng cập nhật (PUT)
* **Context**: Dự án Quản lý sinh viên Express 5 + TypeScript ESM NodeNext, kết nối SQL Server qua Sequelize 6. Đã có 3 API: GET list, GET detail, POST.
* **Task**: Bổ sung chức năng `PUT /api/v1/sinh-vien/:maSV` để cập nhật thông tin sinh viên hiện có.
* **Constraint**: 
  - Lấy `maSV` từ URL `req.params`. Body chỉ nhận đúng 3 trường: `hoTen`, `email`, `maLop` (không cho đổi `maSV` qua body).
  - Validate: chuỗi không rỗng sau trim, regex email, giới hạn độ dài SQL (`hoTen <= 150`, `email <= 254`, `maLop <= 50`). Sai trả HTTP 400.
  - Không tìm thấy sinh viên trả HTTP 404. Cập nhật thành công trả HTTP 200 kèm DTO sinh viên vừa sửa.
  - Giữ nguyên kiến trúc Route $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Model.
* **Output**: Cung cấp đoạn code thay đổi trong `sinhVien.service.ts`, `sinhVien.controller.ts`, `sinhVien.routes.ts` và hướng dẫn kiểm thử Postman.
* **Đánh giá & Kết quả**: AI sinh code đúng chuẩn, Controller sử dụng `await`, kiểm thử T06 (200) và T07 (400) hoạt động chính xác.

---

### 📝 Prompt 2: Bổ sung chức năng xóa (DELETE)
* **Context**: Tiếp tục dự án Quản lý sinh viên trên.
* **Task**: Bổ sung `DELETE /api/v1/sinh-vien/:maSV`.
* **Constraint**: 
  - Lấy `maSV` từ URL, không nhận body.
  - Tìm sinh viên qua `SinhVien.findByPk(maSV)`, nếu không thấy trả HTTP 404.
  - Xóa qua `sv.destroy()`, xóa thành công trả HTTP 200 với `{ "success": true, "message": "Xóa sinh viên thành công" }` (không trả trường `data`).
* **Output**: Code bổ sung cho 3 tầng và các bước kiểm thử GET lại để kiểm chứng.
* **Đánh giá & Kết quả**: Thao tác xóa thực hiện an toàn trên SQL Server, GET lại trả 404 chứng minh bản ghi đã bị xóa vĩnh viễn.

---

### 📝 Prompt 3: Tạo file đặc tả OpenAPI YAML riêng biệt
* **Context**: Đã có đủ 5 API CRUD sinh viên hoạt động đúng.
* **Task**: Tạo file `docs/openapi.yaml` chuẩn OpenAPI 3.0.3 mô tả trọn vẹn 5 API.
* **Constraint**:
  - Tách thành file `.yaml` riêng, không sử dụng Swagger JSDoc comment trong code TypeScript.
  - Tái sử dụng `components/schemas` và `components/responses` với `$ref`.
  - Mô tả chính xác các status code: 200, 201, 400, 404, 409, 500.
* **Output**: Toàn bộ file `docs/openapi.yaml` hoàn chỉnh, thụt lề chuẩn YAML (không dùng Tab).

---

### 📝 Prompt 4: Tích hợp Swagger UI vào Express Server
* **Context**: Đã có file `docs/openapi.yaml`.
* **Task**: Tích hợp Swagger UI tại endpoint `/api-docs`.
* **Constraint**:
  - Tạo `src/config/swagger.config.ts` sử dụng `js-yaml` để đọc file YAML an toàn.
  - Sử dụng `swagger-ui-express` trong `src/server.ts`, đặt trước middleware xử lý 404.
  - Giữ chuẩn TypeScript ESM NodeNext (import `.js`).
* **Output**: Code hoàn chỉnh cho `swagger.config.ts` và đoạn gắn route trong `server.ts`.

---

## 3. Bài tự viết prompt mở rộng (Không sao chép)

### Yêu cầu mở rộng: Thêm chức năng tìm kiếm sinh viên theo mã lớp
```text
CONTEXT: 
Dự án Quản lý sinh viên Express 5 + TypeScript ESM, kết nối SQL Server bảng dbo.SinhVien qua Sequelize Model SinhVien. Hệ thống đã có đủ 5 API CRUD cơ bản.

TASK: 
Bổ sung thêm một API tìm kiếm danh sách sinh viên theo mã lớp: GET /api/v1/sinh-vien/lop/:maLop.

CONSTRAINT:
1. Endpoint: GET /api/v1/sinh-vien/lop/:maLop, maLop lấy từ req.params.
2. Service: Sử dụng SinhVien.findAll({ where: { maLop }, order: [['maSV', 'ASC']] }).
3. Phản hồi: Luôn trả HTTP 200 với data là mảng các sinh viên thuộc lớp đó (nếu lớp chưa có sinh viên nào thì trả mảng rỗng []).
4. Không làm ảnh hưởng hoặc xung đột với route GET /:maSV hiện tại (lưu ý thứ tự đăng ký route trong sinhVien.routes.ts để tránh hiểu nhầm 'lop' là maSV).
5. Giữ nguyên toàn bộ 5 API CRUD cũ và cấu trúc DTO hiện có.

OUTPUT:
Cung cấp code cần sửa trong sinhVien.service.ts, sinhVien.controller.ts, sinhVien.routes.ts và một test case Postman mẫu để kiểm thử.
```

* **Giải thích lý do chọn endpoint**: Đặt là `/api/v1/sinh-vien/lop/:maLop` và khai báo trước `/:maSV` trong Express Router để phân biệt rõ ràng giữa việc tìm kiếm theo mã sinh viên cụ thể (`:maSV`) và lọc theo tiêu chí lớp (`lop/:maLop`), tránh trường hợp Express hiểu nhầm chuỗi chữ `"lop"` là một mã sinh viên.

---

## 4. Trả lời 6 câu hỏi vấn đáp cốt lõi

### 1. Request PUT đi qua những file nào trong dự án?
Request `PUT /api/v1/sinh-vien/:maSV` đi qua tuần tự theo luồng phân tầng:
1. **`src/server.ts`**: Tiếp nhận request, đi qua các middleware (`logger`, `helmet`, `cors`, `express.json`) và chuyển tiếp tới router `/api/v1/sinh-vien`.
2. **`src/routes/sinhVien.routes.ts`**: Khớp method `PUT` và route pattern `/:maSV`, chuyển request tới hàm `capNhatSinhVien` của Controller.
3. **`src/controllers/sinhVien.controller.ts`**: Trích xuất `maSV` từ `req.params` và dữ liệu từ `req.body`, gọi `await capNhatSinhVien(maSV, req.body)`.
4. **`src/services/sinhVien.service.ts`**: Tiếp nhận dữ liệu, thực hiện validation nghiệp vụ, tìm bản ghi và gọi Sequelize Model `sv.update({ hoTen, email, maLop })`.
5. **`src/models/SinhVien.ts` & SQL Server**: Sinh câu lệnh SQL `UPDATE dbo.SinhVien SET ... WHERE maSV = ...` và thực thi trên database.
6. Sau khi CSDL phản hồi, Service trả về DTO $\rightarrow$ Controller đón và trả về JSON `200 OK` cho Client.

### 2. Vì sao gọi `GET` sau khi `DELETE` trả về 404 là một test đạt?
* Vì mục đích của thao tác `DELETE` là xóa bỏ hoàn toàn tài nguyên khỏi hệ thống.
* Việc gọi `GET /api/v1/sinh-vien/:maSV` ngay sau đó và nhận về mã lỗi `404 Not Found` đóng vai trò là **bằng chứng kiểm chứng độc lập (verification)**, xác nhận bản ghi thực sự không còn tồn tại trong CSDL. Nếu GET vẫn trả về 200 nghĩa là thao tác xóa bị lỗi hoặc chỉ là xóa giả lập trong bộ nhớ.

### 3. File Swagger YAML (`docs/openapi.yaml`) có tự xử lý nghiệp vụ Backend không?
* **Không**. File YAML chỉ đóng vai trò là **tài liệu đặc tả hợp đồng (API Contract Specification)**.
* Nó mô tả cho lập trình viên và Client biết API có những endpoint nào, nhận dữ liệu gì và trả về cấu trúc ra sao. Việc kiểm tra tính hợp lệ của dữ liệu, truy vấn database và xử lý logic nghiệp vụ thực tế hoàn toàn do mã nguồn Backend (Service, Controller, Sequelize) đảm nhiệm.

### 4. Vì sao phải gọi `GET` lại sau mỗi thao tác ghi (POST, PUT, DELETE)?
* Một API có thể trả về phản hồi HTTP `200` hoặc `201` giả mạo (hardcoded JSON) ngay cả khi lệnh lưu vào CSDL bị thất bại.
* Gọi `GET` lại sau khi ghi giúp phát hiện trường hợp này, đảm bảo rằng dữ liệu đã thực sự được lưu trữ bền vững và có thể truy xuất chính xác từ database.

### 5. Sau khi restart server Node.js, dữ liệu có còn không?
* **Còn nguyên vẹn**. Vì dự án đã kết nối và lưu trữ trực tiếp vào **Microsoft SQL Server (Persistent Database Storage)** trên ổ đĩa cứng. 
* Khi tiến trình Node.js tắt và bật lại, chỉ có bộ nhớ RAM của ứng dụng được reset, còn các bản ghi trong các bảng CSDL SQL Server vẫn được bảo toàn nguyên vẹn.

### 6. Khung CTCO giúp viết Prompt rõ ràng và hiệu quả như thế nào?
* Giúp chia nhỏ bài toán phức tạp thành các tác vụ đơn mục tiêu.
* Cung cấp đủ **Context** để AI không đoán mò cấu trúc dự án.
* Đặt ra các **Constraint** chặt chẽ ngăn AI tự ý thay đổi kiến trúc hoặc sinh ra code không tương thích.
* Định hướng **Output** chuẩn xác, giúp tiết kiệm thời gian chỉnh sửa và hạn chế tối đa việc phát sinh lỗi tiềm ẩn.
