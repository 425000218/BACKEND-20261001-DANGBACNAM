import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware phân quyền Admin (Role-Based Access Control - RBAC)
 * - Yêu cầu người dùng đã được xác thực qua isAuth trước đó (có req.user)
 * - Kiểm tra req.user.role === 'admin'
 * - Nếu không phải admin, trả về lỗi 403 Forbidden (Ca B05, B06, B07)
 */
export const isAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AppError(401, 'Yêu cầu Bearer token để xác thực');
  }

  if (req.user.role !== 'admin') {
    throw new AppError(403, 'Yêu cầu quyền Quản trị viên (admin)');
  }

  next();
};
