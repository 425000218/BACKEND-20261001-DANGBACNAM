import type { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserProfile } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

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

/**
 * Controller lấy thông tin tài khoản hiện tại (GET /api/auth/profile)
 * Yêu cầu đăng nhập (đã qua isAuth)
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError(401, 'Yêu cầu Bearer token để xác thực');
    }
    const profile = await getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin hồ sơ thành công',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
