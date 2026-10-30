import { Router } from "express";
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
  capNhatSinhVien,
  xoaSinhVien,
  getThongKeTheoLop,
  getSinhVienKemLop,
} from "../controllers/sinhVien.controller.js";
import { validateSinhVienQuery } from "../validations/sinhVien.query.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// 1. Lấy danh sách sinh viên có Phân trang & Tìm kiếm (Public - Không yêu cầu token)
router.get("/", validateSinhVienQuery, getDanhSachSinhVien);

// 2. [MỞ RỘNG BUỔI 10] Thống kê sinh viên theo lớp (Raw Query, Sequelize, SP)
router.get("/thong-ke", getThongKeTheoLop);

// 3. [MỞ RỘNG BUỔI 10] Danh sách sinh viên kèm thông tin lớp (JOIN)
router.get("/kem-lop", getSinhVienKemLop);

// 4. [LAB 2 - E05/E06/E07] Route test mô phỏng lỗi 500 an toàn trong môi trường kiểm thử
router.get("/test-500", () => {
  throw new Error("Lỗi mô phỏng 500 phục vụ kiểm thử hệ thống");
});

// 5. Tìm sinh viên theo mã sinh viên (Public - Không yêu cầu token)
router.get("/:maSV", getSinhVienTheoMa);

// 6. Thêm sinh viên mới (Chỉ dành cho Admin: yêu cầu token hợp lệ & role === 'admin')
router.post("/", isAuth, isAdmin, taoSinhVien);

// 7. Cập nhật sinh viên theo mã (Chỉ dành cho Admin)
router.put("/:maSV", isAuth, isAdmin, capNhatSinhVien);

// 8. Xóa sinh viên theo mã (Chỉ dành cho Admin)
router.delete("/:maSV", isAuth, isAdmin, xoaSinhVien);

export default router;
