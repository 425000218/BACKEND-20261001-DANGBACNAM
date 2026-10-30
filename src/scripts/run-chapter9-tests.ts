import 'dotenv/config';
import { sequelize } from '../config/database.js';

interface ITestResult {
  code: string;
  name: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes: string;
}

const results: ITestResult[] = [];

async function runTest(
  code: string,
  name: string,
  expectedStatus: number,
  fn: () => Promise<{ status: number; headers: Headers; body: any }>,
  checkFn?: (res: { status: number; headers: Headers; body: any }) => { ok: boolean; note: string }
) {
  try {
    const res = await fn();
    let passed = res.status === expectedStatus;
    let notes = `Status: ${res.status}`;

    if (checkFn) {
      const extra = checkFn(res);
      if (!extra.ok) passed = false;
      notes += ` | ${extra.note}`;
    }

    results.push({
      code,
      name,
      expectedStatus,
      actualStatus: res.status,
      passed,
      notes,
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${code}: ${name} -> HTTP ${res.status} (${notes})`);
  } catch (err: any) {
    results.push({
      code,
      name,
      expectedStatus,
      actualStatus: 0,
      passed: false,
      notes: `Error: ${err.message}`,
    });
    console.error(`[FAIL] ${code}: ${name} -> Error: ${err.message}`);
  }
}

async function main() {
  console.log('🚀 Bắt đầu chạy bộ kiểm thử Chapter 09 (Security, Rate Limit, Helmet, Regression)...');
  const BASE_URL = 'http://localhost:5000';

  // 1. Kiểm tra Helmet Security Headers
  await runTest(
    'S05',
    'Kiểm tra Helmet Security Headers trên response',
    200,
    async () => {
      const res = await fetch(`${BASE_URL}/`);
      const body = await res.json();
      return { status: res.status, headers: res.headers, body };
    },
    ({ headers }) => {
      const nosniff = headers.get('x-content-type-options');
      const poweredBy = headers.get('x-powered-by');
      const ok = nosniff === 'nosniff' && poweredBy === null;
      return {
        ok,
        note: `x-content-type-options: ${nosniff}, x-powered-by: ${poweredBy ?? 'null (đã ẩn)'}`,
      };
    }
  );

  // 2. Kiểm tra GET danh sách sinh viên không bị ảnh hưởng bởi Rate Limit của Login
  await runTest(
    'S04',
    'GET /api/v1/sinh-vien không bị giới hạn bởi loginLimiter',
    200,
    async () => {
      const res = await fetch(`${BASE_URL}/api/v1/sinh-vien?page=1&limit=2`);
      const body = await res.json();
      return { status: res.status, headers: res.headers, body };
    },
    ({ body }) => ({
      ok: body.success === true && Array.isArray(body.data) && body.pagination?.totalItems > 0,
      note: `data count: ${body.data?.length}, totalItems: ${body.pagination?.totalItems}`,
    })
  );

  // 3. Kiểm tra Login sai mật khẩu trước khi vượt hạn mức -> 401
  await runTest(
    'S06',
    'Login sai thông tin trước khi vượt hạn mức -> 401 Unauthorized',
    401,
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'SaiMatKhau@123' }),
      });
      const body = await res.json();
      return { status: res.status, headers: res.headers, body };
    },
    ({ body }) => ({
      ok: body.success === false && body.status === 401 && body.data === null,
      note: `message: "${body.message}"`,
    })
  );

  // 4. Kiểm tra S01: Gửi thêm các request đăng nhập trong hạn mức (lần 2, 3, 4, 5)
  console.log('🔄 Đang gửi các request đăng nhập tiếp theo để đạt ngưỡng 5 requests...');
  for (let i = 2; i <= 5; i++) {
    await runTest(
      `S01-${i}`,
      `Gửi Login request lần ${i} trong cửa sổ 60s`,
      200, // Sử dụng thông tin admin đúng để kiểm tra đăng nhập thành công
      async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' }),
        });
        const body = await res.json();
        return { status: res.status, headers: res.headers, body };
      },
      ({ headers, body }) => {
        const remaining = headers.get('ratelimit-remaining');
        return {
          ok: body.success === true && body.data?.accessToken !== undefined,
          note: `ratelimit-remaining: ${remaining}`,
        };
      }
    );
  }

  // 5. Kiểm tra S02: Request thứ 6 trong cùng cửa sổ 60s -> Phải nhận HTTP 429 Too Many Requests
  await runTest(
    'S02',
    'Request login thứ 6 trong cùng cửa sổ 60s -> Nhận HTTP 429 Too Many Requests',
    429,
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' }),
      });
      const body = await res.json();
      return { status: res.status, headers: res.headers, body };
    },
    ({ body, headers }) => {
      const limit = headers.get('ratelimit-limit');
      const remaining = headers.get('ratelimit-remaining');
      const ok =
        body.success === false &&
        body.status === 429 &&
        body.message === 'Bạn đã gửi quá nhiều yêu cầu' &&
        body.data === null;
      return {
        ok,
        note: `RateLimit-Limit: ${limit}, Remaining: ${remaining}, Message: "${body.message}"`,
      };
    }
  );

  // 6. Kiểm tra RBAC: Student token gọi DELETE -> 403 Forbidden (S07 / R01)
  const { generateToken } = await import('../utils/jwt.js');
  const studentJwt = generateToken({ sub: '1', role: 'student' });

  await runTest(
    'S07',
    'Student token gọi DELETE /api/v1/sinh-vien/SV001 -> Chặn 403 Forbidden',
    403,
    async () => {
      const res = await fetch(`${BASE_URL}/api/v1/sinh-vien/SV001`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentJwt}` },
      });
      const body = await res.json();
      return { status: res.status, headers: res.headers, body };
    },
    ({ body }) => ({
      ok: body.success === false && body.status === 403,
      note: `message: "${body.message}"`,
    })
  );

  // 7. Hồi quy R02: Phân trang & Tìm kiếm Chương 08
  await runTest(
    'R02',
    'Hồi quy Chương 08: Tìm kiếm search=Anh kết hợp page=1&limit=2',
    200,
    async () => {
      const res = await fetch(`${BASE_URL}/api/v1/sinh-vien?search=Anh&page=1&limit=2`);
      const body = await res.json();
      return { status: res.status, headers: res.headers, body };
    },
    ({ body }) => ({
      ok: body.success === true && body.data.length === 2 && body.pagination.totalItems === 3,
      note: `totalItems: ${body.pagination?.totalItems}, totalPages: ${body.pagination?.totalPages}`,
    })
  );

  // 8. Hồi quy R03: Global Error Handler bắt 404 cho sinh viên không tồn tại
  await runTest(
    'R03',
    'Hồi quy Chương 08: GET /api/v1/sinh-vien/SV999 -> HTTP 404 Not Found',
    404,
    async () => {
      const res = await fetch(`${BASE_URL}/api/v1/sinh-vien/SV999`);
      const body = await res.json();
      return { status: res.status, headers: res.headers, body };
    },
    ({ body }) => ({
      ok: body.success === false && body.status === 404 && body.data === null,
      note: `message: "${body.message}"`,
    })
  );

  console.log('\n======================================================');
  console.log(`📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ CHAPTER 09:`);
  console.log(`- Tổng số ca kiểm thử: ${results.length}`);
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`- Số ca khớp kỳ vọng: ${passedCount} / ${results.length}`);
  console.log('======================================================\n');
}

main().catch(console.error);
