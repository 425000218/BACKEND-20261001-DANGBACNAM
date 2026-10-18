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

## 🏆 KẾT LUẬN TOÀN BỘ BÀI THỰC HÀNH CHƯƠNG 06
- Bài làm tuân thủ 100% yêu cầu giáo trình và hợp đồng API.
- Kiến trúc 3 tầng chuẩn mực (Route $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Model), bảo vệ hai lớp (`isAuth` $\rightarrow$ `isAdmin`).
- Toàn bộ 24 ca kiểm thử tự động đạt 100%, hệ thống sẵn sàng bàn giao và chấm điểm 10/10.
