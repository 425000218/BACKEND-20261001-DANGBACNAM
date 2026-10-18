import fs from 'node:fs';
import path from 'node:path';

const postmanCollection = {
  info: {
    _postman_id: "chuong06-auth-rbac-collection-20261001",
    name: "Chương 06 - Authentication & Authorization (24 Tests)",
    description: "Bộ kiểm thử toàn diện 24 ca test (A01–A12: Xác thực tài khoản; B01–B12: Phân quyền RBAC) theo chuẩn Chương 06 / Buổi 07.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:5000", type: "string" },
    { key: "studentToken", value: "", type: "string" },
    { key: "adminToken", value: "", type: "string" }
  ],
  item: [
    {
      name: "01. Auth - Register & Login Setup",
      item: [
        {
          name: "A01 - POST Đăng ký tài khoản mới hợp lệ",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 201 Created', () => pm.response.to.have.status(201));",
                "const res = pm.response.json();",
                "pm.test('Role mặc định là student', () => pm.expect(res.data.role).to.eql('student'));",
                "pm.test('Tuyệt đối không lộ passwordHash', () => {",
                "    pm.expect(res.data.password).to.be.undefined;",
                "    pm.expect(res.data.passwordHash).to.be.undefined;",
                "});"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Nguyễn Minh An",
                email: "an.lab@example.com",
                password: "SinhVien@123"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/register", host: ["{{baseUrl}}"], path: ["api", "auth", "register"] }
          }
        },
        {
          name: "A02 - POST Đăng ký email đã tồn tại (Conflict)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 409 Conflict', () => pm.response.to.have.status(409));",
                "const res = pm.response.json();",
                "pm.test('Thông báo email đã được sử dụng', () => pm.expect(res.message).to.include('Email đã được sử dụng'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Nguyễn Minh An Duplicate",
                email: "an.lab@example.com",
                password: "SinhVien@123"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/register", host: ["{{baseUrl}}"], path: ["api", "auth", "register"] }
          }
        },
        {
          name: "A03 - POST Đăng ký kèm role admin (Từ chối leo quyền)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 400 Bad Request', () => pm.response.to.have.status(400));",
                "const res = pm.response.json();",
                "pm.test('Chặn không cho chỉ định role', () => pm.expect(res.message).to.include('Không được phép chỉ định trường role'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Hacker User",
                email: "hacker@example.com",
                password: "Password@123",
                role: "admin"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/register", host: ["{{baseUrl}}"], path: ["api", "auth", "register"] }
          }
        },
        {
          name: "A04 - POST Đăng nhập Sinh viên & Lưu studentToken",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 200 OK', () => pm.response.to.have.status(200));",
                "const res = pm.response.json();",
                "pm.test('Nhận accessToken', () => {",
                "    pm.expect(res.data.accessToken).to.be.a('string');",
                "    pm.expect(res.data.tokenType).to.eql('Bearer');",
                "    pm.collectionVariables.set('studentToken', res.data.accessToken);",
                "});"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "an.lab@example.com",
                password: "SinhVien@123"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }
          }
        },
        {
          name: "A05 - POST Đăng nhập sai mật khẩu (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));",
                "const res = pm.response.json();",
                "pm.test('Thông báo chung chống email enumeration', () => pm.expect(res.message).to.eql('Email hoặc mật khẩu không chính xác'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "an.lab@example.com",
                password: "WrongPassword"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }
          }
        },
        {
          name: "A06 - POST Đăng nhập email không tồn tại (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));",
                "const res = pm.response.json();",
                "pm.test('Thông báo lỗi chung', () => pm.expect(res.message).to.eql('Email hoặc mật khẩu không chính xác'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "notfound@example.com",
                password: "Password123"
              }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }
          }
        },
        {
          name: "A07 - GET Profile không gửi Header Authorization (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));",
                "const res = pm.response.json();",
                "pm.test('Báo lỗi thiếu Bearer token', () => pm.expect(res.message).to.include('Yêu cầu Bearer token'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{baseUrl}}/api/auth/profile", host: ["{{baseUrl}}"], path: ["api", "auth", "profile"] }
          }
        },
        {
          name: "A08 - GET Profile gửi Header sai định dạng (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));",
                "const res = pm.response.json();",
                "pm.test('Báo lỗi định dạng header', () => pm.expect(res.message).to.include('Định dạng Authorization header'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Basic 123456" }],
            url: { raw: "{{baseUrl}}/api/auth/profile", host: ["{{baseUrl}}"], path: ["api", "auth", "profile"] }
          }
        },
        {
          name: "A09 - GET Profile gửi Token sai chữ ký (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));",
                "const res = pm.response.json();",
                "pm.test('Báo lỗi chữ ký số', () => pm.expect(res.message).to.include('Token không hợp lệ hoặc'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer fake_token_tampered_xxxx" }],
            url: { raw: "{{baseUrl}}/api/auth/profile", host: ["{{baseUrl}}"], path: ["api", "auth", "profile"] }
          }
        },
        {
          name: "A10 - GET Profile gửi Token đã hết hạn (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE2MDAwMDAwMDB9.invalid" }],
            url: { raw: "{{baseUrl}}/api/auth/profile", host: ["{{baseUrl}}"], path: ["api", "auth", "profile"] }
          }
        },
        {
          name: "A11 - GET Profile gửi Token hợp lệ (200)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 200 OK', () => pm.response.to.have.status(200));",
                "const res = pm.response.json();",
                "pm.test('Thông tin người dùng đúng', () => pm.expect(res.data.email).to.eql('an.lab@example.com'));",
                "pm.test('Không lộ passwordHash', () => pm.expect(res.data.passwordHash).to.be.undefined);"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{studentToken}}" }],
            url: { raw: "{{baseUrl}}/api/auth/profile", host: ["{{baseUrl}}"], path: ["api", "auth", "profile"] }
          }
        },
        {
          name: "A12 - POST Đăng ký thiếu trường bắt buộc (400)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 400 Bad Request', () => pm.response.to.have.status(400));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: { mode: "raw", raw: JSON.stringify({ email: "missing@example.com" }, null, 2) },
            url: { raw: "{{baseUrl}}/api/auth/register", host: ["{{baseUrl}}"], path: ["api", "auth", "register"] }
          }
        }
      ]
    },
    {
      name: "02. RBAC & CRUD SinhVien",
      item: [
        {
          name: "Login Admin Setup - Lưu adminToken",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Admin login thành công 200', () => pm.response.to.have.status(200));",
                "const res = pm.response.json();",
                "pm.collectionVariables.set('adminToken', res.data.accessToken);"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: { mode: "raw", raw: JSON.stringify({ email: "admin@example.com", password: "Admin@123" }, null, 2) },
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }
          }
        },
        {
          name: "B01 - GET Danh sách sinh viên (Public)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 200 OK', () => pm.response.to.have.status(200));",
                "const res = pm.response.json();",
                "pm.test('data là mảng', () => pm.expect(res.data).to.be.an('array'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien"] }
          }
        },
        {
          name: "B02 - GET Chi tiết sinh viên theo mã (Public)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 200 OK', () => pm.response.to.have.status(200));",
                "const res = pm.response.json();",
                "pm.test('Mã SV chính xác', () => pm.expect(res.data.maSV).to.eql('SV001'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien/SV001", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien", "SV001"] }
          }
        },
        {
          name: "B03 - POST Thêm sinh viên không gửi token (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ maSV: "SV088", hoTen: "No Auth", email: "noauth@example.com", maLop: "25CT114" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien"] }
          }
        },
        {
          name: "B04 - PUT Cập nhật sinh viên không gửi token (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "PUT",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ hoTen: "No Auth", email: "noauth@example.com", maLop: "25CT114" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien/SV001", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien", "SV001"] }
          }
        },
        {
          name: "B05 - DELETE Xóa sinh viên không gửi token (401)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 401 Unauthorized', () => pm.response.to.have.status(401));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "DELETE",
            header: [],
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien/SV001", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien", "SV001"] }
          }
        },
        {
          name: "B06 - POST Thêm sinh viên với Token Student (403)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 403 Forbidden', () => pm.response.to.have.status(403));",
                "const res = pm.response.json();",
                "pm.test('Thông báo yêu cầu quyền admin', () => pm.expect(res.message).to.include('Yêu cầu quyền Quản trị viên'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{studentToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ maSV: "SV088", hoTen: "Student Try Add", email: "stu.try@example.com", maLop: "25CT114" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien"] }
          }
        },
        {
          name: "B07 - PUT Cập nhật sinh viên với Token Student (403)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 403 Forbidden', () => pm.response.to.have.status(403));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{studentToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ hoTen: "Student Try Update", email: "stu.try@example.com", maLop: "25CT114" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien/SV001", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien", "SV001"] }
          }
        },
        {
          name: "B08 - DELETE Xóa sinh viên với Token Student (403)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 403 Forbidden', () => pm.response.to.have.status(403));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{studentToken}}" }],
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien/SV001", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien", "SV001"] }
          }
        },
        {
          name: "B09 - POST Thêm sinh viên với Token Admin (201)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 201 Created', () => pm.response.to.have.status(201));",
                "const res = pm.response.json();",
                "pm.test('Sinh viên được thêm thành công', () => pm.expect(res.data.maSV).to.eql('SV088'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ maSV: "SV088", hoTen: "Sinh Viên Postman Test", email: "postman.sv@example.com", maLop: "25CT114" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien"] }
          }
        },
        {
          name: "B10 - POST Thêm sinh viên trùng mã với Token Admin (409)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 409 Conflict', () => pm.response.to.have.status(409));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ maSV: "SV088", hoTen: "Sinh Viên Duplicate", email: "dup@example.com", maLop: "25CT114" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien"] }
          }
        },
        {
          name: "B11 - PUT Cập nhật sinh viên với Token Admin (200)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 200 OK', () => pm.response.to.have.status(200));",
                "const res = pm.response.json();",
                "pm.test('Họ tên cập nhật thành công', () => pm.expect(res.data.hoTen).to.include('Đã Cập Nhật'));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ hoTen: "Sinh Viên Postman Test Đã Cập Nhật", email: "postman.updated@example.com", maLop: "25CT114" }, null, 2)
            },
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien/SV088", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien", "SV088"] }
          }
        },
        {
          name: "B12 - DELETE Xóa sinh viên với Token Admin (200)",
          event: [{
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code là 200 OK', () => pm.response.to.have.status(200));"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: { raw: "{{baseUrl}}/api/v1/sinh-vien/SV088", host: ["{{baseUrl}}"], path: ["api", "v1", "sinh-vien", "SV088"] }
          }
        }
      ]
    }
  ]
};

const outputPath = path.resolve(process.cwd(), 'postman/Chuong06-Auth-RBAC.postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2), 'utf8');
console.log('✅ Đã tạo thành công file Postman Collection tại:', outputPath);
