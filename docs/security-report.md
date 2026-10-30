# BÁO CÁO RÀ SOÁT BẢO MẬT HỆ THỐNG (SECURITY-REPORT.MD)
## CHƯƠNG 09: KIỂM THỬ, BẢO MẬT & TRIỂN KHAI HỆ THỐNG BACKEND

Dự án: **backend-quan-ly-sinh-vien**  
Sinh viên thực hiện: **Đặng Bắc Nam**  
Thời điểm thực hiện: **2026-10-30**  
Môi trường kiểm thử: **Node.js v24, Express 5, SQL Server 2022, Jest, Supertest, Postman**

---

## 1. Phạm vi và Phương pháp Rà soát

### 1.1. Phạm vi rà soát (Scope)
- **Tầng Giao tiếp & Mạng**: Cấu hình các HTTP Security Headers (`helmet`), chính sách CORS (`cors`), và cơ chế giới hạn tần suất yêu cầu (`express-rate-limit`).
- **Tầng Điều khiển (Controller & Middleware)**: Xác thực danh tính (`isAuth`), kiểm tra phân quyền RBAC (`isAdmin`), kiểm soát upload tệp (`upload.middleware.ts`).
- **Tầng Xử lý Dữ liệu (Service & ORM)**: Kiểm tra các thao tác truy vấn CSDL (`sequelize.query`, `findAndCountAll`), phòng chống SQL Injection, XSS, và rò rỉ dữ liệu nhạy cảm.
- **Tầng Xử lý Lỗi (Global Error Handling)**: Kiểm tra phản hồi lỗi ở môi trường `development` và `production`.

### 1.2. Phương pháp thực hiện (Methodology)
1. **Static Code Analysis (Code Review thủ công)**: Rà soát từng file mã nguồn, kiểm tra nguy cơ nối chuỗi SQL, kiểm tra dữ liệu đầu vào người dùng.
2. **Dynamic Testing (Kiểm thử động với Postman & Supertest)**: Gửi các request bất thường (brute-force spam login, injection payload, request thiếu token, token giả mạo, request vượt quyền) và ghi nhận phản hồi HTTP.

---

## 2. Bảng Danh mục Rủi ro & Kết quả Rà soát Thực tế

| STT | Phân loại rủi ro | Vị trí kiểm tra (File / Hàm) | Mức độ ưu tiên | Hiện trạng kỹ thuật | Biện pháp bảo vệ / Xử lý |
|:---:|---|---|:---:|---|---|
| **01** | **SQL Injection** | `src/services/sinhVien.service.ts`<br>`layDanhSachSinhVien` | **Cao (High)** | Không phát hiện lỗ hổng. Hệ thống sử dụng toán tử `[Op.like]` của Sequelize ORM với tham số hóa (Parameterized Query) tự động, không ghép chuỗi SQL thủ công. | Sử dụng ORM và bind parameters an toàn cho mọi truy vấn Raw Query (`QueryTypes.SELECT`). |
| **02** | **Brute-Force & Spam Login** | `src/routes/auth.routes.ts`<br>`POST /api/auth/login` | **Cao (High)** | Ban đầu chưa có giới hạn tần suất gọi endpoint đăng nhập. Đã bổ sung `loginLimiter`. | Cấu hình `express-rate-limit`: Giới hạn tối đa 5 request trong cửa sổ 60 giây. Yêu cầu thứ 6 nhận HTTP 429 Too Many Requests. |
| **03** | **Rò rỉ Thông tin Máy chủ (Information Disclosure)** | `src/middlewares/error.middleware.ts`<br>`errorHandler` | **Trung bình (Medium)** | Khi phát sinh lỗi 500, nếu không kiểm tra môi trường, stack trace và chuỗi kết nối có thể bị lộ ra ngoài. | Cấu hình điều kiện `NODE_ENV === 'production'`: Che giấu hoàn toàn stack trace và thông điệp nội bộ, chỉ trả thông báo chung: `"Lỗi hệ thống, vui lòng thử lại sau"`. |
| **04** | **Leo thang Đặc quyền (Privilege Escalation)** | `src/services/auth.service.ts`<br>`registerUser` | **Cao (High)** | Người dùng đăng ký gửi kèm thuộc tính `role: 'admin'` trong body. | Chặn ngay tại tầng Service: Nếu phát hiện `rawData.role !== undefined`, ném lỗi `AppError(400)`. Mọi tài khoản mới luôn mặc định là `role: 'student'`. |
| **05** | **Dò quét Tài khoản (User Enumeration)** | `src/services/auth.service.ts`<br>`loginUser` | **Trung bình (Medium)** | Phản hồi thông báo khác nhau giữa email không tồn tại và sai mật khẩu. | Đồng nhất thông điệp phản hồi cho cả 2 trường hợp: Trả về HTTP 401 với thông điệp chung: `"Email hoặc mật khẩu không chính xác"`. |
| **06** | **Thiếu Security Headers** | `src/app.ts`<br>Pipeline Express | **Thấp (Low)** | Mặc định Express trả về header `X-Powered-By: Express` làm lộ nền tảng máy chủ. | Tích hợp middleware `helmet()` để loại bỏ `X-Powered-By`, tự động gắn `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`. |
| **07** | **Cross-Site Scripting (XSS)** | `frontend/src/`<br>Components | **Trung bình (Medium)** | Dữ liệu sinh viên hiển thị lên giao diện trình duyệt. | React JSX tự động mã hóa (escape) toàn bộ chuỗi văn bản khi render ra DOM; ứng dụng hoàn toàn không sử dụng `dangerouslySetInnerHTML`. |

---

## 3. Các Điều Chỉnh Kỹ Thuật Đã Thực Hiện

1. **Bổ sung `src/middlewares/rate-limit.middleware.ts`**:
   ```typescript
   export const loginLimiter = rateLimit({
     windowMs: 60 * 1000,
     limit: 5,
     standardHeaders: 'draft-7',
     legacyHeaders: false,
     statusCode: 429,
     message: {
       success: false,
       status: 429,
       message: 'Bạn đã gửi quá nhiều yêu cầu',
       data: null,
     },
     handler: (req, res, _next, options) => {
       res.status(options.statusCode).json(options.message);
     },
   });
   ```
2. **Gắn `loginLimiter` vào riêng route `POST /api/auth/login`** trong `src/routes/auth.routes.ts`.
3. **Cấu hình `helmet()` trong `src/app.ts`** kết hợp với CORS allowlist cụ thể `['http://localhost:5173', 'http://127.0.0.1:5173']`.

---

## 4. Kết Quả Kiểm Thử Thực Tế (Trước và Sau Khi Điều Chỉnh)

- **Trước khi cấu hình Rate Limit**: Gửi 10 request `POST /api/auth/login` liên tiếp đều được server xử lý và phản hồi HTTP 401 hoặc 200, tiềm ẩn nguy cơ bị tấn công vét cạn mật khẩu (Brute-Force).
- **Sau khi cấu hình Rate Limit**:
  - Request 1 đến 5: Xử lý bình thường.
  - Request thứ 6 trong cùng 60 giây: Nhận ngay HTTP `429 Too Many Requests` với payload JSON chuẩn.
  - Kiểm tra `GET /api/v1/sinh-vien`: Vẫn hoạt động bình thường qua HTTP 200, không bị ảnh hưởng bởi limiter của Login.
  - Kiểm tra Response Headers: Xuất hiện `ratelimit-limit: 5`, `ratelimit-remaining: 0`, `ratelimit-reset: ...` và các header an toàn của Helmet (`x-content-type-options: nosniff`).

---

## 5. Các Rủi Ro Còn Lại & Khuyến Nghị Vận Hành

1. **Bộ đếm Rate Limit trong Bộ nhớ đơn (In-Memory Store)**:
   - Hiện tại, `express-rate-limit` sử dụng bộ đếm trong RAM của tiến trình Node.js hiện tại.
   - Khi triển khai trên hệ thống phân tán nhiều container (hoặc cụm máy chủ đằng sau Load Balancer), khuyến nghị chuyển sang sử dụng `redis-store` hoặc `memcached` để đồng bộ bộ đếm giữa các instance.
2. **Cấu hình Reverse Proxy**:
   - Khi chạy sau Nginx hoặc Docker network, cần cấu hình `app.set('trust proxy', 1)` để middleware nhận diện chính xác địa chỉ IP của client thực tế thay vì IP của proxy.
