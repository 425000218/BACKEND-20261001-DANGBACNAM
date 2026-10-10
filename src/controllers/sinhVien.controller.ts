import type { Request, Response, NextFunction } from "express";
import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
  capNhatSinhVien as capNhatSinhVienService,
  xoaSinhVien as xoaSinhVienService,
} from "../services/sinhVien.service.js";

/**
 * 1. Controller lấy toàn bộ danh sách sinh viên từ CSDL (GET /api/v1/sinh-vien)
 */
export const getDanhSachSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await layDanhSachSinhVien();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách sinh viên thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Controller tìm sinh viên theo maSV (GET /api/v1/sinh-vien/:maSV)
 */
export const getSinhVienTheoMa = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { maSV } = req.params;
    const sinhVien = await timSinhVienTheoMa(maSV as string);

    if (!sinhVien) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Tìm sinh viên thành công",
      data: sinhVien,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Controller thêm sinh viên mới vào CSDL (POST /api/v1/sinh-vien)
 */
export const taoSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const newSinhVien = await themSinhVien(req.body);
    res.status(201).json({
      success: true,
      message: "Thêm sinh viên thành công",
      data: newSinhVien,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Controller cập nhật sinh viên (PUT /api/v1/sinh-vien/:maSV)
 */
export const capNhatSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { maSV } = req.params;
    const updatedSinhVien = await capNhatSinhVienService(
      maSV as string,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật sinh viên thành công",
      data: updatedSinhVien,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Controller xóa sinh viên (DELETE /api/v1/sinh-vien/:maSV)
 */
export const xoaSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { maSV } = req.params;
    await xoaSinhVienService(maSV as string);
    res.status(200).json({
      success: true,
      message: "Xóa sinh viên thành công",
    });
  } catch (error) {
    next(error);
  }
};
