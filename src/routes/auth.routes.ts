import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// Tuyến đường Đăng ký tài khoản (Public)
router.post('/register', register);

// Tuyến đường Đăng nhập tài khoản & nhận Access Token (Public)
router.post('/login', login);

export default router;
