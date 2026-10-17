import type { Request, Response, NextFunction } from 'express';
import { registerUser } from '../services/auth.service.js';

/**
 * Controller xử lý yêu cầu Đăng ký tài khoản (POST /api/auth/register)
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
