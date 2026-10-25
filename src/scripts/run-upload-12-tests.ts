import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

interface IUploadTestResult {
  code: string;
  name: string;
  scenario: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes: string;
}

const BASE_URL = 'http://localhost:5000';
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const results: IUploadTestResult[] = [];

// Helper tạo PNG binary buffer chuẩn (1x1 transparent PNG)
function createValidPngBuffer(): Uint8Array {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);
}

// Helper tạo JPEG binary buffer chuẩn
function createValidJpgBuffer(): Uint8Array {
  return new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
    0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00,
    0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01,
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00,
    0x3f, 0x00, 0x7f, 0x00, 0xff, 0xd9,
  ]);
}

// Helper đếm số file trong public/uploads
function countUploadFiles(): number {
  if (!fs.existsSync(UPLOAD_DIR)) return 0;
  return fs.readdirSync(UPLOAD_DIR).length;
}

export async function runUpload12Tests(): Promise<IUploadTestResult[]> {
  console.log('========================================================================');
  console.log('🚀 BẮT ĐẦU CHẠY MA TRẬN 12 CA KIỂM THỬ UPLOAD AVATAR (U01 - U12)');
  console.log('========================================================================\n');

  const jwtSecret = process.env.JWT_SECRET || 'quan-ly-sinh-vien-jwt-secret-key-2026';

  // 1. Khởi tạo tài khoản test Student A và Student B
  const timestamp = Date.now();
  const emailA = `student.a.${timestamp}@test.edu.vn`;
  const emailB = `student.b.${timestamp}@test.edu.vn`;
  const password = 'Password@123';

  // Đăng ký Student A
  const regResA = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Student Nguyễn Văn A', email: emailA, password }),
  });
  const regJsonA = (await regResA.json()) as any;
  const userAId = regJsonA.data?.id;

  const loginResA = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailA, password }),
  });
  const loginJsonA = (await loginResA.json()) as any;
  const tokenA = loginJsonA.data?.accessToken;

  // Đăng ký Student B
  const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Student Trần Thị B', email: emailB, password }),
  });
  const regJsonB = (await regResB.json()) as any;
  const userBId = regJsonB.data?.id;

  const loginResB = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailB, password }),
  });
  const loginJsonB = (await loginResB.json()) as any;
  const tokenB = loginJsonB.data?.accessToken;

  console.log(`✅ Khởi tạo tài khoản test thành công:`);
  console.log(`   - Student A ID: ${userAId} (${emailA})`);
  console.log(`   - Student B ID: ${userBId} (${emailB})\n`);

  let studentAAvatarUrl1 = '';
  let studentAAvatarUrl2 = '';

  // -------------------------------------------------------------------------
  // U01: Avatar PNG hợp lệ + Student JWT -> 200
  // -------------------------------------------------------------------------
  {
    const filesBefore = countUploadFiles();
    const fd = new FormData();
    fd.append('avatar', new Blob([createValidPngBuffer() as any], { type: 'image/png' }), 'avatar-u01.png');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });
    const json = (await res.json()) as any;
    studentAAvatarUrl1 = json.data?.avatarUrl || '';
    const filesAfter = countUploadFiles();

    // Xác minh trong DB
    const user = await User.findByPk(userAId);
    const dbMatch = user?.avatarUrl === studentAAvatarUrl1;

    const passed = res.status === 200 && json.success === true && studentAAvatarUrl1.startsWith('/uploads/') && filesAfter === filesBefore + 1 && dbMatch;
    results.push({
      code: 'U01',
      name: 'Upload Avatar PNG hợp lệ',
      scenario: 'Gửi file PNG 1x1 hợp lệ kèm token Student A',
      expectedStatus: 200,
      actualStatus: res.status,
      passed,
      notes: passed ? `200 OK. Sinh file mới, DB cập nhật ${studentAAvatarUrl1}` : `Thất bại: status=${res.status}`,
    });
  }

  // -------------------------------------------------------------------------
  // U02: Avatar JPEG hợp lệ + Student JWT -> 200
  // -------------------------------------------------------------------------
  {
    const fd = new FormData();
    fd.append('avatar', new Blob([createValidJpgBuffer() as any], { type: 'image/jpeg' }), 'avatar-u02.jpg');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });
    const json = (await res.json()) as any;
    const jpegUrl = json.data?.avatarUrl;

    // Xác minh file tĩnh xem được trên trình duyệt qua HTTP GET
    let staticOk = false;
    if (jpegUrl) {
      const getImg = await fetch(`${BASE_URL}${jpegUrl}`);
      staticOk = getImg.status === 200;
    }

    const passed = res.status === 200 && json.success === true && staticOk;
    results.push({
      code: 'U02',
      name: 'Upload Avatar JPEG hợp lệ & Mở qua HTTP',
      scenario: 'Gửi file JPEG hợp lệ, kiểm tra phục vụ file tĩnh',
      expectedStatus: 200,
      actualStatus: res.status,
      passed,
      notes: passed ? `200 OK. Phục vụ tĩnh GET ${jpegUrl} trả 200` : `Thất bại: status=${res.status}`,
    });
  }

  // -------------------------------------------------------------------------
  // U03: Không có Authorization header -> 401
  // -------------------------------------------------------------------------
  {
    const filesBefore = countUploadFiles();
    const fd = new FormData();
    fd.append('avatar', new Blob([createValidPngBuffer() as any], { type: 'image/png' }), 'avatar-u03.png');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      body: fd,
    });
    const filesAfter = countUploadFiles();

    const passed = res.status === 401 && filesAfter === filesBefore;
    results.push({
      code: 'U03',
      name: 'Thiếu header Authorization',
      scenario: 'Gửi file nhưng không truyền Bearer token',
      expectedStatus: 401,
      actualStatus: res.status,
      passed,
      notes: passed ? `401 Unauthorized. Không sinh file rác (${filesBefore} -> ${filesAfter})` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U04: JWT sai hoặc hết hạn -> 401
  // -------------------------------------------------------------------------
  {
    const expiredToken = jwt.sign(
      { sub: userAId, role: 'student' },
      jwtSecret,
      { expiresIn: '-10s' }
    );
    const filesBefore = countUploadFiles();
    const fd = new FormData();
    fd.append('avatar', new Blob([createValidPngBuffer() as any], { type: 'image/png' }), 'avatar-u04.png');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${expiredToken}` },
      body: fd,
    });
    const filesAfter = countUploadFiles();

    const passed = res.status === 401 && filesAfter === filesBefore;
    results.push({
      code: 'U04',
      name: 'JWT hết hạn hoặc chữ ký sai',
      scenario: 'Gửi token đã hết hạn 10 giây trước',
      expectedStatus: 401,
      actualStatus: res.status,
      passed,
      notes: passed ? `401 Unauthorized. Bị chặn bởi isAuth, không ghi file` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U05: Body thiếu file (empty form-data) -> 400
  // -------------------------------------------------------------------------
  {
    const fd = new FormData(); // Không có file

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });

    const passed = res.status === 400;
    results.push({
      code: 'U05',
      name: 'Body form-data thiếu file',
      scenario: 'Gửi form-data rỗng không chứa key avatar',
      expectedStatus: 400,
      actualStatus: res.status,
      passed,
      notes: passed ? `400 Bad Request: Báo lỗi thiếu file tải lên` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U06: Tên field là photo thay vì avatar -> 400
  // -------------------------------------------------------------------------
  {
    const fd = new FormData();
    fd.append('photo', new Blob([createValidPngBuffer() as any], { type: 'image/png' }), 'avatar-u06.png');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });

    const passed = res.status === 400;
    results.push({
      code: 'U06',
      name: 'Sai tên field (photo thay vì avatar)',
      scenario: 'Gửi file với field name là photo',
      expectedStatus: 400,
      actualStatus: res.status,
      passed,
      notes: passed ? `400 Bad Request: Multer bắt sai field name` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U07: Kích thước file > 2MB -> 413 LIMIT_FILE_SIZE
  // -------------------------------------------------------------------------
  {
    const filesBefore = countUploadFiles();
    // Tạo buffer 2.2MB (2.2 * 1024 * 1024 = 2.306.867 bytes)
    const bigBuffer = new Uint8Array(2.2 * 1024 * 1024);
    bigBuffer.fill(0xaa);
    const fd = new FormData();
    fd.append('avatar', new Blob([bigBuffer as any], { type: 'image/png' }), 'big-avatar.png');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });
    const filesAfter = countUploadFiles();

    const passed = res.status === 413 && filesAfter === filesBefore;
    results.push({
      code: 'U07',
      name: 'File vượt quá kích thước 2MB (> 2.097.152 bytes)',
      scenario: 'Gửi file dung lượng 2.2MB',
      expectedStatus: 413,
      actualStatus: res.status,
      passed,
      notes: passed ? `413 Payload Too Large. Tự dọn sạch file rác (${filesBefore} -> ${filesAfter})` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U08: File TXT đổi đuôi thành avatar.png -> 400 (Chặn giả mạo Magic bytes)
  // -------------------------------------------------------------------------
  {
    const filesBefore = countUploadFiles();
    const fakeContent = new TextEncoder().encode('Day la noi dung van ban thuan tuy gia danh PNG');
    const fd = new FormData();
    fd.append('avatar', new Blob([fakeContent as any], { type: 'image/png' }), 'fake-avatar.png');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });
    const filesAfter = countUploadFiles();

    const passed = res.status === 400 && filesAfter === filesBefore;
    results.push({
      code: 'U08',
      name: 'File văn bản giả mạo đuôi .png (Magic bytes check)',
      scenario: 'Đổi file TXT thành file.png gửi lên',
      expectedStatus: 400,
      actualStatus: res.status,
      passed,
      notes: passed ? `400 Bad Request: Phát hiện chữ ký giả mạo và xóa ngay file rác` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U09: Đuôi .gif / MIME không chấp nhận -> 400
  // -------------------------------------------------------------------------
  {
    const filesBefore = countUploadFiles();
    const gifBuffer = new TextEncoder().encode('GIF89a...');
    const fd = new FormData();
    fd.append('avatar', new Blob([gifBuffer as any], { type: 'image/gif' }), 'animation.gif');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });
    const filesAfter = countUploadFiles();

    const passed = res.status === 400 && filesAfter === filesBefore;
    results.push({
      code: 'U09',
      name: 'Định dạng .gif không nằm trong danh sách cho phép',
      scenario: 'Chỉ chấp nhận JPEG/PNG, từ chối GIF',
      expectedStatus: 400,
      actualStatus: res.status,
      passed,
      notes: passed ? `400 Bad Request: FileFilter từ chối mime/extension gif` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U10: Upload liên tiếp 2 lần cùng tài khoản -> 200, cập nhật URL mới
  // -------------------------------------------------------------------------
  {
    const fd = new FormData();
    fd.append('avatar', new Blob([createValidPngBuffer() as any], { type: 'image/png' }), 'avatar-u10.png');

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });
    const json = (await res.json()) as any;
    studentAAvatarUrl2 = json.data?.avatarUrl || '';

    const passed = res.status === 200 && studentAAvatarUrl2 !== '' && studentAAvatarUrl2 !== studentAAvatarUrl1;
    results.push({
      code: 'U10',
      name: 'Upload liên tiếp 2 lần cùng tài khoản',
      scenario: 'Upload lần 2 cập nhật avatarUrl mới, không bị ghi đè bất ngờ',
      expectedStatus: 200,
      actualStatus: res.status,
      passed,
      notes: passed ? `200 OK. URL mới=${studentAAvatarUrl2} khác URL cũ` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U11: Student A gửi kèm userId của B trong body -> Chỉ A đổi avatar, B nguyên vẹn
  // -------------------------------------------------------------------------
  {
    const userBBefore = await User.findByPk(userBId);
    const avatarBBefore = userBBefore?.avatarUrl;

    const fd = new FormData();
    fd.append('avatar', new Blob([createValidPngBuffer() as any], { type: 'image/png' }), 'avatar-u11.png');
    fd.append('userId', String(userBId)); // Student A cố tình gửi ID của Student B

    const res = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: fd,
    });

    const userBAfter = await User.findByPk(userBId);
    const avatarBAfter = userBAfter?.avatarUrl;

    // Xác minh tài khoản B không hề bị thay đổi
    const bSafe = avatarBBefore === avatarBAfter;

    const passed = res.status === 200 && bSafe;
    results.push({
      code: 'U11',
      name: 'Student A gửi userId của B trong body (Chống sửa chéo)',
      scenario: 'Server tuyệt đối chỉ lấy ID từ JWT (req.user.id), bỏ qua req.body.userId',
      expectedStatus: 200,
      actualStatus: res.status,
      passed,
      notes: passed ? `200 OK. Tài khoản B bất biến (avatarUrl: ${avatarBAfter ?? 'null'})` : `Thất bại`,
    });
  }

  // -------------------------------------------------------------------------
  // U12: Gọi lại GET /api/auth/profile -> 200, URL avatar vẫn giữ nguyên
  // -------------------------------------------------------------------------
  {
    const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const profileJson = (await profileRes.json()) as any;
    const currentAvatarUrl = profileJson.data?.avatarUrl;

    // Kiểm tra ảnh tĩnh còn tồn tại và truy cập được
    let imgOk = false;
    if (currentAvatarUrl) {
      const imgRes = await fetch(`${BASE_URL}${currentAvatarUrl}`);
      imgOk = imgRes.status === 200;
    }

    const passed = profileRes.status === 200 && currentAvatarUrl && imgOk;
    results.push({
      code: 'U12',
      name: 'GET Profile kiểm chứng độ bền vững của avatarUrl & file tĩnh',
      scenario: 'Gọi lại Profile lấy avatarUrl và tải file tĩnh thành công',
      expectedStatus: 200,
      actualStatus: profileRes.status,
      passed,
      notes: passed ? `200 OK. Profile trả đúng ${currentAvatarUrl}, HTTP GET ảnh 200` : `Thất bại`,
    });
  }

  // In bảng tổng kết kết quả
  console.log('\n📊 BẢNG KẾT QUẢ MA TRẬN 12 CA KIỂM THỬ UPLOAD (U01 - U12):');
  console.table(
    results.map((r) => ({
      Mã: r.code,
      'Tên ca test': r.name,
      'Kỳ vọng': r.expectedStatus,
      'Thực tế': r.actualStatus,
      'Kết quả': r.passed ? '✅ PASS' : '❌ FAIL',
      'Ghi chú': r.notes,
    }))
  );

  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`\n🎯 TỔNG KẾT: ${totalPassed} / ${results.length} ca test ĐẠT.`);

  return results;
}

if (process.argv[1]?.includes('run-upload-12-tests')) {
  runUpload12Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Lỗi khi chạy kiểm thử:', err);
      process.exit(1);
    });
}
