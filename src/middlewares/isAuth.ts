import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware xác thực Bearer JWT Token (Chương 06)
 * - Kiểm tra sự tồn tại của header Authorization
 * - Kiểm tra định dạng bắt buộc: 'Bearer <token>'
 * - Xác minh chữ ký số và thời hạn với HS256 thông qua verifyToken
 * - Gán payload đã giải mã vào req.user { id: sub, role }
 */
export const isAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(401, 'Yêu cầu Bearer token để xác thực');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
    throw new AppError(401, "Định dạng Authorization header không hợp lệ (cần 'Bearer <token>')");
  }

  const token = parts[1].trim();
  const payload = verifyToken(token);

  req.user = {
    id: payload.sub,
    role: payload.role,
  };

  next();
};
