import { Router } from 'express';
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
} from '../controllers/sinhVien.controller.js';

const router = Router();

// Lấy danh sách sinh viên
router.get('/', getDanhSachSinhVien);

// Tìm sinh viên theo mã sinh viên
router.get('/:maSV', getSinhVienTheoMa);

// Thêm sinh viên mới
router.post('/', taoSinhVien);

export default router;
