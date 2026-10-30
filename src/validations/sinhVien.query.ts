import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export interface ISinhVienQuery {
  page: number;
  limit: number;
  search: string;
}

/**
 * Hàm kiểm tra và chuẩn hóa query string cho API phân trang và tìm kiếm sinh viên
 * Tuân thủ quy chuẩn Lab 1 Chương 08:
 *  - page: Số nguyên >= 1, mặc định 1. Lỗi trả 400.
 *  - limit: Số nguyên 1..50, mặc định 10. Vượt 50 hoặc không hợp lệ trả 400.
 *  - search: Chuỗi theo hoTen, trim, tối đa 80 ký tự. Vượt 80 trả 400.
 */
export function parseSinhVienQuery(rawQuery: Record<string, unknown>): ISinhVienQuery {
  let page = 1;
  let limit = 10;
  let search = '';

  // 1. Kiểm tra tham số page
  if (rawQuery.page !== undefined && rawQuery.page !== null && rawQuery.page !== '') {
    const pageStr = String(rawQuery.page).trim();
    // Bắt buộc là chuỗi chỉ gồm chữ số (không cho số âm, số thập phân, chữ cái)
    if (!/^\d+$/.test(pageStr)) {
      throw new AppError(400, 'Tham số page không hợp lệ. Phải là số nguyên dương (>= 1).');
    }
    const parsedPage = Number(pageStr);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new AppError(400, 'Tham số page không hợp lệ. Trang bắt đầu từ 1.');
    }
    page = parsedPage;
  }

  // 2. Kiểm tra tham số limit
  if (rawQuery.limit !== undefined && rawQuery.limit !== null && rawQuery.limit !== '') {
    const limitStr = String(rawQuery.limit).trim();
    if (!/^\d+$/.test(limitStr)) {
      throw new AppError(400, 'Tham số limit không hợp lệ. Phải là số nguyên.');
    }
    const parsedLimit = Number(limitStr);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      throw new AppError(400, 'Tham số limit không hợp lệ. Vượt giới hạn cho phép (1 - 50).');
    }
    limit = parsedLimit;
  }

  // 3. Kiểm tra tham số search
  if (rawQuery.search !== undefined && rawQuery.search !== null) {
    if (typeof rawQuery.search !== 'string') {
      throw new AppError(400, 'Tham số search phải là chuỗi ký tự.');
    }
    const trimmedSearch = rawQuery.search.trim();
    if (trimmedSearch.length > 80) {
      throw new AppError(400, 'Từ khóa tìm kiếm không được vượt quá 80 ký tự.');
    }
    search = trimmedSearch;
  }

  return { page, limit, search };
}

/**
 * Middleware Express gắn trước controller GET /api/v1/sinh-vien
 */
export const validateSinhVienQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const validated = parseSinhVienQuery(req.query as Record<string, unknown>);
    (req as Request & { validatedQuery: ISinhVienQuery }).validatedQuery = validated;
    next();
  } catch (error) {
    next(error);
  }
};
