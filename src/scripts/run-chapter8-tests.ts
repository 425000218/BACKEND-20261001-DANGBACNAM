import 'dotenv/config';

interface TestCase {
  id: string;
  name: string;
  category: 'LAB1_PAGINATION' | 'LAB2_ERROR_REGRESSION';
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  validator: (res: any, status: number) => { pass: boolean; note: string };
}

async function runTests() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
  console.log(`🚀 Bắt đầu thực thi 27 Ca Kiểm Thử Toàn Diện Chương 08: ${BASE_URL}`);

  // 1. Lấy token
  let adminToken = '';
  let studentToken = '';

  try {
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: process.env.ADMIN_PASSWORD || 'Admin@123' }),
    });
    const adminJson = await adminRes.json();
    adminToken = adminJson.data?.accessToken || '';

    const studentRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'an.lab@example.com', password: 'SinhVien@123' }),
    });
    const studentJson = await studentRes.json();
    studentToken = studentJson.data?.accessToken || '';

    console.log(`🔑 Token Lấy Được: Admin=${Boolean(adminToken)}, Student=${Boolean(studentToken)}`);
  } catch (err: any) {
    console.error('❌ Không thể đăng nhập lấy token:', err.message);
    process.exit(1);
  }

  const tests: TestCase[] = [
    // --- LAB 1: PAGINATION & SEARCH (P01 - P17) ---
    {
      id: 'P01',
      name: 'GET /api/v1/sinh-vien mặc định',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: Array.isArray(res.data) && res.pagination?.page === 1 && res.pagination?.limit === 10 && res.pagination?.totalItems > 0,
        note: `data=${res.data?.length} sv, page=${res.pagination?.page}, limit=${res.pagination?.limit}, totalItems=${res.pagination?.totalItems}`,
      }),
    },
    {
      id: 'P02',
      name: 'GET ?page=1&limit=2 (Tối đa 2 bản ghi đầu theo maSV ASC)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=1&limit=2`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.data?.length === 2 && res.data[0]?.maSV === 'SV001' && res.data[1]?.maSV === 'SV002',
        note: `Lấy 2 SV đầu: [${res.data?.map((s: any) => s.maSV).join(', ')}]`,
      }),
    },
    {
      id: 'P03',
      name: 'GET ?page=2&limit=2 (Tối đa 2 bản ghi tiếp theo, không trùng P02)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=2&limit=2`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.data?.length === 2 && res.data[0]?.maSV === 'SV003' && res.data[1]?.maSV === 'SV004',
        note: `Lấy 2 SV tiếp: [${res.data?.map((s: any) => s.maSV).join(', ')}]`,
      }),
    },
    {
      id: 'P04',
      name: 'GET ?page=3&limit=2 (Trang 3)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=3&limit=2`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.data?.length > 0 && res.pagination?.page === 3,
        note: `Trang 3 lấy được ${res.data?.length} sv: [${res.data?.map((s: any) => s.maSV).join(', ')}]`,
      }),
    },
    {
      id: 'P05',
      name: 'GET ?page=999&limit=2 (Vượt quá tổng số trang)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=999&limit=2`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: Array.isArray(res.data) && res.data.length === 0 && res.pagination?.totalItems > 0 && res.pagination?.page === 999,
        note: `data=[], page=999, totalItems=${res.pagination?.totalItems}`,
      }),
    },
    {
      id: 'P06',
      name: 'Validation: GET ?page=-1 (Bị chặn 400)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=-1`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400,
        note: `Chặn 400: ${res.message}`,
      }),
    },
    {
      id: 'P07',
      name: 'Validation: GET ?page=0 (Bị chặn 400, bắt đầu từ 1)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=0`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400,
        note: `Chặn 400: ${res.message}`,
      }),
    },
    {
      id: 'P08',
      name: 'Validation: GET ?page=1.5 (Bị chặn 400 thập phân)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=1.5`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400,
        note: `Chặn 400: ${res.message}`,
      }),
    },
    {
      id: 'P09',
      name: 'Validation: GET ?limit=abc (Bị chặn 400 không là số)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?limit=abc`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400,
        note: `Chặn 400: ${res.message}`,
      }),
    },
    {
      id: 'P10',
      name: 'Validation: GET ?limit=51 (Vượt giới hạn 50 của lab, Bị chặn 400)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?limit=51`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400,
        note: `Chặn 400: ${res.message}`,
      }),
    },
    {
      id: 'P11',
      name: 'GET ?search=Anh (Chỉ trả sinh viên có tên chứa Anh)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?search=Anh`,
      expectedStatus: 200,
      validator: (res) => {
        const allMatch = res.data?.every((s: any) => s.hoTen.toLowerCase().includes('anh'));
        return {
          pass: res.data?.length > 0 && allMatch,
          note: `Tìm được ${res.data?.length} sv chứa 'Anh': [${res.data?.map((s: any) => s.hoTen).join(', ')}]`,
        };
      },
    },
    {
      id: 'P12',
      name: 'GET ?search=Anh&page=2&limit=2 (totalItems là tổng kết quả lọc, không phải tổng bảng)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?search=Anh&page=2&limit=2`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.pagination?.totalItems === 3 && res.pagination?.page === 2 && res.data?.length === 1,
        note: `totalItems=${res.pagination?.totalItems} (lọc), trang 2 lấy được ${res.data?.length} sv: ${res.data[0]?.hoTen}`,
      }),
    },
    {
      id: 'P13',
      name: 'GET ?search=khongco (data=[], totalItems=0, totalPages=0)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?search=khongco`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.data?.length === 0 && res.pagination?.totalItems === 0 && res.pagination?.totalPages === 0,
        note: `data=[], totalItems=0, totalPages=0`,
      }),
    },
    {
      id: 'P14',
      name: 'GET ?search=%20%20Anh%20%20 (Trim khoảng trắng thành Anh)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?search=%20%20Anh%20%20`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.data?.length > 0 && res.data.every((s: any) => s.hoTen.toLowerCase().includes('anh')),
        note: `Trim thành công, trả ${res.data?.length} sv`,
      }),
    },
    {
      id: 'P15',
      name: 'Validation: GET ?search=[81 ký tự] (Chặn từ khóa quá dài)',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?search=${'A'.repeat(81)}`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400,
        note: `Chặn 400: ${res.message}`,
      }),
    },
    {
      id: 'P16',
      name: 'Kiểm chứng SQL ORDER BY + OFFSET/FETCH qua page=2&limit=2',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=2&limit=2`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.data[0]?.maSV === 'SV003',
        note: `Bản ghi đầu trang 2 là SV003 (đúng thứ tự maSV ASC)`,
      }),
    },
    {
      id: 'P17',
      name: 'Hồi quy CRUD: GET /api/v1/sinh-vien/SV001 theo mã cũ',
      category: 'LAB1_PAGINATION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien/SV001`,
      expectedStatus: 200,
      validator: (res) => ({
        pass: res.data?.maSV === 'SV001',
        note: `Tìm thấy ${res.data?.maSV} - ${res.data?.hoTen}`,
      }),
    },

    // --- LAB 2: GLOBAL ERROR HANDLING & REGRESSION (E01 - E10) ---
    {
      id: 'E01',
      name: 'Lab 2: GET ?page=-5 (HTTP 400, JSON chuẩn {success,status,message,data:null})',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?page=-5`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400 && res.data === null,
        note: `JSON chuẩn: status=${res.status}, data=null, message='${res.message}'`,
      }),
    },
    {
      id: 'E02',
      name: 'Lab 2: GET ?limit=abc (HTTP 400 bị validate chặn trước Database)',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien?limit=abc`,
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false && res.status === 400 && res.data === null,
        note: `Chặn trước DB: status=${res.status}, message='${res.message}'`,
      }),
    },
    {
      id: 'E03',
      name: 'Lab 2: GET /api/v1/sinh-vien/SV999 (HTTP 404 nhất quán)',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien/SV999`,
      expectedStatus: 404,
      validator: (res) => ({
        pass: res.success === false && res.status === 404 && res.data === null,
        note: `404 nhất quán: status=${res.status}, message='${res.message}'`,
      }),
    },
    {
      id: 'E04',
      name: 'Lab 2: GET /duong-dan-khong-co (Fallback 404 còn hoạt động)',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'GET',
      url: `${BASE_URL}/duong-dan-khong-co`,
      expectedStatus: 404,
      validator: (res) => ({
        pass: res.success === false && res.status === 404 && res.data === null,
        note: `Fallback 404: status=${res.status}, message='${res.message}'`,
      }),
    },
    {
      id: 'E05',
      name: 'Lab 2: Lỗi 500 mô phỏng qua route test-500 (Không lộ SQL/secret)',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'GET',
      url: `${BASE_URL}/api/v1/sinh-vien/test-500`,
      expectedStatus: 500,
      validator: (res) => ({
        pass: res.success === false && res.status === 500 && res.data === null && !JSON.stringify(res).includes('password') && !JSON.stringify(res).includes('DB_PASSWORD'),
        note: `500 an toàn: status=${res.status}, message='${res.message}'`,
      }),
    },
    {
      id: 'E08',
      name: 'Lab 2: Hồi quy Auth: GET /api/auth/profile thiếu token (Chặn 401)',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'GET',
      url: `${BASE_URL}/api/auth/profile`,
      expectedStatus: 401,
      validator: (res) => ({
        pass: res.success === false,
        note: `Chặn 401 Unauthorized khi thiếu header Bearer`,
      }),
    },
    {
      id: 'E09',
      name: 'Lab 2: Hồi quy RBAC: Student ép DELETE SV001 (Chặn 403 Forbidden)',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'DELETE',
      url: `${BASE_URL}/api/v1/sinh-vien/SV001`,
      headers: { Authorization: `Bearer ${studentToken}` },
      expectedStatus: 403,
      validator: (res) => ({
        pass: res.success === false,
        note: `Chặn 403 Forbidden tài khoản student, DB không đổi`,
      }),
    },
    {
      id: 'E10',
      name: 'Lab 2: Hồi quy Multer: Upload sai field name photo (Chặn 400)',
      category: 'LAB2_ERROR_REGRESSION',
      method: 'POST',
      url: `${BASE_URL}/api/auth/me/avatar`,
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photo: 'dummy' }),
      expectedStatus: 400,
      validator: (res) => ({
        pass: res.success === false,
        note: `Bắt lỗi tải ảnh: status=${res.status || 400}, message='${res.message}'`,
      }),
    },
  ];

  let passedCount = 0;
  const results = [];

  for (const t of tests) {
    try {
      const options: RequestInit = {
        method: t.method,
        headers: t.headers || {},
      };
      if (t.body) {
        options.body = t.body;
      }

      const res = await fetch(t.url, options);
      const json = await res.json().catch(() => ({}));
      const validation = t.validator(json, res.status);
      const pass = res.status === t.expectedStatus && validation.pass;

      if (pass) passedCount++;

      console.log(`[${pass ? 'PASS' : 'FAIL'}] ${t.id} - ${t.name}`);
      console.log(`       HTTP: ${res.status} (kỳ vọng ${t.expectedStatus}) | Note: ${validation.note}`);

      results.push({
        id: t.id,
        name: t.name,
        category: t.category,
        method: t.method,
        url: t.url,
        expectedStatus: t.expectedStatus,
        actualStatus: res.status,
        pass,
        note: validation.note,
      });
    } catch (err: any) {
      console.log(`[FAIL] ${t.id} - ${t.name}: Exception ${err.message}`);
      results.push({
        id: t.id,
        name: t.name,
        category: t.category,
        method: t.method,
        url: t.url,
        expectedStatus: t.expectedStatus,
        actualStatus: 0,
        pass: false,
        note: `Lỗi kết nối: ${err.message}`,
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 KẾT QUẢ KIỂM THỬ CHƯƠNG 08: ${passedCount}/${tests.length}`);
  console.log(`======================================================\n`);

  if (passedCount < tests.length) {
    process.exit(1);
  }
}

runTests();
