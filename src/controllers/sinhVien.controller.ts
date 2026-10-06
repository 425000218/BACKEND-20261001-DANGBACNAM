import type { Request, Response, NextFunction } from 'express';
import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
} from '../services/sinhVien.service.js';

/**
 * Controller lấy toàn bộ danh sách sinh viên từ CSDL
 */
export const getDanhSachSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await layDanhSachSinhVien();
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sinh viên thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller tìm sinh viên theo maSV
 */
export const getSinhVienTheoMa = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { maSV } = req.params;
    const sinhVien = await timSinhVienTheoMa(maSV as string);

    if (!sinhVien) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tìm sinh viên thành công',
      data: sinhVien,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller thêm sinh viên mới vào CSDL
 */
export const taoSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newSinhVien = await themSinhVien(req.body);
    res.status(201).json({
      success: true,
      message: 'Thêm sinh viên thành công',
      data: newSinhVien,
    });
  } catch (error) {
    next(error);
  }
};
