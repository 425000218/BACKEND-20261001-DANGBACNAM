import type { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service.js';

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

/**
 * Controller xử lý yêu cầu Đăng nhập tài khoản (POST /api/auth/login)
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authData = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};
