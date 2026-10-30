import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app.js';
import { sequelize } from '../../src/config/database.js';

describe('Lab 1 - API Test với Supertest cho Authentication & Profile (A01 - A07)', () => {
  let validToken = '';

  afterAll(async () => {
    // Đóng kết nối CSDL sau khi hoàn thành toàn bộ test suite để tránh open handles
    try {
      await sequelize.close();
    } catch {
      // Bỏ qua lỗi đóng kết nối nếu có
    }
  });

  // A01: Login hợp lệ
  it('A01: Login với thông tin chính xác -> Trả về HTTP 200 và cấp Access Token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data.tokenType).toBe('Bearer');
    expect(typeof response.body.data.accessToken).toBe('string');
    validToken = response.body.data.accessToken;
  });

  // A02: Sai mật khẩu
  it('A02: Login với mật khẩu sai -> Trả về HTTP 401 và không cấp JWT', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'MatKhauKhongDung@123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(response.body.accessToken).toBeUndefined();
  });

  // A03: User không tồn tại
  it('A03: Login với email không tồn tại -> Trả về HTTP 401 và không cấp JWT', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'email_chua_dang_ky_999@example.com',
        password: 'MatKhau@123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(response.body.accessToken).toBeUndefined();
  });

  // A04: Thiếu trường bắt buộc
  it('A04: Request login thiếu trường password -> Trả về HTTP 400 Bad Request', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
  });

  // A05: GET Profile không gửi JWT
  it('A05: GET /api/auth/profile không gửi kèm Authorization header -> Trả về HTTP 401', async () => {
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.status).toBe(401);
  });

  // A06: GET Profile với JWT hợp lệ
  it('A06: GET /api/auth/profile với Bearer Token hợp lệ -> Trả về HTTP 200 và thông tin User', async () => {
    expect(validToken).not.toBe('');

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('email', 'admin@example.com');
    expect(response.body.data).toHaveProperty('role', 'admin');
    expect(response.body.data.passwordHash).toBeUndefined();
    expect(response.body.data.password).toBeUndefined();
  });

  // A07: Lỗi hệ thống giả lập
  it('A07: Lỗi 500 giả lập -> Trả về HTTP 500 chuẩn hóa, không lộ thông tin nhạy cảm', async () => {
    const response = await request(app).get('/api/v1/sinh-vien/test-500');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.status).toBe(500);
    expect(response.body.data).toBeNull();
    // Đảm bảo không để lộ mật khẩu, chuỗi kết nối
    const responseStr = JSON.stringify(response.body);
    expect(responseStr).not.toContain('password');
    expect(responseStr).not.toContain('JWT_SECRET');
  });
});
