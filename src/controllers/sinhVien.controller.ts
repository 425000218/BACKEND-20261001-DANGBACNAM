import type { Request, Response, NextFunction } from "express";
import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
  capNhatSinhVien as capNhatSinhVienService,
  xoaSinhVien as xoaSinhVienService,
  thongKeTheoLopRawQuery,
  thongKeTheoLopSequelize,
  thongKeTheoLopStoredProcedure,
  layDanhSachKemLop,
} from "../services/sinhVien.service.js";
import { parseSinhVienQuery, type ISinhVienQuery } from "../validations/sinhVien.query.js";
import { AppError } from "../utils/AppError.js";

/**
 * 1. Controller lấy danh sách sinh viên có Phân trang và Tìm kiếm (GET /api/v1/sinh-vien)
 * Đọc query đã qua validation, gọi Service findAndCountAll và trả JSON đúng hợp đồng:
 * { success: true, message: "...", data: [...], pagination: { page, limit, totalItems, totalPages } }
 */
export const getDanhSachSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query =
      (req as Request & { validatedQuery?: ISinhVienQuery }).validatedQuery ??
      parseSinhVienQuery(req.query as Record<string, unknown>);

    const result = await layDanhSachSinhVien(query);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sinh viên thành công",
      data: result.data,
      pagination: result.pagination,
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
      throw new AppError(404, "Không tìm thấy sinh viên");
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

/**
 * 6. [MỞ RỘNG BUỔI 10] Controller Thống kê sinh viên theo lớp (GET /api/v1/sinh-vien/thong-ke)
 */
export const getThongKeTheoLop = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const methodType = String(req.query.type ?? "sequelize").toLowerCase();
    let data;
    let ghiChu = "Sequelize Method group/count";

    if (methodType === "raw") {
      data = await thongKeTheoLopRawQuery();
      ghiChu = "Raw SQL Query";
    } else if (methodType === "sp") {
      data = await thongKeTheoLopStoredProcedure();
      ghiChu = "Stored Procedure dbo.sp_ThongKeSinhVienTheoLop";
    } else {
      data = await thongKeTheoLopSequelize();
    }

    res.status(200).json({
      success: true,
      message: `Thống kê sinh viên theo lớp thành công (${ghiChu})`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. [MỞ RỘNG BUỔI 10] Controller lấy sinh viên kèm thông tin lớp (GET /api/v1/sinh-vien/kem-lop)
 */
export const getSinhVienKemLop = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await layDanhSachKemLop();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách sinh viên kèm lớp thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};
