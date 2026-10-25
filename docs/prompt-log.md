# NHẬT KÝ VIBE CODING & CÂU HỎI BẢO VỆ BÀI THỰC HÀNH (PROMPT-LOG.MD)
## CHƯƠNG 06: AUTHENTICATION & AUTHORIZATION (JWT · MIDDLEWARE · PHÂN QUYỀN RBAC)

- **Dự án**: `backend-quan-ly-sinh-vien`
- **Sinh viên thực hiện**: **Đặng Bắc Nam**
- **Phương pháp**: Vibe Coding có kiểm soát theo khung **CTCO** (*Context - Task - Constraint - Output*)
- **Công nghệ**: Node.js, Express 5, TypeScript (ESM NodeNext), Sequelize 6, SQL Server, bcrypt, jsonwebtoken, Swagger OpenAPI 3.0, Playwright MCP.

---

## 🧭 PHẦN 1: KHUNG PROMPT ENGINEERING CTCO ÁP DỤNG TRONG DỰ ÁN

| Thành phần | Ý nghĩa trong phương pháp Vibe Coding có kiểm soát |
|---|---|
| **C - Context (Bối cảnh)** | Cung cấp thông tin dự án hiện tại (Express 5, TypeScript ESM NodeNext, SQL Server qua Sequelize), cấu trúc thư mục, các file hiện có để AI không bị ảo giác tạo lại dự án mới. |
| **T - Task (Nhiệm vụ)** | Xác định chính xác **một mục tiêu duy nhất** tại mỗi bước (ví dụ: tạo bảng Users, viết utility JWT, viết middleware isAuth,...). |
| **C - Constraint (Ràng buộc)** | Thiết lập rào cản kỹ thuật nghiêm ngặt: không phá vỡ CRUD cũ, không lộ password/passwordHash, không dùng `jwt.decode` để xác thực, không cấp quyền admin qua client, phân biệt 401 vs 403. |
| **O - Output (Đầu ra)** | Yêu cầu định dạng rõ ràng: file thay đổi, diff nhỏ nhất, lệnh kiểm thử tự động, bằng chứng ảnh chụp. |

---

## 📝 PHẦN 2: BẢNG NHẬT KÝ PROMPT TỪNG BƯỚC THỰC HIỆN (MODULE 0 - 10)

| Bước / Module | Nhiệm vụ (Task) | Prompt tóm tắt theo CTCO | AI đề xuất file | Quyết định chấp nhận / Tinh chỉnh của người lập trình | Bằng chứng kiểm thử / Build |
|:---:|---|---|---|---|---|
| **M00** | Khởi tạo giao diện test trực quan Playwright | C: Dự án có sẵn 5 API CRUD Sinh viên.<br>T: Tạo SPA HTML/JS tại `public/` và mount tại `/client`.<br>C: Không phá vỡ backend, phục vụ cho Playwright MCP.<br>O: `public/index.html`, `public/app.js`. | `public/index.html`, `public/app.js`, `src/server.ts` | **Chấp nhận**: Tinh chỉnh Helmet `contentSecurityPolicy: false` để tải scripts an toàn. | Playwright mở `http://localhost:5000/client` tải danh sách thành công (`module-0-client.png`). |
| **M01** | Tạo CSDL SQL Server & Model User | C: Đã có bảng SinhVien & Lop trong SQL Server.<br>T: Tạo bảng `dbo.Users` và Sequelize Model.<br>C: Không DROP bảng, không timestamps thừa, role mặc định 'student'.<br>O: `sql/04-users-auth.sql`, `user.model.ts`. | `sql/04-users-auth.sql`, `src/models/user.model.ts` | **Chấp nhận**: Bổ sung `IF NOT EXISTS` và `GRANT SELECT, INSERT, UPDATE, DELETE` cho tài khoản `sv_app`. | Chạy `sqlcmd` thành công, `User.count()` = 0 (`module-1`). |
| **M02** | Thư viện Bảo mật & JWT Utility | C: Cần ký và xác thực JWT token.<br>T: Viết `src/utils/jwt.ts` với `generateToken` và `verifyToken`.<br>C: Thuật toán bắt buộc HS256, hạn 1h, secret lấy từ `process.env.JWT_SECRET`, không dùng `jwt.decode`.<br>O: `src/utils/jwt.ts`. | `src/utils/jwt.ts`, `.env.example` | **Chấp nhận**: Bổ sung xử lý phân biệt lỗi hết hạn (`TokenExpiredError`) và sai chữ ký (`JsonWebTokenError`). | Unit test token sinh 3 phần, sửa 1 ký tự bị từ chối 401 (`module-2`). |
| **M03** | API Đăng ký tài khoản (Register) | C: Có User Model và bcrypt.<br>T: Viết `registerUser` `POST /api/auth/register`.<br>C: Băm bcrypt cost 12, chặn client gửi role (A03), bắt trùng email (409), không trả passwordHash.<br>O: `auth.service.ts`, `auth.controller.ts`, `auth.routes.ts`. | `src/services/auth.service.ts`, `src/controllers/auth.controller.ts`, `src/routes/auth.routes.ts` | **Chấp nhận**: Validate chặt chẽ format email bằng regex, trim khoảng trắng. | Test trả 201 Created lần đầu, 409 lần 2 (`module-3-register.png`). |
| **M04** | API Đăng nhập & Cấp JWT (Login) | C: Đã có tài khoản trong DB.<br>T: Viết `loginUser` `POST /api/auth/login`.<br>C: Dùng `bcrypt.compare`, sai pass hoặc sai email đều trả chung 401 chống email enumeration, đúng cấp JWT 1h.<br>O: Code login và gắn route. | `src/services/auth.service.ts`, `src/controllers/auth.controller.ts`, `src/routes/auth.routes.ts` | **Chấp nhận**: Thông báo lỗi chung `"Email hoặc mật khẩu không chính xác"`. | Test login trả 200 kèm `accessToken`, sai pass trả 401 (`module-4-login.png`). |
| **M05** | Middleware `isAuth` & Profile API | C: Cần trạm kiểm soát danh tính Bearer token.<br>T: Viết `src/middlewares/isAuth.ts` và `GET /api/auth/profile`.<br>C: Kiểm tra `Bearer <token>`, gán `req.user: { id, role }`, thiếu/sai trả 401.<br>O: `isAuth.ts`, `express.d.ts`, `auth.controller.ts`. | `src/middlewares/isAuth.ts`, `src/types/express.d.ts`, `src/controllers/auth.controller.ts` | **Chấp nhận**: Khai báo rõ interface TypeScript mở rộng `Express.Request` thay vì dùng ép kiểu `any`. | Test gọi Profile không token trả 401, có token trả 200 thông tin user (`module-5-profile.png`). |
| **M06** | Middleware `isAdmin` & RBAC SinhVien | C: Phân quyền quản trị viên thao tác dữ liệu học vụ.<br>T: Viết `isAdmin.ts`, khóa `POST/PUT/DELETE` SinhVien.<br>C: Kiểm tra `req.user.role === 'admin'`, student trả 403, giữ `GET` public.<br>O: `isAdmin.ts`, `sinhVien.routes.ts`. | `src/middlewares/isAdmin.ts`, `src/routes/sinhVien.routes.ts` | **Chấp nhận**: Đặt `isAuth` trước `isAdmin` để đảm bảo `req.user` đã được khởi tạo. | Student gọi POST/PUT/DELETE bị chặn 403 Forbidden (`module-6-rbac.png`). |
| **M07** | Seed Admin môi trường Dev | C: API register cấm tạo admin.<br>T: Tạo script `src/scripts/seed-admin.ts` khởi tạo admin nội bộ.<br>C: Idempotent (cập nhật nếu có, tạo mới nếu chưa), băm bcrypt cost 12.<br>O: `seed-admin.ts`, `package.json`. | `src/scripts/seed-admin.ts`, `package.json` | **Chấp nhận**: Cấp quyền `UPDATE` cho `sv_app` để script chạy mượt mà. | Chạy `pnpm run seed:admin` thành công, đăng nhập Admin thêm SV077 thành công (`module-7-seed-admin.png`). |
| **M08** | Cập nhật Swagger OpenAPI 3.0 | C: Đã có `docs/openapi.yaml` từ Buổi 5.<br>T: Bổ sung BearerAuth và 3 API Auth mới, gán security.<br>C: Giữ chuẩn OpenAPI 3.0.3, thêm response 401/403.<br>O: `docs/openapi.yaml`. | `docs/openapi.yaml`, `src/config/swagger.config.ts` | **Chấp nhận**: Đặt `bearerAuth` trong `components.securitySchemes` và gắn vào các route bảo vệ. | Swagger UI hiển thị nút Authorize và ổ khóa (`module-8-swagger.png`). |
| **M09** | Kiểm thử Toàn diện 24 Ca Test | C: Cần chứng minh toàn diện 24 ca test chuẩn theo giáo trình.<br>T: Viết test runner tự động và file Postman Collection JSON.<br>C: Test đúng 24 kịch bản A01–A12, B01–B12.<br>O: `run-24-tests.ts`, `Chuong06-Auth-RBAC.postman_collection.json`. | `src/scripts/run-24-tests.ts`, `postman/...postman_collection.json` | **Chấp nhận**: Sửa mã sinh viên test thành `SV088` khớp regex `^SV[0-9]{3}$`. | 24/24 ca kiểm thử ĐẠT (100.0%) (`docs/test-results.md`). |
| **M10** | Tổng kết, Báo cáo & Trả lời 8 câu hỏi | C: Hoàn thiện hồ sơ nộp bài điểm 10/10.<br>T: Trả lời chuyên sâu 8 câu hỏi bảo vệ và cập nhật tiến độ.<br>C: Trả lời tự luận chính xác, bám sát source code thực tế.<br>O: `docs/prompt-log.md`, `docs/tien_do.md`. | `docs/prompt-log.md`, `docs/tien_do.md` | **Chấp nhận**: Trình bày rõ ràng, đối chiếu từng dòng mã nguồn dự án. | Toàn bộ tiến độ đạt `DONE` 100%. |

---

## 🛡️ PHẦN 3: BÀI HỌC VỀ SECURITY REVIEW (PHÁT HIỆN LỖI CODE DO AI SINH RA)

Trong quá trình đồng hành cùng AI, sinh viên nhận diện các lỗi bảo mật phổ biến sau:

| Dấu hiệu lỗ hổng | Nguy cơ bảo mật | Cách xử lý chuẩn đã áp dụng trong dự án | Vị trí code áp dụng |
|---|---|---|---|
| **Password plaintext / so sánh thô** (`user.password === password`) | Lộ mật khẩu gốc khi bị dump CSDL, tấn công timing attack. | Bắt buộc dùng `bcrypt.hash(password, 12)` khi đăng ký và `bcrypt.compare(password, user.passwordHash)` khi đăng nhập. | `auth.service.ts` |
| **Hard-code JWT_SECRET** (`'123456'`) | Bí mật bị lộ trên GitHub, kẻ tấn công tự ký token giả để mạo danh Admin. | Lưu bí mật trong `.env`, đưa vào `.gitignore`, kiểm tra ứng dụng ném lỗi nếu biến môi trường rỗng. | `src/utils/jwt.ts` |
| **Thiếu `expiresIn`** | Token sống vĩnh viễn, khi bị lộ không thể thu hồi. | Cấu hình `{ expiresIn: '1h', algorithm: 'HS256' }`. | `src/utils/jwt.ts` |
| **Tin role từ Request Client** (`req.body.role`) | Lỗ hổng Privilege Escalation, người dùng tự truyền `role: "admin"` khi đăng ký. | Cấm trường `role` ở API Register (ném lỗi 400), backend gán cứng `role: 'student'`. Quyền Admin chỉ tạo qua script nội bộ. | `src/services/auth.service.ts` (Ca A03) |
| **Dùng `jwt.decode` thay cho `jwt.verify`** | Chỉ giải mã Base64 mà **không kiểm tra chữ ký số**, kẻ xấu sửa payload tùy ý và vượt qua kiểm tra. | Bắt buộc dùng `jwt.verify(token, secret, { algorithms: ['HS256'] })`. | `src/utils/jwt.ts` & `isAuth.ts` |
| **Trả nguyên User object ra ngoài** | Vô tình gửi `passwordHash` về client. | Tạo `IUserResponseDTO` chỉ chọn đúng `id`, `fullName`, `email`, `role` để trả về client. | `auth.service.ts` |

---

## 🎯 PHẦN 4: TRẢ LỜI CHI TIẾT 8 CÂU HỎI BẢO VỆ BÀI THỰC HÀNH (TRANG 21 PDF)

### ❓ Câu 1: Vì sao Register dùng `bcrypt.hash()` nhưng Login phải dùng `bcrypt.compare()`?
**Trả lời:**
- Khi **Register**, mục đích là tạo một chuỗi băm mật mã một chiều (one-way cryptographic hash) từ mật khẩu người dùng nhập kèm một chuỗi ngẫu nhiên (salt) được tạo tự động với chi phí tính toán (cost factor = 12). Hàm `bcrypt.hash(password, 12)` sinh ra chuỗi dạng `$2b$12$...` để lưu vào SQL Server. Vì đây là hàm băm một chiều, ta không thể giải mã ngược lại mật khẩu gốc.
- Khi **Login**, hệ thống không thể băm lại mật khẩu nhập vào bằng `bcrypt.hash()` rồi so sánh chuỗi với `passwordHash` trong database, bởi vì mỗi lần gọi `hash()`, một **salt ngẫu nhiên mới** được sinh ra khiến kết quả luôn khác nhau. Do đó, ta bắt buộc phải dùng `bcrypt.compare(inputPassword, storedHash)`. Hàm này sẽ tự động trích xuất chuỗi salt và cost factor từ `storedHash`, băm `inputPassword` với chính salt đó rồi so khớp an toàn, đồng thời chống lại tấn công đo thời gian (Timing Attack).

---

### ❓ Câu 2: Vì sao JWT có chữ ký số mà vẫn không nên chứa `passwordHash` trong payload?
**Trả lời:**
- JWT (JSON Web Token) chỉ được **ký số** (Signature) chứ **không được mã hóa** (Encryption). Cả 3 phần Header, Payload và Signature của JWT chỉ được mã hóa dạng **Base64URL**. Bất kỳ ai cầm được token (kể cả người dùng, công cụ bắt gói mạng hoặc client-side script) đều có thể dễ dàng giải mã phần Payload bằng lệnh `atob()` trong JavaScript hoặc qua trang web `jwt.io`.
- Mặc dù `passwordHash` đã được băm bằng bcrypt, nếu để lộ chuỗi hash này trong payload token, kẻ tấn công có thể thu thập và thực hiện các cuộc tấn công bẻ khóa offline (Offline Dictionary Attack, Brute-force Attack bằng GPU chuyên dụng) mà hệ thống Backend không hề hay biết hay có thể chặn IP. Do đó, nguyên tắc bảo mật tối thượng là: **Payload JWT chỉ chứa thông tin định danh tối thiểu (`sub`, `role`) và thời hạn (`exp`), tuyệt đối không chứa mật khẩu hay passwordHash**.

---

### ❓ Câu 3: Nếu User sửa chữ `student` thành `admin` trong payload JWT, điều gì xảy ra khi `isAuth` gọi `jwt.verify`?
**Trả lời:**
- Chữ ký số của JWT được tính toán dựa trên công thức:
  $$\text{Signature} = \text{HMAC-SHA256}(\text{Base64}(Header) + "." + \text{Base64}(Payload), \text{JWT\_SECRET})$$
- Khi User tự ý sửa đổi chuỗi Base64 của Payload từ `student` thành `admin`, phần Payload đã thay đổi. Kẻ tấn công **không biết chuỗi bí mật `JWT_SECRET`** lưu trên server, nên không thể tính toán lại một chữ ký hợp lệ tương ứng với Payload mới.
- Khi request được gửi lên, middleware `isAuth` gọi `jwt.verify(token, JWT_SECRET)`. Thư viện sẽ tính toán lại chữ ký từ Payload mới và so sánh với Signature đính kèm. Khi phát hiện chữ ký không khớp, thư viện sẽ ngay lập tức ném lỗi `JsonWebTokenError: invalid signature`. Hệ thống bắt lỗi này và trả về **401 Unauthorized** (`"Token không hợp lệ hoặc sai chữ ký"`), ngăn chặn hoàn toàn hành vi giả mạo quyền.

---

### ❓ Câu 4: Phân biệt 401 và 403 bằng hai Request cụ thể trong B04 và A08 (hoặc B06 và A07)?
**Trả lời:**
- **Mã 401 (Unauthorized - Chưa xác thực)**: Áp dụng khi hệ thống **chưa biết bạn là ai** hoặc thông tin danh tính cung cấp không hợp lệ.
  - *Ví dụ Ca A07*: Gửi request `GET /api/auth/profile` mà **không đính kèm header `Authorization`**. Server không nhận diện được danh tính của request nên trả về **401 Unauthorized** (`"Yêu cầu Bearer token để xác thực"`).
  - *Ví dụ Ca B03 / B04*: Gửi `POST /api/v1/sinh-vien` hoặc `PUT` mà không có token $\rightarrow$ Trả về **401 Unauthorized**.
- **Mã 403 (Forbidden - Bị cấm quyền)**: Áp dụng khi hệ thống **đã xác thực thành công danh tính của bạn (đã biết bạn là ai), nhưng bạn không có đủ thẩm quyền/vai trò** để thực hiện hành động đó.
  - *Ví dụ Ca B06*: Người dùng đăng nhập bằng tài khoản sinh viên `an.lab@example.com`, nhận token hợp lệ, sau đó gửi `POST /api/v1/sinh-vien` kèm token sinh viên. Middleware `isAuth` xác nhận token chuẩn (`req.user = { id: 1, role: 'student' }`), nhưng middleware `isAdmin` kiểm tra thấy role không phải `admin` nên chặn lại với mã **403 Forbidden** (`"Yêu cầu quyền Quản trị viên (admin)"`).

---

### ❓ Câu 5: Tại sao phải gắn `isAuth` trước `isAdmin`? `req.user` được tạo ở đâu?
**Trả lời:**
- `req.user` được tạo bên trong **Middleware `isAuth`** (`src/middlewares/isAuth.ts`). Cụ thể: sau khi `verifyToken(token)` thành công, hàm sẽ trích xuất payload và gán trực tiếp:
  ```ts
  req.user = {
    id: payload.sub,
    role: payload.role,
  };
  ```
- **Bắt buộc phải đặt `isAuth` trước `isAdmin`** vì:
  1. Theo luồng xử lý chuỗi middleware trong Express, các middleware chạy tuần tự từ trái sang phải: `router.post('/', isAuth, isAdmin, handler)`.
  2. Middleware `isAdmin` cần đọc thuộc tính `req.user.role` để kiểm tra quyền. Nếu đặt `isAdmin` trước `isAuth`, lúc này `isAuth` chưa chạy nên `req.user` vẫn đang là `undefined`. Khi đó, việc truy cập `req.user.role` sẽ dẫn đến lỗi logic hoặc ném ngoại lệ Runtime (`TypeError: Cannot read properties of undefined`).
  3. Về mặt nguyên lý bảo mật: **Phải xác thực danh tính (Authentication) trước khi phân quyền truy cập (Authorization)**.

---

### ❓ Câu 6: Nếu Route DELETE chỉ được đánh dấu security trong Swagger nhưng không gắn `isAdmin` ở Express, có an toàn không?
**Trả lời:**
- **Hoàn toàn KHÔNG an toàn!**
- Swagger (file `docs/openapi.yaml` hay giao diện Swagger UI) chỉ là **tài liệu mô tả giao diện API bên ngoài (API Documentation / Contract)** dành cho con người hoặc công cụ đọc. Swagger không phải là bức tường lửa hay tầng bảo vệ runtime của ứng dụng.
- Nếu lập trình viên chỉ gắn `security: - bearerAuth: []` trong file Swagger YAML nhưng trong file code Route Express (`src/routes/sinhVien.routes.ts`) chỉ viết:
  ```ts
  router.delete('/:maSV', xoaSinhVien); // KHÔNG có isAuth, isAdmin
  ```
  thì bất kỳ ai sử dụng Postman, curl hay script bên ngoài gửi request `DELETE /api/v1/sinh-vien/:maSV` đều sẽ vượt qua và xóa bản ghi thành công trong CSDL mà không bị hệ thống kiểm tra token hay quyền hạn. Lớp bảo vệ duy nhất có hiệu lực thực tế là middleware được cấu hình tại runtime trong Express.

---

### ❓ Câu 7: Nếu thay role của một User trong SQL Server sau khi đã cấp JWT, token cũ có cập nhật role ngay không? Muốn kiểm soát phải làm gì?
**Trả lời:**
- **Token cũ KHÔNG tự động cập nhật role ngay lập tức.**
- Bản chất của JWT là cơ chế xác thực **Stateless** (phi trạng thái): Toàn bộ thông tin `role` đã được mã hóa cứng vào Payload của token tại thời điểm đăng nhập (`login`) và được bảo vệ bởi chữ ký số. Khi một request gửi token lên, middleware `isAuth` chỉ giải mã token cục bộ bằng chữ ký `JWT_SECRET` chứ không hề truy vấn lại CSDL SQL Server để kiểm tra trạng thái hiện tại của User. Do đó, token cũ vẫn giữ nguyên quyền cũ cho tới khi nó hết hạn (`exp` - 1 giờ).
- **Muốn kiểm soát và cập nhật quyền ngay lập tức, ta có các giải pháp:**
  1. *Truy vấn DB trong Middleware*: Trong `isAuth` hoặc `isAdmin`, sau khi verify token, truy vấn CSDL `await User.findByPk(req.user.id)` để lấy role thực tế mới nhất trong DB (đổi lại sẽ tốn thêm 1 truy vấn I/O DB trên mỗi request).
  2. *Sử dụng Token Blacklist / Revocation List*: Lưu các token bị thu hồi trong Redis (bằng `jti` - JWT ID). Khi đổi role, đưa token cũ vào blacklist để chặn ngay lập tức.
  3. *Tăng phiên bản token (tokenVersion)*: Thêm cột `tokenVersion` trong bảng `Users` và đưa vào payload JWT. Khi đổi role, tăng `tokenVersion` lên 1; token cũ sẽ bị từ chối khi so khớp version.

---

### ❓ Câu 8: Tại sao test 403 cần gọi GET/SELECT lại và không thể chỉ nhìn status là đủ?
**Trả lời:**
- Nhận được status code `403` chỉ chứng minh rằng **ở tầng HTTP, server đã trả về mã phản hồi 403**. Tuy nhiên, nếu server bị lỗi lập trình kiểu:
  ```ts
  // Code lỗi tiềm ẩn: Chạy thao tác trước rồi mới gửi lỗi hoặc quên return
  await xoaSinhVienDB(maSV);
  res.status(403).json({ message: 'Forbidden' });
  ```
  hoặc middleware quên lệnh `return` khiến controller vẫn ngầm thực thi lệnh ghi dữ liệu xuống CSDL trước khi gửi phản hồi lỗi.
- Do đó, việc gọi lại **`GET /api/v1/sinh-vien/:maSV`** hoặc chạy truy vấn **`SELECT` trong SQL Server** sau khi nhận mã 403 là **bắt buộc** để kiểm chứng tính toàn vẹn dữ liệu: Chứng minh rằng bản ghi sinh viên **thực sự KHÔNG bị xóa, KHÔNG bị thêm, và KHÔNG bị cập nhật** trong CSDL vật lý.
- Đây chính là tiêu chuẩn kiểm thử khắt khe của Ca **B04, B05, B06, B07, B08** trong bài thực hành Chương 06.

---

---

# PHẦN II: NHẬT KÝ VIBE CODING & BẢO VỆ BÀI THỰC HÀNH CHƯƠNG 07
## UPLOAD HÌNH ẢNH & KẾT NỐI FRONTEND - BACKEND (MULTER · VITE · REACT · AXIOS · CORS · JWT)

---

## 🧭 PHẦN 5: BẢNG NHẬT KÝ PROMPT TỪNG BƯỚC THỰC HIỆN CHƯƠNG 07 (MODULE 00 - 12)

| Bước / Module | Nhiệm vụ (Task) | Prompt tóm tắt theo khung CTCO | AI đề xuất file | Quyết định chấp nhận / Tinh chỉnh của người lập trình | Bằng chứng kiểm thử / Build |
|:---:|---|---|---|---|---|
| **M00** | Khảo sát trạng thái ban đầu | C: Tiếp tục dự án Chương 06.<br>T: Khảo sát các file auth, schema Users, xác nhận `pnpm build`.<br>C: Chưa viết code, không tạo server mới.<br>O: Bảng đối chiếu file và schema. | `package.json`, `src/models/user.model.ts`, `src/server.ts` | **Chấp nhận**: Xác nhận CSDL có 17 Users, chưa có cột `avatarUrl`, 24 ca test C6 ĐẠT 100%. | `pnpm build` biên dịch sạch sẽ không lỗi, `pnpm test:24` 24/24 PASS. |
| **M01** | Bổ sung `avatarUrl` trong SQL Server & Model | C: Đã có bảng `dbo.Users`.<br>T: Tạo script SQL thêm cột `avatarUrl` và cập nhật User model.<br>C: Không DROP bảng, không `sync({ force/alter })`, idempotent.<br>O: `sql/05-add-avatar-url.sql`, `user.model.ts`. | `sql/05-add-avatar-url.sql`, `src/models/user.model.ts` | **Chấp nhận & Tinh chỉnh**: Dùng `IF COL_LENGTH('dbo.Users', 'avatarUrl') IS NULL`, cấp quyền cho `sv_app`. | Chạy `run-sql-05.ts` lần 1 thêm cột thành công, lần 2 phát hiện cột đã có, không lỗi. |
| **M02** | Cấu hình Multer & Bảo mật File Upload | C: Nhận file ảnh từ client gửi lên Express.<br>T: Viết `upload.middleware.ts` giới hạn 2MB, chỉ nhận PNG/JPEG.<br>C: Tên file ngẫu nhiên UUID, kiểm tra chữ ký nhị phân (magic bytes), xóa file rác, bắt mã 413.<br>O: `upload.middleware.ts`, `error.middleware.ts`. | `src/middlewares/upload.middleware.ts`, `src/middlewares/error.middleware.ts` | **Tinh chỉnh quan trọng**: Bổ sung hàm `verifyImageSignature` đọc 8 bytes đầu của file (chữ ký PNG `89 50 4E 47`, JPEG `FF D8 FF`), xóa ngay file nếu phát hiện file văn bản đổi đuôi. | `test-upload-middleware.ts` chứng minh file PNG/JPEG hợp lệ, file fake bị phát hiện và xóa sạch. |
| **M03** | Route, Controller & Service Upload Avatar | C: Cần endpoint `/api/auth/me/avatar` bảo vệ bởi JWT.<br>T: Viết route `POST /me/avatar`, controller, service cập nhật `avatarUrl` trong CSDL.<br>C: Lấy userId từ `req.user.id` (tuyệt đối không lấy từ `req.body`), dọn file nếu DB lỗi, phục vụ static `/uploads`.<br>O: `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `server.ts`. | `src/routes/auth.routes.ts`, `src/controllers/auth.controller.ts`, `src/services/auth.service.ts`, `src/server.ts` | **Tinh chỉnh quan trọng**: AI ban đầu gợi ý đọc `req.body.userId`, lập trình viên từ chối và ép buộc đọc từ `req.user.id`. Phục vụ file tĩnh `app.use('/uploads', express.static('public/uploads'))`. | Chạy test tích hợp: Student A đổi avatar thành công, Student B không bị sửa chéo. |
| **M04** | Kiểm thử Ma trận 12 Ca Upload (U01–U12) | C: Cần chứng minh 12 ca test upload toàn diện.<br>T: Viết runner tự động `run-upload-12-tests.ts` và Postman Collection.<br>C: Kiểm tra 3 lớp bằng chứng: HTTP status, file trên ổ đĩa, bản ghi SSMS.<br>O: `run-upload-12-tests.ts`, `Chuong07-Upload-Avatar.postman_collection.json`. | `src/scripts/run-upload-12-tests.ts`, `postman/...` | **Chấp nhận**: Kiểm tra toàn diện từ U01 đến U12 (PNG, JPEG, thiếu JWT, token hết hạn, thiếu file, sai field, file >2MB, magic bytes giả mạo, đuôi .gif, upload liên tiếp, chống sửa chéo, độ bền vững). | 12/12 ca kiểm thử Upload ĐẠT (100%) (`docs/test-results.md`). |
| **M05** | Cập nhật Swagger OpenAPI 3.0 YAML | C: Đã có Swagger UI tại `/api-docs`.<br>T: Thêm endpoint `POST /api/auth/me/avatar` multipart và cập nhật schema.<br>C: Định dạng `multipart/form-data`, trường `avatar` binary, BearerAuth, response 200/400/401/413/500.<br>O: `docs/openapi.yaml`. | `docs/openapi.yaml` | **Chấp nhận**: Thêm `AvatarUploadDTO`, `AvatarUploadResponse`, `PayloadTooLarge` (413), cập nhật `UserDTO` có `avatarUrl`. | Kiểm tra `swaggerSpec` nạp thành công 6 endpoints, Swagger UI hiển thị đầy đủ Try It Out. |
| **M06** | Khởi tạo Frontend React Vite & Thiết lập CORS | C: Cần giao diện web độc lập gọi API Backend.<br>T: Tạo project `frontend/` bằng Vite React TypeScript, cài `axios`, cấu hình CORS allowlist backend.<br>C: Chỉ cho phép Origin `http://localhost:5173`, không dùng wildcard CORS.<br>O: `frontend/`, `src/api/client.ts`, `src/server.ts`. | `frontend/`, `frontend/src/api/client.ts`, `src/server.ts` | **Tinh chỉnh**: Cấu hình Helmet `crossOriginResourcePolicy: { policy: 'cross-origin' }` để browser hiển thị được ảnh từ cổng 5000 sang cổng 5173. | `pnpm --dir frontend build` thành công, kiểm tra preflight CORS 200 OK. |
| **M07** | Bảng Danh sách Sinh viên (`SinhVienTable.tsx`) | C: Backend có API `GET /api/v1/sinh-vien`.<br>T: Viết component hiển thị bảng 4 cột (`maSV`, `hoTen`, `email`, `maLop`).<br>C: Đọc đúng `res.data.data`, có loading spinner, empty state và error alert kèm nút Thử lại.<br>O: `frontend/src/components/SinhVienTable.tsx`. | `frontend/src/components/SinhVienTable.tsx` | **Chấp nhận**: Xử lý đầy đủ 4 trạng thái, giao diện Bootstrap responsive đẹp mắt. | Kiểm tra F01–F05: Đọc đúng dữ liệu CSDL thật, hiển thị mượt mà. |
| **M08** | Giao diện Đăng nhập & Profile (`LoginForm.tsx`) | C: Cần form đăng nhập lấy JWT token.<br>T: Viết `LoginForm.tsx` gọi `POST /api/auth/login` và `GET /api/auth/profile`.<br>C: Lưu token trong React memory state (giải thích rủi ro XSS nếu lưu localStorage), nút Logout, bắt lỗi 401.<br>O: `frontend/src/components/LoginForm.tsx`. | `frontend/src/components/LoginForm.tsx` | **Chấp nhận**: Tích hợp nút điền nhanh tài khoản Student/Admin để chấm bài thuận tiện, phân biệt lỗi 401 với lỗi mạng. | Kiểm tra F06–F08: Đăng nhập thành công hiển thị Profile Card có ảnh đại diện và vai trò. |
| **M09** | Nút Xóa Sinh viên với Phân quyền Admin | C: Phân quyền RBAC thao tác xóa.<br>T: Hiển thị nút "Xóa" chỉ khi người dùng có role admin, hộp thoại xác nhận `window.confirm`, gọi Axios DELETE có Bearer token.<br>C: Sinh viên không thấy nút; nếu ép gọi qua Postman/DevTools vẫn bị backend chặn 403; không xóa dòng UI nếu API trả lỗi.<br>O: `frontend/src/components/SinhVienTable.tsx`. | `frontend/src/components/SinhVienTable.tsx` | **Chấp nhận**: Thêm dialog hiển thị rõ mã SV cần xóa, reload lại danh sách từ CSDL sau khi xóa thành công. | Kiểm tra F09–F10: Student bị chặn 403, Admin xóa thành công bản ghi test `SV999`. |
| **M10** | Giao diện Upload Avatar (`AvatarUpload.tsx`) | C: Cho phép người dùng tự tải ảnh đại diện từ giao diện.<br>T: Viết `AvatarUpload.tsx` với thẻ input file PNG/JPEG, FormData, Axios POST kèm Bearer token.<br>C: Kiểm tra kích thước ≤ 2MB ở client, để browser tự thêm multipart boundary, loading indicator, refresh Profile sau khi 200.<br>O: `frontend/src/components/AvatarUpload.tsx`. | `frontend/src/components/AvatarUpload.tsx` | **Chấp nhận**: Preview ảnh ngay khi chọn, sau khi upload thành công hiển thị ngay ảnh đại diện mới từ URL backend. | Kiểm tra F11: Upload ảnh từ React thành công, ảnh đại diện cập nhật tức thì trên giao diện. |
| **M11** | Kiểm thử Toàn diện Frontend (F01–F12) | C: Cần chứng minh 12 ca kiểm thử frontend hoạt động trơn tru.<br>T: Viết test runner `run-frontend-12-tests.ts` và chạy hồi quy toàn bộ hệ thống.<br>C: Kiểm tra F01–F12 qua DevTools Network và Axios client.<br>O: `run-frontend-12-tests.ts`. | `src/scripts/run-frontend-12-tests.ts` | **Chấp nhận**: Tự động dọn dẹp dữ liệu test `SV999` sau khi chạy, kiểm tra allowlist CORS chặn domain lạ (F12). | 12/12 ca kiểm thử Frontend ĐẠT (100%) (`docs/test-results.md`). |
| **M12** | Security Review & Hồ sơ Báo cáo Nộp bài | C: Đạt điểm tối đa theo Rubric chấm điểm của Giáo trình.<br>T: Soạn thảo Security Review, trả lời 12 câu hỏi bảo vệ, cập nhật tài liệu báo cáo.<br>C: Bám sát source code thực tế, giải thích thuyết phục, đối chiếu từng dòng mã nguồn.<br>O: `docs/prompt-log.md`, `BAO_CAO_THUC_HANH.md`. | `docs/prompt-log.md`, `BAO_CAO_THUC_HANH.md` | **Chấp nhận**: Trình bày chi tiết, trung thực, logic và đầy đủ minh chứng. | Hoàn thành toàn diện bài tập Chương 07. |

---

## 🛡️ PHẦN 6: SECURITY REVIEW PHẢN BIỆN ĐOẠN CODE AI NGUY HIỂM (PROMPT 11)

### Đoạn code AI đề xuất có lỗ hổng (Đoạn mã độc hại cần phản biện):
```typescript
// CODE SAI — CHỈ ĐỌC ĐỂ REVIEW
app.use(cors());
router.post("/me/avatar", upload.single("avatar"),
  async (req, res) => {
    const fileName = req.file?.originalname;
    await User.update({ avatarUrl: fileName },
      { where: { id: req.body.userId } });
    res.json({ success: true });
  }
);
// Frontend: luôn gửi userId theo ô input; không gửi JWT.
```

### Bảng Phân Tích 7 Lỗ Hổng Bảo Mật & Phương Án Khắc Phục:

| STT | Lỗ hổng phát hiện | Phân loại rủi ro (OWASP) | Hệ quả thực tế đối với hệ thống | Bản vá an toàn đã áp dụng trong dự án |
|:---:|---|---|---|---|
| **1** | **Bỏ qua middleware `isAuth`** | Broken Authentication (A07) | Tuyến đường trở thành Public, bất kỳ người dùng vô danh hoặc kẻ tấn công nào cũng có thể gửi request upload file lên máy chủ làm cạn kiệt tài nguyên đĩa (Disk Exhaustion DoS). | Gắn middleware `isAuth` **trước** khi vào Multer: `router.post('/me/avatar', isAuth, uploadAvatarMiddleware, uploadAvatar)`. |
| **2** | **Tin tưởng `req.body.userId` từ client** | Broken Object Level Authorization (BOLA / IDOR - A01) | Người dùng A có thể truyền `userId: 2` (ID của Admin hoặc Student B) trong body để ghi đè và thay đổi trái phép ảnh đại diện của người khác. | **Tuyệt đối không nhận `userId` từ body!** Luôn trích xuất danh tính chính chủ từ JWT đã xác minh: `const userId = req.user.id`. |
| **3** | **Sử dụng nguyên bản `file.originalname`** | Path Traversal & File Overwrite (A03) | Nếu client gửi tên file chứa ký tự đặc biệt như `../../etc/passwd` hoặc hai người cùng upload file tên `avatar.png`, file sẽ bị ghi đè hoặc lưu ra ngoài thư mục mong muốn. | Dùng `randomUUID()` sinh chuỗi ngẫu nhiên duy nhất cho tên file và chuẩn hóa phần mở rộng: `${randomUUID()}${ext}`. |
| **4** | **Không giới hạn kích thước file upload** | Denial of Service (DoS / Resource Exhaustion) | Kẻ tấn công có thể tải lên tệp tin dung lượng hàng trăm Megabytes hoặc Gigabytes gây tràn bộ nhớ đệm, nghẽn băng thông và làm đầy dung lượng ổ cứng máy chủ. | Cấu hình Multer `limits: { fileSize: 2 * 1024 * 1024 }` (chính xác 2.097.152 bytes) và bắt `LIMIT_FILE_SIZE` trả mã HTTP 413. |
| **5** | **Không kiểm tra nội dung thực tế (Magic bytes)** | Unrestricted File Upload / Malicious File Execution | Kẻ tấn công có thể tạo một file mã độc (webshell, script thực thi) rồi đổi đuôi mở rộng thành `.png`. Nếu server chỉ kiểm tra `file.mimetype` hoặc phần mở rộng, mã độc sẽ qua mặt hệ thống. | Triển khai hàm `verifyImageSignature` kiểm tra trực tiếp chữ ký nhị phân 8 bytes đầu của PNG/JPEG trên đĩa, tự động xóa ngay file rác nếu sai. |
| **6** | **CORS mở toàn bộ bằng `cors()` không giới hạn** | Security Misconfiguration (A05) | Bất kỳ website độc hại nào chạy trên trình duyệt của nạn nhân cũng có thể thực hiện Cross-Origin requests âm thầm gọi vào API backend. | Cấu hình CORS chặt chẽ theo Allowlist chỉ chấp nhận Origin của Vite Frontend: `cors({ origin: ['http://localhost:5173'] })`. |
| **7** | **Lưu chỉ `fileName` thay vì URL `/uploads/...`** | Broken Functionality / File Exposure | Client nhận được tên file thô `image.png` sẽ không thể truy cập qua HTTP vì thiếu tiền tố định tuyến, hoặc server phải public toàn bộ thư mục cha dẫn đến lộ lọt tài nguyên mã nguồn. | Lưu đường dẫn chuẩn hóa `/uploads/<uuid>.<ext>` trong CSDL và chỉ phục vụ tĩnh đúng thư mục lưu trữ qua `app.use('/uploads', express.static('public/uploads'))`. |

### Đoạn giải thích phản biện chuyên sâu (8–10 câu):
Đoạn code do AI đề xuất ở trên chứa đựng hàng loạt sai lầm bảo mật nghiêm trọng thường gặp khi lập trình viên phó mặc hoàn toàn cho AI mà không có kiến thức nền tảng vững vàng. Trước hết, việc thiếu vắng middleware xác thực `isAuth` biến một chức năng cá nhân nhạy cảm thành endpoint công cộng, cho phép bất kỳ ai cũng có thể đẩy dữ liệu lên máy chủ. Nghiêm trọng hơn, việc tin tưởng `req.body.userId` do client gửi lên vi phạm trực tiếp nguyên tắc kiểm soát truy cập BOLA (OWASP Top 10), trao quyền cho kẻ tấn công sửa chéo hồ sơ của bất kỳ tài khoản nào trong hệ thống. Việc sử dụng trực tiếp `originalname` tiềm ẩn nguy cơ tấn công duyệt thư mục (Path Traversal) và gây lỗi xung đột ghi đè tệp tin khi có nhiều người dùng cùng tên ảnh. Bên cạnh đó, việc không thiết lập giới hạn dung lượng 2MB và không thẩm định chữ ký nhị phân thực tế (magic bytes) mở đường cho các cuộc tấn công từ chối dịch vụ (DoS) và tải lên mã độc giả mạo đuôi ảnh. Cấu hình `cors()` mặc định cho phép mọi Origin bên ngoài truy cập tùy tiện, làm vô hiệu hóa cơ chế phòng thủ nguồn gốc của trình duyệt. Hơn nữa, việc lưu tên tệp đơn thuần vào CSDL phá vỡ hợp đồng API chuẩn mực và khiến client không thể hiển thị ảnh tĩnh qua giao thức HTTP. Vì vậy, đoạn code này phải bị bác bỏ hoàn toàn và thay thế bằng kiến trúc kiểm soát an toàn nhiều lớp: xác thực JWT chính chủ, sinh tên tệp bằng UUID ngẫu nhiên, kiểm soát chặt chẽ dung lượng và chữ ký nhị phân, lưu trữ URL tương đối và giới hạn CORS allowlist nghiêm ngặt.

---

## 🎯 PHẦN 7: TRẢ LỜI CHI TIẾT 12 CÂU HỎI BẢO VỆ BÀI THỰC HÀNH CHƯƠNG 07 (TRANG 21 PDF)

### ❓ Câu 1: `application/json` khác `multipart/form-data` ở điểm nào? Vì sao `express.json()` không đủ cho file?
**Trả lời:**
- **`application/json`**: Là định dạng truyền dữ liệu có cấu trúc thuần văn bản (text-based) dưới dạng các cặp key-value được mã hóa theo chuẩn ký tự UTF-8. Định dạng này rất nhẹ và tối ưu cho các thao tác CRUD dữ liệu thông thường nhưng không được thiết kế để truyền tải dữ liệu nhị phân (binary stream) của các tệp tin lớn như hình ảnh, âm thanh, video.
- **`multipart/form-data`**: Là định dạng mã hóa MIME cho phép đóng gói nhiều phần dữ liệu (parts) khác nhau trong cùng một HTTP request body, được phân tách rõ ràng bằng một chuỗi ranh giới duy nhất (**Boundary delimiter**). Mỗi part có thể chứa dữ liệu chuỗi (text field) hoặc luồng byte nhị phân của tệp tin kèm theo metadata riêng (`Content-Disposition`, `filename`, `Content-Type`).
- **Vì sao `express.json()` không đủ?**: Middleware `express.json()` chỉ có nhiệm vụ đọc toàn bộ body dạng text UTF-8 và phân tích cú pháp (parse) chuỗi đó thành đối tượng JavaScript thông qua `JSON.parse()`. Khi gặp request `multipart/form-data`, dữ liệu nhị phân bị phân mảnh bởi boundary, `express.json()` hoàn toàn không thể hiểu và không thể trích xuất luồng nhị phân để ghi xuống ổ đĩa, khiến `req.body` bị rỗng và không tạo ra `req.file`. Do đó, hệ thống bắt buộc phải sử dụng middleware chuyên dụng như **Multer** để phân tích luồng stream multipart.

---

### ❓ Câu 2: Điều gì xảy ra khi FormData dùng `photo` nhưng Multer cấu hình `single("avatar")`?
**Trả lời:**
- Khi phía Frontend sử dụng `formData.append("photo", file)` nhưng phía Backend Express cấu hình `upload.single("avatar")`, Multer sẽ quét các phần dữ liệu (parts) trong request body để tìm part có thuộc tính `name="avatar"`.
- Vì tên trường gửi lên là `photo` không khớp với tên trường mà Multer đang lắng nghe (`avatar`), Multer sẽ coi đây là một trường tệp ngoài ý muốn và kích hoạt ném lỗi:
  $$\text{MulterError: LIMIT\_UNEXPECTED\_FILE (code: 'LIMIT\_UNEXPECTED\_FILE')}$$
- Tại middleware xử lý lỗi tập trung [`src/middlewares/error.middleware.ts`](file:///d:/BACKEND-20261001-DANGBACNAM/src/middlewares/error.middleware.ts), lỗi này được nhận diện và lập tức gửi phản hồi về client với mã trạng thái **HTTP 400 Bad Request** kèm thông điệp: `"Tên trường file không hợp lệ (yêu cầu field name là avatar)"`. Tệp tin `photo` sẽ bị từ chối tiếp nhận, không được lưu vào thư mục `public/uploads` và CSDL không bị thay đổi.

---

### ❓ Câu 3: `req.file` và `req.body` nằm ở đâu sau Multer? `req.user` xuất hiện ở bước nào?
**Trả lời:**
- **`req.file`**: Được tạo ra và gắn trực tiếp vào đối tượng `req` bởi middleware **Multer** sau khi nó xử lý thành công một part tệp tin duy nhất (`upload.single("avatar")`). Đối tượng `req.file` chứa toàn bộ metadata của tệp tin gồm: `fieldname`, `originalname`, `encoding`, `mimetype`, `destination`, `filename` (tên UUID lưu trên đĩa), `path` (đường dẫn tuyệt đối), và `size` (dung lượng bytes).
- **`req.body`**: Cũng được **Multer** bổ sung các trường văn bản (text fields) được gửi kèm trong cùng form multipart (ví dụ các trường text gửi qua `formData.append("key", "value")`). Nếu không có text field nào, `req.body` là đối tượng rỗng `{}`.
- **`req.user` xuất hiện ở bước nào?**: Thuộc tính `req.user` xuất hiện ở bước thực thi middleware **`isAuth`**, diễn ra **TRƯỚC** khi request chạm tới Multer. Trong pipeline định tuyến:
  ```ts
  router.post('/me/avatar', isAuth, uploadAvatarMiddleware, uploadAvatar);
  ```
  `isAuth` giải mã JWT token trong header `Authorization: Bearer <token>`, trích xuất payload và gán `req.user = { id: payload.sub, role: payload.role }`. Nhờ đó, controller `uploadAvatar` chạy sau Multer có thể truy cập đầy đủ cả `req.user` (danh tính người dùng) lẫn `req.file` (thông tin tệp tin đã qua kiểm duyệt).

---

### ❓ Câu 4: Vì sao gọi `isAuth` trước Multer? Có cần `isAdmin` để User đổi Avatar chính mình không?
**Trả lời:**
- **Vì sao gọi `isAuth` trước Multer?**:
  1. *Nguyên lý phòng thủ tài nguyên (Resource Protection)*: Quá trình tiếp nhận và ghi luồng file multipart xuống ổ đĩa vật lý của Multer tiêu tốn đáng kể bộ nhớ đệm (buffer) và I/O đĩa. Bằng việc đặt `isAuth` ở vị trí đầu tiên, toàn bộ các request không hợp lệ (thiếu token, token giả mạo, token hết hạn) sẽ bị chặn đứng ngay lập tức với mã **401 Unauthorized** trước khi server phải tiêu tốn tài nguyên tiếp nhận file, loại trừ triệt để nguy cơ tấn công làm tràn ổ cứng (Disk Exhaustion DoS) từ kẻ tấn công nặc danh.
  2. *Đảm bảo quyền sở hữu*: `isAuth` xác minh danh tính và cung cấp `req.user.id`, tạo điều kiện để các bước tiếp theo xác định chính xác tài khoản nào đang thực hiện tải ảnh.
- **Có cần `isAdmin` để User đổi Avatar chính mình không?**:
  - **HOÀN TOÀN KHÔNG CẦN.** Quyền đổi ảnh đại diện cá nhân là quyền cơ bản của chính người dùng đó (Self-service profile update), áp dụng cho mọi tài khoản có vai trò `student` lẫn `admin`. Middleware `isAdmin` chỉ được áp dụng cho các thao tác quản trị hệ thống cấp cao (như xóa sinh viên hoặc thay đổi dữ liệu của người khác). Việc yêu cầu `isAdmin` cho endpoint `/me/avatar` sẽ là lỗi thiết kế phân quyền (Broken Authorization), ngăn cản sinh viên cập nhật thông tin cá nhân của chính mình.

---

### ❓ Câu 5: Vì sao không nhận `userId` trong body cho endpoint `/me/avatar`?
**Trả lời:**
- Việc nhận `userId` từ `req.body` (ví dụ `req.body.userId`) mở toang lỗ hổng bảo mật cực kỳ nguy hiểm có tên gọi **IDOR (Insecure Direct Object References)** hay **BOLA (Broken Object Level Authorization)** - Lỗ hổng số 1 trong bảng xếp hạng OWASP API Security Top 10.
- Nếu server đọc `userId` từ body, một sinh viên có tài khoản hợp lệ (Student A với `id: 1`) có thể đăng nhập lấy token của mình, nhưng trong body tải ảnh lại cố tình truyền `userId: 2` (ID của Student B) hoặc `userId: 99` (ID của Giảng viên / Admin). Nếu backend lấy ID từ body để thực hiện `User.update({ avatarUrl }, { where: { id: req.body.userId } })`, sinh viên A sẽ ghi đè và thay đổi trái phép ảnh đại diện của người khác.
- Do đó, đối với mọi endpoint cá nhân có tiền tố `/me` (như `/api/auth/me/avatar`, `/api/auth/profile`), định danh tài khoản **bắt buộc phải được lấy duy nhất từ `req.user.id`** - thông tin đã được đóng dấu mật mã bảo vệ bên trong Access Token JWT do chính server ký. Bất kỳ tham số `userId` nào do client gửi kèm trong body đều phải bị bỏ qua hoặc từ chối để triệt tiêu hoàn toàn nguy cơ tấn công sửa chéo.

---

### ❓ Câu 6: Ổ đĩa chứa dữ liệu nào, còn `dbo.Users.avatarUrl` chứa giá trị gì?
**Trả lời:**
- **Ổ đĩa (File System)**: Thư mục vật lý [`public/uploads/`](file:///d:/BACKEND-20261001-DANGBACNAM/public/uploads) trên máy chủ lưu trữ **tệp tin nhị phân thực tế** của hình ảnh (các khối byte JPEG/PNG) với tên tệp ngẫu nhiên duy nhất được sinh bằng UUID (ví dụ: `c4947743-7dec-4e76-9cf4-d8f355165e61.png`). Ổ đĩa là nơi chịu trách nhiệm lưu trữ vật lý dữ liệu đa phương tiện nặng.
- **`dbo.Users.avatarUrl` trong SQL Server**: Chỉ lưu trữ một **chuỗi ký tự đường dẫn tương đối (Relative URL string)** đại diện cho tài nguyên tĩnh được định tuyến bởi Express (ví dụ: `N'/uploads/c4947743-7dec-4e76-9cf4-d8f355165e61.png'`), có kiểu dữ liệu `NVARCHAR(255) NULL`.
- **Lợi ích kiến trúc của việc phân tách này**: CSDL quan hệ SQL Server được giải phóng khỏi gánh nặng lưu trữ các khối nhị phân khổng lồ (BLOB), giúp kích thước database nhỏ gọn, tốc độ sao lưu/phục hồi (backup/restore) cực nhanh và chỉ mục (indexing) đạt hiệu năng tối đa. Trong khi đó, việc phục vụ tệp tin ảnh tĩnh được giao cho Web Server (Express Static hoặc CDN) xử lý trực tiếp qua giao thức HTTP.

---

### ❓ Câu 7: 2MB tương ứng bao nhiêu byte? File 2.200.000 byte nên trả status nào?
**Trả lời:**
- **Quy đổi chuẩn đơn vị**:
  $$2\text{ MB} = 2 \times 1024 \times 1024\text{ bytes} = 2.097.152\text{ bytes}$$
- **File có dung lượng 2.200.000 bytes**:
  $$2.200.000\text{ bytes} > 2.097.152\text{ bytes (vượt quá giới hạn cho phép)}$$
- Khi file này được gửi lên, Multer sẽ phát hiện vượt ngưỡng `limits.fileSize` và kích hoạt lỗi `LIMIT_FILE_SIZE`. Theo quy chuẩn thiết kế RESTful API và giáo trình bài thực hành, máy chủ bắt buộc phải trả về mã trạng thái:
  $$\mathbf{HTTP\ 413\ Payload\ Too\ Large}$$
  kèm theo JSON phản hồi rõ ràng: `{"success": false, "message": "Kích thước file vượt quá giới hạn cho phép (tối đa 2MB)"}`. Không được trả về mã lỗi 500 Internal Server Error (vì đây là lỗi dữ liệu từ phía client) và không trả 400 chung chung khi đã có mã chuyên biệt 413.

---

### ❓ Câu 8: Chỉ kiểm tra `mimetype` và đuôi `.png` có đủ để khẳng định file là ảnh PNG hợp lệ không?
**Trả lời:**
- **HOÀN TOÀN KHÔNG ĐỦ.** Đây là một trong những lỗ hổng bảo mật tệp tin phổ biến nhất trong các ứng dụng web sơ sài:
  1. *Đuôi mở rộng (`.png`)*: Chỉ là một phần của tên file (`file.originalname`), do client tự do đặt tên và có thể thay đổi tùy tiện bằng cách đổi tên file (rename) từ `malware.exe`, `shell.php`, hoặc `document.txt` thành `avatar.png`.
  2. *Header `Content-Type` / `mimetype` (`image/png`)*: Là chuỗi metadata do trình duyệt hoặc công cụ gửi request (Postman, curl) tự khai báo trong header multipart part. Kẻ tấn công có thể dễ dàng can thiệp và giả mạo header này thông qua Burp Suite hoặc script gửi tin.
- **Giải pháp bắt buộc**: Để khẳng định một file là ảnh PNG hợp lệ, hệ thống phải thực hiện **Kiểm tra chữ ký nhị phân (Magic Bytes / File Signature)** trực tiếp trên nội dung nhị phân thực tế của file:
  - Một file **PNG chuẩn** bắt buộc phải bắt đầu bằng chuỗi 8 byte cố định:
    $$\mathtt{0x89\ 0x50\ 0x4E\ 0x47\ 0x0D\ 0x0A\ 0x1A\ 0x0A\quad (\text{kí tự ASCII: .PNG...})}$$
  - Một file **JPEG chuẩn** bắt buộc bắt đầu bằng 3 byte:
    $$\mathtt{0xFF\ 0xD8\ 0xFF}$$
- Trong dự án, hàm `verifyImageSignature()` mở file vật lý, đọc các byte đầu tiên và đối chiếu. Nếu phát hiện tệp văn bản hoặc mã độc giả danh đuôi `.png`, hệ thống lập tức từ chối với mã **400 Bad Request** và kích hoạt cơ chế xóa sạch file rác khỏi ổ đĩa.

---

### ❓ Câu 9: CORS kiểm soát điều gì? Vì sao Postman gọi API được nhưng browser lại báo CORS?
**Trả lời:**
- **CORS (Cross-Origin Resource Sharing)**: Là một **chính sách bảo mật dựa trên trình duyệt (Browser-enforced security mechanism)** nhằm kiểm soát việc một trang web đang chạy tại một Origin (gồm giao thức + tên miền + cổng, ví dụ: `http://localhost:5173`) có được phép thực hiện request và đọc dữ liệu từ một Origin khác (ví dụ: `http://localhost:5000`) hay không. Nếu server không trả về header `Access-Control-Allow-Origin` khớp với Origin của trang web, chính trình duyệt sẽ chặn không cho mã JavaScript đọc dữ liệu trả về.
- **Vì sao Postman gọi API được nhưng browser lại bị chặn?**:
  - **Postman, curl hay script backend** là các ứng dụng HTTP client độc lập, chạy trực tiếp trên hệ điều hành, không nằm trong môi trường sandbox trình duyệt và **không áp dụng chính sách Same-Origin Policy (SOP)**. Postman gửi request thẳng tới server và hiển thị toàn bộ kết quả trả về mà không quan tâm đến header CORS.
  - Ngược lại, **Trình duyệt (Chrome, Edge, Firefox)** có trách nhiệm bảo vệ người dùng trước các cuộc tấn công Cross-Site (như CSRF, đánh cắp phiên). Khi phát hiện request cross-origin từ frontend Vite (`localhost:5173`) sang backend (`localhost:5000`), trình duyệt tự động đính kèm header `Origin: http://localhost:5173` và kiểm tra phản hồi từ backend. Nếu backend không cấu hình allowlist cho phép origin này, trình duyệt sẽ chủ động chặn đứng request và hiển thị lỗi `CORS error` trong Developer Tools Console.

---

### ❓ Câu 10: Axios `GET /api/v1/sinh-vien` nên đọc mảng ở `response.data` hay `response.data.data`?
**Trả lời:**
- Bắt buộc phải đọc mảng ở:
  $$\mathbf{response.data.data}$$
- **Giải thích cơ chế phân tầng dữ liệu**:
  1. *Tầng Axios*: Thư viện Axios khi nhận phản hồi HTTP từ server sẽ tự động parse JSON body và gán vào thuộc tính `response.data`.
  2. *Tầng Hợp đồng Backend (API Envelope Pattern)*: Toàn bộ các API trong dự án được thiết kế theo chuẩn phản hồi nhất quán gồm 3 trường:
     ```json
     {
       "success": true,
       "message": "Lấy danh sách sinh viên thành công",
       "data": [ ...mảng sinh viên thực tế... ]
     }
     ```
  3. Do đó:
     - `response.data`: Là toàn bộ đối tượng Envelope bọc ngoài (`{ success, message, data }`).
     - `response.data.data`: Mới chính là mảng danh sách các đối tượng sinh viên (`[{ maSV, hoTen, email, maLop }, ...]`).
- Nếu lập trình viên ngộ nhận đọc tại `response.data` và truyền vào `map()`, ứng dụng sẽ gặp lỗi Runtime nghiêm trọng: `TypeError: response.data.map is not a function` và làm sập giao diện người dùng.

---

### ❓ Câu 11: Vì sao Student bị ẩn nút Xóa vẫn phải bị chặn DELETE ở Backend?
**Trả lời:**
- Đây là nguyên tắc vàng trong kiến trúc an ninh phần mềm: **"Không bao giờ tin tưởng Client (Never trust the client / Defense in Depth)"**.
- **Việc ẩn nút Xóa trên giao diện React chỉ là giải pháp trải nghiệm người dùng (UX/UI sugar)**: Giúp giao diện gọn gàng và tránh gây nhầm lẫn cho người dùng thông thường, nhưng **hoàn toàn KHÔNG phải là một cơ chế bảo mật**.
- Bất kỳ người dùng nào có kiến thức kỹ thuật cơ bản đều có thể:
  1. Mở Chrome DevTools Console hoặc Element Inspector để sửa thuộc tính DOM hiển thị lại nút bấm.
  2. Dùng DevTools Network copy request dạng cURL hoặc dùng Postman/Fetch gửi trực tiếp request `DELETE http://localhost:5000/api/v1/sinh-vien/SV001` kèm theo Access Token của Student.
- Nếu Backend không có middleware **`isAdmin`** chặn đứng tại tuyến đường `router.delete('/:maSV', isAuth, isAdmin, xoaSinhVien)` với mã **HTTP 403 Forbidden**, kẻ tấn công sẽ xóa sạch dữ liệu trong SQL Server mà không gặp bất kỳ trở ngại nào. Do đó, tầng bảo vệ thực tế và quyết định duy nhất bắt buộc phải nằm tại Backend.

---

### ❓ Câu 12: Trình bày ba bằng chứng cần có để chứng minh upload Avatar thật sự thành công.
**Trả lời:**
Để nghiệm thu một ca kiểm thử tải ảnh đại diện thành công đạt chuẩn kỹ thuật, không thể chỉ nhìn thấy một phản hồi JSON đẹp mắt trên màn hình, mà lập trình viên bắt buộc phải cung cấp **3 lớp bằng chứng độc lập (3-Tier Evidence)** sau:
1. **Lớp 1 - Bằng chứng Giao thức HTTP (Postman / Network Response)**:
   - Request gửi tới `POST /api/auth/me/avatar` kèm header `Authorization: Bearer <token>` và FormData chứa file ảnh.
   - Phản hồi trả về mã trạng thái **HTTP 200 OK**, `success: true` và trường dữ liệu `data.avatarUrl` mang đường dẫn tương đối đúng chuẩn dạng `/uploads/<uuid>.<ext>`.
2. **Lớp 2 - Bằng chứng Ổ đĩa Vật lý (File System Verification)**:
   - Mở thư mục thực tế [`public/uploads/`](file:///d:/BACKEND-20261001-DANGBACNAM/public/uploads), xác nhận tệp tin ảnh mới xuất hiện với tên UUID khớp với URL trong response.
   - Dung lượng tệp tin khớp với kích thước file tải lên, ảnh không bị hỏng và khi mở đường dẫn `http://localhost:5000/uploads/<uuid>.<ext>` trên trình duyệt, bức ảnh được hiển thị nguyên vẹn.
3. **Lớp 3 - Bằng chứng Cơ sở Dữ liệu SQL Server (SSMS Data Verification)**:
   - Mở SSMS hoặc chạy script kiểm tra: `SELECT id, email, avatarUrl FROM dbo.Users WHERE id = <userId>`.
   - Cột `avatarUrl` của đúng tài khoản người dùng đang đăng nhập đã được ghi nhận chuỗi `/uploads/<uuid>.<ext>`, trong khi các tài khoản người dùng khác trong hệ thống hoàn toàn không bị ảnh hưởng (không bị sửa chéo).
   - Khi khởi động lại máy chủ (Restart Server) và gọi lại `GET /api/auth/profile`, đường dẫn avatar vẫn tồn tại bền vững trong CSDL.

---

### 🚀 BÀI TẬP MỞ RỘNG (GỢI Ý PHÁT TRIỂN & GIẢI PHÁP NÂNG CAO)

#### 1. Cơ chế dọn dẹp Avatar cũ khi người dùng upload ảnh mới:
- *Vấn đề*: Khi một người dùng upload ảnh đại diện nhiều lần, các tệp ảnh cũ không còn được liên kết trong CSDL nhưng vẫn nằm trên ổ đĩa, trở thành các tệp mồ côi (orphan files) làm đầy dung lượng máy chủ theo thời gian.
- *Giải pháp*: Trong `updateUserAvatar` của `auth.service.ts`, trước khi cập nhật `avatarUrl` mới, lấy giá trị `oldAvatarUrl = user.avatarUrl`. Sau khi CSDL `user.update({ avatarUrl: newUrl })` thành công, kiểm tra nếu `oldAvatarUrl` tồn tại, xây dựng đường dẫn tệp vật lý `path.join(process.cwd(), 'public', oldAvatarUrl)` và gọi `fs.unlinkSync()` để xóa an toàn ảnh cũ. Nếu cập nhật DB thất bại, xóa ảnh mới vừa upload để đảm bảo tính nhất quán giao dịch (transactional cleanup).

#### 2. Chuyển đổi nơi lưu trữ sang Cloud Object Storage (AWS S3 / Google Cloud Storage / Cloudinary):
- *Vấn đề*: Trong môi trường triển khai thực tế (Cloud/Kubernetes/Serverless), máy chủ thường là Stateless và có thể tự động co giãn (auto-scaling) qua nhiều instances. Nếu lưu ảnh vào ổ đĩa local của một container, các container khác sẽ không thể nhìn thấy ảnh đó.
- *Giải pháp*:
  1. Sử dụng `multer-s3` hoặc upload stream trực tiếp từ memory (`multer.memoryStorage()`) lên AWS S3 bucket hoặc Google Cloud Storage.
  2. Bật dịch vụ mạng phân phối nội dung (CloudFront / Cloud CDN) trỏ tới S3 bucket để tối ưu tốc độ tải ảnh toàn cầu.
  3. Cột `dbo.Users.avatarUrl` trong SQL Server vẫn giữ nguyên vai trò lưu trữ chuỗi URL (lúc này là URL tuyệt đối `https://cdn.example.com/avatars/<uuid>.jpg`). Nhờ đó, mã nguồn tầng Controller và Model không hề bị xáo trộn, tuân thủ nguyên lý Single Responsibility.

#### 3. Thanh tiến trình tải lên (Progress Bar) và `AbortController` cho Axios:
- *Thanh tiến trình*: Sử dụng cấu hình `onUploadProgress` của Axios:
  ```ts
  await apiClient.post('/api/auth/me/avatar', formData, {
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      setUploadProgress(percent);
    }
  });
  ```
- *Hủy request với AbortController*:
  ```ts
  const controller = new AbortController();
  // Gửi request: apiClient.post(..., { signal: controller.signal });
  // Khi người dùng bấm "Hủy" hoặc rời trang: controller.abort();
  ```
  Giúp giải phóng băng thông ngay lập tức nếu người dùng đổi ý hoặc mạng bị chậm.

---

## 🏆 KẾT LUẬN TOÀN DIỆN CHƯƠNG 07
- Dự án kết nối thành công và trơn tru luồng nghiệp vụ end-to-end từ giao diện người dùng **Vite React** tới **Express 5** và **SQL Server**.
- Cơ chế bảo mật vững chắc: Xác thực JWT, phân quyền RBAC 2 lớp, Multer kiểm soát 2MB, lọc magic bytes nhị phân, CORS allowlist đúng chuẩn.
- Đạt điểm tuyệt đối mọi tiêu chí kỹ thuật: 12/12 ca Upload ĐẠT, 12/12 ca Frontend ĐẠT, 24/24 ca kiểm thử hồi quy ĐẠT (Tổng cộng 48/48 ca test PASS 100%).

