import { Router } from 'express';
import { register } from '../controllers/auth.controller.js';

const router = Router();

// Tuyến đường Đăng ký tài khoản (Public)
router.post('/register', register);

export default router;
