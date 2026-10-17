import { Router } from "express";
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
  capNhatSinhVien,
  xoaSinhVien,
} from "../controllers/sinhVien.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// 1. Lấy danh sách sinh viên (Public - Không yêu cầu token)
router.get("/", getDanhSachSinhVien);

// 2. Tìm sinh viên theo mã sinh viên (Public - Không yêu cầu token)
router.get("/:maSV", getSinhVienTheoMa);

// 3. Thêm sinh viên mới (Chỉ dành cho Admin: yêu cầu token hợp lệ & role === 'admin')
router.post("/", isAuth, isAdmin, taoSinhVien);

// 4. Cập nhật sinh viên theo mã (Chỉ dành cho Admin)
router.put("/:maSV", isAuth, isAdmin, capNhatSinhVien);

// 5. Xóa sinh viên theo mã (Chỉ dành cho Admin)
router.delete("/:maSV", isAuth, isAdmin, xoaSinhVien);

export default router;

