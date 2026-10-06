# BÁO CÁO THỰC HÀNH CHƯƠNG 2
## XÂY DỰNG BACKEND BẰNG VIBE CODING VÀ KIỂM THỬ VỚI POSTMAN

* **Học phần**: Lập trình Backend
* **Dự án**: Quản lý sinh viên với Node.js, Express 5 và TypeScript
* **Môi trường**: Windows, Node.js v24, pnpm v10, tsx, Postman

---

## 1. Cấu trúc thư mục dự án

```text
backend-quan-ly-sinh-vien/
├── package.json                                    # Cấu hình dự án, scripts, dependencies
├── pnpm-lock.yaml                                  # Khóa phiên bản gói cài đặt
├── tsconfig.json                                   # Cấu hình TypeScript (ESM, NodeNext)
├── .env                                            # Cấu hình biến môi trường (PORT=5000)
├── .env.example                                    # Mẫu biến môi trường chia sẻ
├── .gitignore                                      # Loại trừ node_modules, dist, .env
├── Backend_Sinh_Vien_Chuong_2.postman_collection.json # File xuất Collection Postman v2.1
├── src/
│   ├── server.ts                                   # Điểm khởi động server, gắn middleware và router
│   ├── dtos/
│   │   └── sinhVien.dto.ts                         # Định nghĩa kiểu dữ liệu ISinhVienDTO
│   ├── services/
│   │   └── sinhVien.service.ts                     # Tầng nghiệp vụ, validation và lưu trữ mảng
│   ├── controllers/
│   │   └── sinhVien.controller.ts                  # Tiếp nhận HTTP request, gọi Service và trả JSON
│   ├── routes/
│   │   └── sinhVien.routes.ts                      # Định tuyến URL tới Controller tương ứng
│   ├── middlewares/
│   │   ├── logger.middleware.ts                    # Ghi log request (method, URL)
│   │   └── error.middleware.ts                     # Bắt lỗi toàn cục, chuẩn hóa phản hồi lỗi
│   └── utils/
│       └── AppError.ts                             # Lớp định nghĩa lỗi nghiệp vụ kèm statusCode
```

---

## 2. Bảng kết quả kiểm thử (Test Cases T01 - T11)

| ID | Điều kiện & Request | Body gửi lên | Status kỳ vọng | Status thực tế | Kết quả | Body phản hồi thực tế |
|---|---|---|---|---|---|---|
| **T01** | `GET http://localhost:5000/` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Backend quản lý sinh viên đang hoạt động"}` |
| **T02** | `GET http://localhost:5000/api/v1/sinh-vien` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Lấy danh sách sinh viên thành công","data":[{"maSV":"SV001","hoTen":"Minh Nhật","email":"minhnhat@example.com","maLop":"25CT114"},{"maSV":"SV002","hoTen":"Lan Anh","email":"lananh@example.com","maLop":"25CT114"}]}` |
| **T03** | `GET http://localhost:5000/api/v1/sinh-vien/SV001` | Không | 200 | 200 | **PASS** | `{"success":true,"message":"Tìm sinh viên thành công","data":{"maSV":"SV001","hoTen":"Minh Nhật","email":"minhnhat@example.com","maLop":"25CT114"}}` |
| **T04** | `GET http://localhost:5000/api/v1/sinh-vien/SV999` | Không | 404 | 404 | **PASS** | `{"success":false,"message":"Không tìm thấy sinh viên"}` |
| **T05** | `POST http://localhost:5000/api/v1/sinh-vien` (Thêm SV003 lần đầu) | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 201 | 201 | **PASS** | `{"success":true,"message":"Thêm sinh viên thành công","data":{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}}` |
| **T06** | `POST http://localhost:5000/api/v1/sinh-vien` (Thêm lại SV003, chưa restart) | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 409 | 409 | **PASS** | `{"success":false,"message":"Mã sinh viên đã tồn tại"}` |
| **T07** | `POST http://localhost:5000/api/v1/sinh-vien` (Thiếu hoTen với mã mới) | `{"maSV":"SV004","email":"thunghiem@example.com","maLop":"25CT114"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Cần cung cấp đủ 4 trường maSV, hoTen, email, maLop có kiểu chuỗi (string)"}` |
| **T08** | `POST http://localhost:5000/api/v1/sinh-vien` (Email sai với mã mới) | `{"maSV":"SV004","hoTen":"Test","email":"khong-phai-email","maLop":"25CT114"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Email không đúng định dạng"}` |
| **T09** | `POST http://localhost:5000/api/v1/sinh-vien` (Mã kiểu number) | `{"maSV":4,"hoTen":"Test","email":"valid@test.com","maLop":"25CT114"}` | 400 | 400 | **PASS** | `{"success":false,"message":"Cần cung cấp đủ 4 trường maSV, hoTen, email, maLop có kiểu chuỗi (string)"}` |
| **T10** | `POST http://localhost:5000/api/v1/sinh-vien` (JSON hỏng cú pháp) | `{"maSV":"SV004"` | 400 | 400 | **PASS** | `{"success":false,"message":"Dữ liệu JSON gửi lên không đúng cú pháp"}` |
| **T11** | `GET http://localhost:5000/khong-co` (Đường dẫn không tồn tại) | Không | 404 | 404 | **PASS** | `{"success":false,"message":"Không tìm thấy đường dẫn"}` |

---

## 3. Nhật ký Prompt (Vibe Coding Log)

### Prompt 1: Thiết lập và tạo chức năng thêm sinh viên có validation
```text
ROLE: Hướng dẫn viên Backend NodeJS & TypeScript.
CONTEXT: Dự án quản lý sinh viên sử dụng Express 5, TypeScript ESM NodeNext, lưu trữ in-memory.
TASK: Xây dựng chức năng thêm sinh viên POST /api/v1/sinh-vien và tầng xử lý lỗi AppError.
CONSTRAINT:
- Tạo src/utils/AppError.ts kế thừa Error, nhận statusCode: number và message.
- Service validate chặt chẽ: input phải là object (không null/array); 4 trường bắt buộc kiểu string; trim khoảng trắng; maSV chuẩn regex /^SV[0-9]{3}$/; hoTen và maLop không rỗng; email đúng regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/; kiểm tra trùng mã sau validation (trả 409).
- Phản hồi thành công HTTP 201; phản hồi lỗi HTTP 400/409/500 theo chuẩn { success: false, message: ... }.
OUTPUT: Viết code hoàn chỉnh cho AppError.ts, sinhVien.service.ts, sinhVien.controller.ts, sinhVien.routes.ts, error.middleware.ts, server.ts.
```

### Prompt 2: Xử lý và kiểm soát ngoại lệ (Prompt sửa lỗi)
```text
ROLE: Chuyên gia Debug Backend Node.js.
CONTEXT: Khi người dùng gửi body JSON bị lỗi cú pháp (ví dụ thiếu dấu đóng ngoặc), Express mặc định trả về lỗi HTML 500 hoặc ngắt kết nối.
TASK: Bổ sung khả năng bắt lỗi cú pháp JSON của middleware express.json() trong error.middleware.ts để trả về JSON chuẩn HTTP 400 thay vì để lộ lỗi hệ thống.
CONSTRAINT: Giữ nguyên cấu trúc ESM NodeNext, kiểu ErrorRequestHandler 4 tham số.
```

---

## 4. Giải đáp các câu hỏi tự kiểm tra trước khi nộp bài

### 1. Route, Controller và Service của chức năng lấy danh sách ở đâu?
* **Route**: Nằm tại `src/routes/sinhVien.routes.ts` với dòng `router.get('/', getDanhSachSinhVien);` (được mount tại prefix `/api/v1/sinh-vien` trong `src/server.ts`).
* **Controller**: Nằm tại `src/controllers/sinhVien.controller.ts` trong hàm `getDanhSachSinhVien()`, có nhiệm vụ đón request, gọi service lấy dữ liệu và trả response dạng JSON với status code 200.
* **Service**: Nằm tại `src/services/sinhVien.service.ts` trong hàm `layDanhSachSinhVien()`, quản lý dữ liệu mảng sinh viên và trả về danh sách đối tượng sinh viên.

### 2. Vì sao thêm sinh viên phải dùng POST có body?
* Phương thức **POST** được thiết kế theo chuẩn HTTP để tạo mới tài nguyên trên server.
* Thông tin sinh viên (gồm nhiều trường dữ liệu phức tạp: `maSV`, `hoTen`, `email`, `maLop`) cần được bảo mật và truyền tải cấu trúc nguyên vẹn bên trong phần thân (**body**) của request dưới dạng JSON thay vì đưa lên query string hay URL của phương thức GET (vốn bị giới hạn độ dài, lưu trong history trình duyệt và không an toàn).

### 3. Vì sao nhận 409 có thể là một test đạt?
* Kiểm thử không chỉ kiểm tra trường hợp thành công (happy path - 200/201) mà còn phải kiểm tra hành vi ứng xử đúng của hệ thống khi phát sinh ngoại lệ (negative test).
* Trong ca test `T06`, yêu cầu đề bài là: khi gửi trùng mã sinh viên đã tồn tại, hệ thống **bắt buộc phải từ chối** và trả về mã lỗi `409 Conflict`. Do đó, server trả về đúng `409` và thông báo lỗi hợp lệ nghĩa là chức năng chống trùng lặp hoạt động chính xác theo đặc tả.

### 4. Vì sao phải GET lại sau khi POST?
* HTTP response `201 Created` chỉ phản ánh việc server thông báo đã tiếp nhận và thực hiện lệnh thêm.
* Việc gửi tiếp request `GET /api/v1/sinh-vien` hoặc `GET /api/v1/sinh-vien/:maSV` đóng vai trò **xác minh thực tế** (verification), nhằm đảm bảo dữ liệu mới thực sự đã được lưu bền vững vào mảng/bộ nhớ và có thể truy xuất lại chính xác.

### 5. Vì sao restart server làm mất sinh viên vừa thêm?
* Trong bài thực hành này, dữ liệu được lưu trữ tạm thời trong bộ nhớ RAM (`in-memory array` nằm trong module `sinhVien.service.ts`).
* Khi dừng server (Ctrl+C) hoặc tiến trình Node.js khởi động lại, toàn bộ bộ nhớ của tiến trình bị giải phóng và mã nguồn được nạp lại từ đầu với mảng khởi tạo ban đầu (chỉ gồm 2 sinh viên mẫu `SV001` và `SV002`).

### 6. Bạn đã thay đổi gì trong yêu cầu gửi AI, và đã chứng minh thay đổi đó hoạt động ra sao?
* **Thay đổi yêu cầu**: Ban đầu nếu chỉ yêu cầu "thêm sinh viên", AI sẽ không tự kiểm tra regex định dạng mã (`SVxxx`), không kiểm tra email hợp lệ, không trim chuỗi, và không phân biệt mã trùng (`409`). Tôi đã bổ sung các ràng buộc (CONSTRAINT) chi tiết: định dạng `^SV[0-9]{3}$`, email regex, trim chuỗi, loại bỏ trường thừa ngoài DTO và cơ chế ném `AppError(409)`.
* **Chứng minh hoạt động**: Chạy toàn bộ 11 ca kiểm thử tự động (T01 - T11). Tất cả các ca test gửi dữ liệu sai (T07 - thiếu tên, T08 - sai email, T09 - sai kiểu dữ liệu số, T10 - sai cú pháp JSON) đều bị chặn chính xác với mã 400; ca gửi trùng mã (T06) bị chặn với mã 409; và ca hợp lệ (T05) thêm thành công với mã 201 và truy xuất lại được qua GET.
