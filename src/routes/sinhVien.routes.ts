import { Router } from "express";
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
  capNhatSinhVien,
  xoaSinhVien,
} from "../controllers/sinhVien.controller.js";

const router = Router();

// 1. Lấy danh sách sinh viên
router.get("/", getDanhSachSinhVien);

// 2. Tìm sinh viên theo mã sinh viên
router.get("/:maSV", getSinhVienTheoMa);

// 3. Thêm sinh viên mới
router.post("/", taoSinhVien);

// 4. Cập nhật sinh viên theo mã
router.put("/:maSV", capNhatSinhVien);

// 5. Xóa sinh viên theo mã
router.delete("/:maSV", xoaSinhVien);

export default router;

