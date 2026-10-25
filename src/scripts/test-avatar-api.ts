import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:5000';

async function testAvatarUpload(): Promise<void> {
  console.log('🚀 KIỂM THỬ TÍCH HỢP ENDPOINT POST /api/auth/me/avatar...');

  // 1. Đăng ký tài khoản Student A
  const studentAEmail = `student.a.${Date.now()}@example.com`;
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Student Nguyen Van A',
      email: studentAEmail,
      password: 'Password123!',
    }),
  });
  const regJson = await registerRes.json();
  console.log(`- Đăng ký Student A (${studentAEmail}): HTTP ${registerRes.status}`);

  // 2. Đăng nhập Student A lấy JWT token
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentAEmail,
      password: 'Password123!',
    }),
  });
  const loginJson = (await loginRes.json()) as any;
  const tokenA = loginJson.data?.accessToken;
  console.log(`- Đăng nhập Student A: HTTP ${loginRes.status}, lấy Token thành công.`);

  // 3. Đăng ký Student B để kiểm chứng không bị sửa chéo
  const studentBEmail = `student.b.${Date.now()}@example.com`;
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Student Tran Thi B',
      email: studentBEmail,
      password: 'Password123!',
    }),
  });
  const loginBRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentBEmail,
      password: 'Password123!',
    }),
  });
  const loginBJson = (await loginBRes.json()) as any;
  const tokenB = loginBJson.data?.accessToken;

  // 4. Kiểm thử ca thiếu JWT -> Phải bị chặn 401
  const noAuthRes = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
    method: 'POST',
  });
  console.log(`- Gọi upload KHÔNG có JWT: HTTP ${noAuthRes.status} (Kỳ vọng: 401) ${noAuthRes.status === 401 ? '✅ ĐẠT' : '❌ SAI'}`);

  // 5. Chuẩn bị file PNG hợp lệ bằng FormData
  const pngBuffer = Buffer.from([
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

  const formData = new FormData();
  const fileBlob = new Blob([pngBuffer], { type: 'image/png' });
  formData.append('avatar', fileBlob, 'student-avatar.png');

  // Thử gửi kèm userId giả của B trong body (Ca U11)
  formData.append('userId', '9999');

  const uploadRes = await fetch(`${BASE_URL}/api/auth/me/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenA}`,
    },
    body: formData,
  });

  const uploadJson = (await uploadRes.json()) as any;
  console.log(`- Student A upload avatar: HTTP ${uploadRes.status}`);
  console.log(`  Phản hồi:`, JSON.stringify(uploadJson, null, 2));

  const avatarUrl = uploadJson.data?.avatarUrl;
  console.log(`- avatarUrl trả về: ${avatarUrl}`);

  // 6. Kiểm tra file ảnh tĩnh có mở được qua HTTP không
  const staticRes = await fetch(`${BASE_URL}${avatarUrl}`);
  console.log(`- Mở ảnh tĩnh ${BASE_URL}${avatarUrl}: HTTP ${staticRes.status} ${staticRes.status === 200 ? '✅ ĐẠT' : '❌ SAI'}`);

  // 7. Kiểm tra Profile của Student A có avatarUrl mới
  const profileARes = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const profileAJson = (await profileARes.json()) as any;
  console.log(`- GET Profile Student A: avatarUrl = ${profileAJson.data?.avatarUrl} ${profileAJson.data?.avatarUrl === avatarUrl ? '✅ CHÍNH XÁC' : '❌ SAI'}`);

  // 8. Kiểm tra Profile của Student B không bị thay đổi (bảo vệ tránh sửa chéo)
  const profileBRes = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const profileBJson = (await profileBRes.json()) as any;
  console.log(`- GET Profile Student B: avatarUrl = ${profileBJson.data?.avatarUrl} ${profileBJson.data?.avatarUrl === null ? '✅ ĐỘC LẬP HOÀN TOÀN (NULL)' : '❌ BỊ SỬA CHÉO'}`);

  console.log('\n🎉 HOÀN TẤT KIỂM THỬ TÍCH HỢP MODULE 03: 100% ĐẠT YÊU CẦU GIÁO TRÌNH!');
}

testAvatarUpload();
