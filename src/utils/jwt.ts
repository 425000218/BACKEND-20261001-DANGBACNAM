import 'dotenv/config';
import jwt from 'jsonwebtoken';
import type { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { AppError } from './AppError.js';

// 1. Kiểm tra cấu hình bắt buộc JWT_SECRET từ biến môi trường
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('Lỗi cấu hình: JWT_SECRET chưa được thiết lập trong biến môi trường hoặc đang rỗng.');
  }
  return secret;
};

/**
 * Cấu trúc dữ liệu chứa trong payload của Access Token
 */
export interface ITokenPayload {
  sub: string; // ID của User (chuỗi)
  role: string; // 'student' hoặc 'admin'
  iat?: number; // Thời điểm tạo
  exp?: number; // Thời điểm hết hạn
}

/**
 * Ký tạo Access Token mới với thời hạn mặc định 1 giờ và thuật toán HS256
 */
export const generateToken = (payload: { sub: string; role: string }): string => {
  const secret = getJwtSecret();
  const signOptions: SignOptions = {
    algorithm: 'HS256',
    expiresIn: '1h',
  };

  return jwt.sign(
    {
      sub: String(payload.sub),
      role: payload.role,
    },
    secret,
    signOptions
  );
};

/**
 * Xác minh chữ ký số, thời hạn và giải mã payload của Access Token
 * Bắt buộc dùng thuật toán HS256, tuyệt đối không dùng jwt.decode để kiểm tra quyền
 */
export const verifyToken = (token: string): ITokenPayload => {
  const secret = getJwtSecret();
  const verifyOptions: VerifyOptions = {
    algorithms: ['HS256'],
  };

  try {
    const decoded = jwt.verify(token, secret, verifyOptions);
    return decoded as ITokenPayload;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      throw new AppError(401, 'Token đã hết hạn');
    }
    throw new AppError(401, 'Token không hợp lệ hoặc sai chữ ký');
  }
};
