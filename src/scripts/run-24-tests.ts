import 'dotenv/config';
import jwt from 'jsonwebtoken';

interface ITestResult {
  code: string;
  group: string;
  name: string;
  method: string;
  endpoint: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes: string;
}

const BASE_URL = 'http://localhost:5000';
const results: ITestResult[] = [];

async function sendRequest(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, data };
}

async function runAll24Tests(): Promise<void> {
  console.log('🚀 BẮT ĐẦU CHẠY TOÀN BỘ 24 CA KIỂM THỬ CHƯƠNG 06 (A01-A12, B01-B12)...\n');

  // Chuẩn bị token hợp lệ và token hết hạn
  const secret = process.env.JWT_SECRET || 'secret';
  const expiredToken = jwt.sign(
    { sub: '1', role: 'student', exp: Math.floor(Date.now() / 1000) - 60 },
    secret
  );
  const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InN0dWRlbnQifQ.fake_signature_xxxx';

  // Lấy token student & admin
  const loginStudent = await sendRequest('POST', '/api/auth/login', {
    email: 'an.lab@example.com',
    password: 'SinhVien@123',
  });
  const studentToken = loginStudent.data?.data?.accessToken;

  const loginAdmin = await sendRequest('POST', '/api/auth/login', {
    email: 'admin@example.com',
    password: 'Admin@123',
  });
  const adminToken = loginAdmin.data?.data?.accessToken;

  // Dọn dẹp dữ liệu test cũ nếu có
  await sendRequest('DELETE', '/api/v1/sinh-vien/SV088', null, adminToken);
  await sendRequest('DELETE', '/api/v1/sinh-vien/SV_TEST_B', null, adminToken);

  // =========================================================================
  // NHÓM A: XÁC THỰC TÀI KHOẢN (A01 - A12)
  // =========================================================================
  const uniqueSuffix = Date.now().toString().slice(-4);
  const newEmail = `user.test.${uniqueSuffix}@example.com`;

  // A01: Đăng ký tài khoản hợp lệ (201)
  const a01 = await sendRequest('POST', '/api/auth/register', {
    fullName: 'Test User A01',
    email: newEmail,
    password: 'Password@123',
  });
  results.push({
    code: 'A01',
    group: 'Nhóm A: Auth',
    name: 'Đăng ký tài khoản mới hợp lệ',
    method: 'POST',
    endpoint: '/api/auth/register',
    expectedStatus: 201,
    actualStatus: a01.status,
    passed: a01.status === 201 && a01.data?.data?.role === 'student',
    notes: 'Trả về 201 Created, role mặc định là student, không lộ passwordHash',
  });

  // A02: Đăng ký với email trùng lặp (409)
  const a02 = await sendRequest('POST', '/api/auth/register', {
    fullName: 'Duplicate Email User',
    email: newEmail,
    password: 'Password@123',
  });
  results.push({
    code: 'A02',
    group: 'Nhóm A: Auth',
    name: 'Đăng ký với email đã tồn tại',
    method: 'POST',
    endpoint: '/api/auth/register',
    expectedStatus: 409,
    actualStatus: a02.status,
    passed: a02.status === 409,
    notes: 'Trả về 409 Conflict thông báo email đã được sử dụng',
  });

  // A03: Đăng ký cố tình gán role admin (400)
  const a03 = await sendRequest('POST', '/api/auth/register', {
    fullName: 'Hacker User',
    email: `hacker.${uniqueSuffix}@example.com`,
    password: 'Password@123',
    role: 'admin',
  });
  results.push({
    code: 'A03',
    group: 'Nhóm A: Auth',
    name: 'Đăng ký kèm trường role (leo thang đặc quyền)',
    method: 'POST',
    endpoint: '/api/auth/register',
    expectedStatus: 400,
    actualStatus: a03.status,
    passed: a03.status === 400,
    notes: 'Từ chối client gửi role, trả về 400 Bad Request',
  });

  // A04: Đăng nhập đúng email & mật khẩu (200)
  const a04 = await sendRequest('POST', '/api/auth/login', {
    email: newEmail,
    password: 'Password@123',
  });
  results.push({
    code: 'A04',
    group: 'Nhóm A: Auth',
    name: 'Đăng nhập thông tin chính xác',
    method: 'POST',
    endpoint: '/api/auth/login',
    expectedStatus: 200,
    actualStatus: a04.status,
    passed: a04.status === 200 && Boolean(a04.data?.data?.accessToken),
    notes: 'Trả về 200 OK kèm accessToken (JWT HS256, 1h)',
  });

  // A05: Đăng nhập sai mật khẩu (401)
  const a05 = await sendRequest('POST', '/api/auth/login', {
    email: newEmail,
    password: 'WrongPassword123',
  });
  results.push({
    code: 'A05',
    group: 'Nhóm A: Auth',
    name: 'Đăng nhập sai mật khẩu',
    method: 'POST',
    endpoint: '/api/auth/login',
    expectedStatus: 401,
    actualStatus: a05.status,
    passed: a05.status === 401,
    notes: 'Trả về 401 Unauthorized với thông báo chung (chống enumeration)',
  });

  // A06: Đăng nhập với email không tồn tại (401)
  const a06 = await sendRequest('POST', '/api/auth/login', {
    email: 'nonexistent.user.xyz@example.com',
    password: 'AnyPassword@123',
  });
  results.push({
    code: 'A06',
    group: 'Nhóm A: Auth',
    name: 'Đăng nhập email không tồn tại',
    method: 'POST',
    endpoint: '/api/auth/login',
    expectedStatus: 401,
    actualStatus: a06.status,
    passed: a06.status === 401,
    notes: 'Trả về 401 Unauthorized cùng thông báo lỗi chung',
  });

  // A07: Profile không gửi header Authorization (401)
  const a07 = await sendRequest('GET', '/api/auth/profile');
  results.push({
    code: 'A07',
    group: 'Nhóm A: Auth',
    name: 'Xem hồ sơ không gửi Header Authorization',
    method: 'GET',
    endpoint: '/api/auth/profile',
    expectedStatus: 401,
    actualStatus: a07.status,
    passed: a07.status === 401,
    notes: 'isAuth chặn với 401: Yêu cầu Bearer token',
  });

  // A08: Profile gửi header không đúng định dạng (401)
  const a08Res = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Basic ${studentToken}` },
  });
  results.push({
    code: 'A08',
    group: 'Nhóm A: Auth',
    name: 'Xem hồ sơ header sai định dạng (không phải Bearer)',
    method: 'GET',
    endpoint: '/api/auth/profile',
    expectedStatus: 401,
    actualStatus: a08Res.status,
    passed: a08Res.status === 401,
    notes: 'isAuth chặn với 401: Sai định dạng Bearer',
  });

  // A09: Profile gửi token bị giả mạo / sai chữ ký (401)
  const a09 = await sendRequest('GET', '/api/auth/profile', null, tamperedToken);
  results.push({
    code: 'A09',
    group: 'Nhóm A: Auth',
    name: 'Xem hồ sơ với Token giả mạo/chữ ký sai',
    method: 'GET',
    endpoint: '/api/auth/profile',
    expectedStatus: 401,
    actualStatus: a09.status,
    passed: a09.status === 401,
    notes: 'isAuth chặn với 401: Token không hợp lệ hoặc sai chữ ký',
  });

  // A10: Profile gửi token đã hết hạn (401)
  const a10 = await sendRequest('GET', '/api/auth/profile', null, expiredToken);
  results.push({
    code: 'A10',
    group: 'Nhóm A: Auth',
    name: 'Xem hồ sơ với Token đã hết hạn',
    method: 'GET',
    endpoint: '/api/auth/profile',
    expectedStatus: 401,
    actualStatus: a10.status,
    passed: a10.status === 401,
    notes: 'isAuth chặn với 401: Token đã hết hạn',
  });

  // A11: Profile gửi token hợp lệ (200)
  const a11 = await sendRequest('GET', '/api/auth/profile', null, studentToken);
  results.push({
    code: 'A11',
    group: 'Nhóm A: Auth',
    name: 'Xem hồ sơ với Token hợp lệ',
    method: 'GET',
    endpoint: '/api/auth/profile',
    expectedStatus: 200,
    actualStatus: a11.status,
    passed: a11.status === 200 && a11.data?.data?.email === 'an.lab@example.com',
    notes: 'Trả về 200 OK kèm thông tin user, không lộ passwordHash',
  });

  // A12: Đăng ký thiếu trường bắt buộc (400)
  const a12 = await sendRequest('POST', '/api/auth/register', {
    email: 'missing.fields@example.com',
  });
  results.push({
    code: 'A12',
    group: 'Nhóm A: Auth',
    name: 'Đăng ký thiếu trường bắt buộc',
    method: 'POST',
    endpoint: '/api/auth/register',
    expectedStatus: 400,
    actualStatus: a12.status,
    passed: a12.status === 400,
    notes: 'Validation bắt lỗi và trả về 400 Bad Request',
  });

  // =========================================================================
  // NHÓM B: PHÂN QUYỀN RBAC & CRUD SINHVIEN (B01 - B12)
  // =========================================================================

  // B01: Lấy danh sách sinh viên không cần token (200)
  const b01 = await sendRequest('GET', '/api/v1/sinh-vien');
  results.push({
    code: 'B01',
    group: 'Nhóm B: RBAC',
    name: 'GET danh sách sinh viên (Public)',
    method: 'GET',
    endpoint: '/api/v1/sinh-vien',
    expectedStatus: 200,
    actualStatus: b01.status,
    passed: b01.status === 200 && Array.isArray(b01.data?.data),
    notes: 'Công khai, truy cập không cần Bearer token',
  });

  // B02: Lấy chi tiết sinh viên không cần token (200)
  const b02 = await sendRequest('GET', '/api/v1/sinh-vien/SV001');
  results.push({
    code: 'B02',
    group: 'Nhóm B: RBAC',
    name: 'GET chi tiết sinh viên theo mã (Public)',
    method: 'GET',
    endpoint: '/api/v1/sinh-vien/SV001',
    expectedStatus: 200,
    actualStatus: b02.status,
    passed: b02.status === 200,
    notes: 'Công khai, xem thông tin sinh viên không cần token',
  });

  // B03: Thêm sinh viên không gửi token (401)
  const b03 = await sendRequest('POST', '/api/v1/sinh-vien', {
    maSV: 'SV_NOAUTH',
    hoTen: 'No Auth',
    email: 'noauth@example.com',
    maLop: '25CT114',
  });
  results.push({
    code: 'B03',
    group: 'Nhóm B: RBAC',
    name: 'POST thêm sinh viên không gửi Token',
    method: 'POST',
    endpoint: '/api/v1/sinh-vien',
    expectedStatus: 401,
    actualStatus: b03.status,
    passed: b03.status === 401,
    notes: 'isAuth chặn với 401 Unauthorized',
  });

  // B04: Cập nhật sinh viên không gửi token (401)
  const b04 = await sendRequest('PUT', '/api/v1/sinh-vien/SV001', {
    hoTen: 'No Auth Update',
    email: 'noauth.update@example.com',
    maLop: '25CT114',
  });
  results.push({
    code: 'B04',
    group: 'Nhóm B: RBAC',
    name: 'PUT cập nhật sinh viên không gửi Token',
    method: 'PUT',
    endpoint: '/api/v1/sinh-vien/SV001',
    expectedStatus: 401,
    actualStatus: b04.status,
    passed: b04.status === 401,
    notes: 'isAuth chặn với 401 Unauthorized',
  });

  // B05: Xóa sinh viên không gửi token (401)
  const b05 = await sendRequest('DELETE', '/api/v1/sinh-vien/SV001');
  results.push({
    code: 'B05',
    group: 'Nhóm B: RBAC',
    name: 'DELETE sinh viên không gửi Token',
    method: 'DELETE',
    endpoint: '/api/v1/sinh-vien/SV001',
    expectedStatus: 401,
    actualStatus: b05.status,
    passed: b05.status === 401,
    notes: 'isAuth chặn với 401 Unauthorized',
  });

  // B06: Thêm sinh viên với token Student (403)
  const b06 = await sendRequest(
    'POST',
    '/api/v1/sinh-vien',
    {
      maSV: 'SV_STU',
      hoTen: 'Student Add',
      email: 'stu.add@example.com',
      maLop: '25CT114',
    },
    studentToken
  );
  results.push({
    code: 'B06',
    group: 'Nhóm B: RBAC',
    name: 'POST thêm sinh viên với Token Student (RBAC)',
    method: 'POST',
    endpoint: '/api/v1/sinh-vien',
    expectedStatus: 403,
    actualStatus: b06.status,
    passed: b06.status === 403,
    notes: 'isAdmin chặn với 403 Forbidden: Yêu cầu quyền admin',
  });

  // B07: Cập nhật sinh viên với token Student (403)
  const b07 = await sendRequest(
    'PUT',
    '/api/v1/sinh-vien/SV001',
    {
      hoTen: 'Student Update',
      email: 'stu.update@example.com',
      maLop: '25CT114',
    },
    studentToken
  );
  results.push({
    code: 'B07',
    group: 'Nhóm B: RBAC',
    name: 'PUT cập nhật sinh viên với Token Student (RBAC)',
    method: 'PUT',
    endpoint: '/api/v1/sinh-vien/SV001',
    expectedStatus: 403,
    actualStatus: b07.status,
    passed: b07.status === 403,
    notes: 'isAdmin chặn với 403 Forbidden: Yêu cầu quyền admin',
  });

  // B08: Xóa sinh viên với token Student (403)
  const b08 = await sendRequest('DELETE', '/api/v1/sinh-vien/SV001', null, studentToken);
  results.push({
    code: 'B08',
    group: 'Nhóm B: RBAC',
    name: 'DELETE sinh viên với Token Student (RBAC)',
    method: 'DELETE',
    endpoint: '/api/v1/sinh-vien/SV001',
    expectedStatus: 403,
    actualStatus: b08.status,
    passed: b08.status === 403,
    notes: 'isAdmin chặn với 403 Forbidden: Yêu cầu quyền admin',
  });

  // B09: Thêm sinh viên với token Admin (201)
  const b09 = await sendRequest(
    'POST',
    '/api/v1/sinh-vien',
    {
      maSV: 'SV088',
      hoTen: 'Sinh Viên Test Admin',
      email: 'admin.test.a@example.com',
      maLop: '25CT114',
    },
    adminToken
  );
  results.push({
    code: 'B09',
    group: 'Nhóm B: RBAC',
    name: 'POST thêm sinh viên với Token Admin',
    method: 'POST',
    endpoint: '/api/v1/sinh-vien',
    expectedStatus: 201,
    actualStatus: b09.status,
    passed: b09.status === 201,
    notes: 'Admin thêm thành công, trả về 201 Created',
  });

  // B10: Thêm sinh viên trùng mã với token Admin (409)
  const b10 = await sendRequest(
    'POST',
    '/api/v1/sinh-vien',
    {
      maSV: 'SV088',
      hoTen: 'Sinh Viên Test Admin Duplicate',
      email: 'admin.test.dup@example.com',
      maLop: '25CT114',
    },
    adminToken
  );
  results.push({
    code: 'B10',
    group: 'Nhóm B: RBAC',
    name: 'POST thêm sinh viên trùng mã (Admin)',
    method: 'POST',
    endpoint: '/api/v1/sinh-vien',
    expectedStatus: 409,
    actualStatus: b10.status,
    passed: b10.status === 409,
    notes: 'Báo lỗi trùng khóa chính 409 Conflict',
  });

  // B11: Cập nhật sinh viên với token Admin (200)
  const b11 = await sendRequest(
    'PUT',
    '/api/v1/sinh-vien/SV088',
    {
      hoTen: 'Sinh Viên Test Admin Đã Cập Nhật',
      email: 'admin.test.updated@example.com',
      maLop: '25CT114',
    },
    adminToken
  );
  results.push({
    code: 'B11',
    group: 'Nhóm B: RBAC',
    name: 'PUT cập nhật sinh viên với Token Admin',
    method: 'PUT',
    endpoint: '/api/v1/sinh-vien/SV088',
    expectedStatus: 200,
    actualStatus: b11.status,
    passed: b11.status === 200,
    notes: 'Admin cập nhật thành công, trả về 200 OK',
  });

  // B12: Xóa sinh viên với token Admin (200)
  const b12 = await sendRequest('DELETE', '/api/v1/sinh-vien/SV088', null, adminToken);
  results.push({
    code: 'B12',
    group: 'Nhóm B: RBAC',
    name: 'DELETE sinh viên với Token Admin',
    method: 'DELETE',
    endpoint: '/api/v1/sinh-vien/SV088',
    expectedStatus: 200,
    actualStatus: b12.status,
    passed: b12.status === 200,
    notes: 'Admin xóa sinh viên thành công, trả về 200 OK',
  });

  // IN BẢNG TỔNG KẾT
  console.log('| Mã Ca | Nhóm | Tên Ca Kiểm Thử | Method & URL | Kỳ vọng | Thực tế | Đạt/Không | Ghi chú |');
  console.log('|:---:|---|---|---|:---:|:---:|:---:|---|');
  results.forEach(r => {
    const icon = r.passed ? '✅ ĐẠT' : '❌ HỎNG';
    console.log(`| **${r.code}** | ${r.group} | ${r.name} | \`${r.method} ${r.endpoint}\` | **${r.expectedStatus}** | **${r.actualStatus}** | ${icon} | ${r.notes} |`);
  });

  const totalPassed = results.filter(r => r.passed).length;
  console.log(`\n🎯 KẾT QUẢ: ${totalPassed}/24 ca kiểm thử ĐẠT (Tỷ lệ: ${(totalPassed / 24 * 100).toFixed(1)}%)`);

  if (totalPassed !== 24) {
    process.exitCode = 1;
  }
}

runAll24Tests().catch(err => {
  console.error('Lỗi thực thi test runner:', err);
  process.exit(1);
});
