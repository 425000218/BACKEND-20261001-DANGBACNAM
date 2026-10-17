import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = Router();

// Tuyến đường Đăng ký tài khoản (Public)
router.post('/register', register);

// Tuyến đường Đăng nhập tài khoản & nhận Access Token (Public)
router.post('/login', login);

// Tuyến đường Xem thông tin hồ sơ tài khoản (Protected - Yêu cầu Bearer Token)
router.get('/profile', isAuth, getProfile);

export default router;
