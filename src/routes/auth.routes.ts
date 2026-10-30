import { Router } from 'express';
import { register, login, getProfile, uploadAvatar } from '../controllers/auth.controller.js';
import { isAuth } from '../middlewares/isAuth.js';
import { uploadAvatarMiddleware } from '../middlewares/upload.middleware.js';
import { loginLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();

// Tuyến đường Đăng ký tài khoản (Public)
router.post('/register', register);

// Tuyến đường Đăng nhập tài khoản & nhận Access Token (Public + Rate Limiter 5 req/phút)
router.post('/login', loginLimiter, login);

// Tuyến đường Xem thông tin hồ sơ tài khoản (Protected - Yêu cầu Bearer Token)
router.get('/profile', isAuth, getProfile);

// Tuyến đường Cập nhật ảnh đại diện (Protected - Yêu cầu Bearer Token + file avatar)
router.post('/me/avatar', isAuth, uploadAvatarMiddleware, uploadAvatar);

export default router;
