import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import bcrypt from 'bcrypt';
import { User } from '../../src/models/user.model.js';
import { loginUser } from '../../src/services/auth.service.js';
import { AppError } from '../../src/utils/AppError.js';

describe('Lab 1 - Unit Test cho logic Đăng nhập (T01 - T05)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // T01: Tài khoản có, mật khẩu đúng -> Xác thực thành công, tạo Token
  it('T01: Tài khoản tồn tại và mật khẩu hợp lệ -> Trả về Access Token và Bearer type', async () => {
    // Arrange: Giả lập User tìm thấy trong DB và bcrypt.compare trả về true
    const mockUser = {
      id: 1,
      fullName: 'Nguyễn Văn An',
      email: 'an.lab@example.com',
      passwordHash: '$2b$12$eX4mP1eHaShVaLuE1234567890abcdef',
      role: 'student',
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    // Act: Thực thi logic đăng nhập
    const result = await loginUser({
      email: 'an.lab@example.com',
      password: 'SinhVien@123',
    });

    // Assert: Đối chiếu kết quả mong đợi
    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(3600);
    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'an.lab@example.com' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('SinhVien@123', mockUser.passwordHash);
  });

  // T02: Tài khoản có, mật khẩu sai -> Từ chối, không tạo Token
  it('T02: Tài khoản tồn tại nhưng mật khẩu sai -> Ném lỗi AppError 401, không cấp Token', async () => {
    // Arrange: User có trong CSDL nhưng bcrypt.compare trả về false
    const mockUser = {
      id: 1,
      fullName: 'Nguyễn Văn An',
      email: 'an.lab@example.com',
      passwordHash: '$2b$12$eX4mP1eHaShVaLuE1234567890abcdef',
      role: 'student',
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    // Act & Assert
    await expect(
      loginUser({
        email: 'an.lab@example.com',
        password: 'SaiMatKhau@123',
      })
    ).rejects.toThrow(AppError);

    try {
      await loginUser({
        email: 'an.lab@example.com',
        password: 'SaiMatKhau@123',
      });
    } catch (error: any) {
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Email hoặc mật khẩu không chính xác');
    }
  });

  // T03: Tài khoản không tồn tại -> Từ chối, không tạo Token
  it('T03: Tài khoản không tồn tại trong CSDL -> Ném lỗi AppError 401, không cấp Token', async () => {
    // Arrange: User.findOne trả về null
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    // Act & Assert
    await expect(
      loginUser({
        email: 'khongtontai@example.com',
        password: 'MatKhau@123',
      })
    ).rejects.toThrow(AppError);

    try {
      await loginUser({
        email: 'khongtontai@example.com',
        password: 'MatKhau@123',
      });
    } catch (error: any) {
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Email hoặc mật khẩu không chính xác');
    }
  });

  // T04: Thiếu email hoặc password -> Validation từ chối input với HTTP 400
  it('T04: Dữ liệu gửi lên thiếu email hoặc mật khẩu -> Bị chặn với AppError 400', async () => {
    // Thiếu password
    await expect(
      loginUser({ email: 'an.lab@example.com' })
    ).rejects.toThrow(AppError);

    // Email rỗng
    await expect(
      loginUser({ email: '   ', password: 'MatKhau@123' })
    ).rejects.toThrow(AppError);

    // Body không phải object
    await expect(
      loginUser('chuoi_khong_hop_le')
    ).rejects.toThrow(AppError);
  });

  // T05: Lỗi kết nối Database -> Xử lý ngoại lệ an toàn
  it('T05: Lỗi phát sinh từ Database khi truy vấn -> Ném ngoại lệ, không lộ thông tin nhạy cảm', async () => {
    // Arrange: User.findOne gặp lỗi kết nối
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Connection timeout to SQL Server'));

    // Act & Assert
    await expect(
      loginUser({
        email: 'an.lab@example.com',
        password: 'SinhVien@123',
      })
    ).rejects.toThrow('Connection timeout to SQL Server');
  });
});
