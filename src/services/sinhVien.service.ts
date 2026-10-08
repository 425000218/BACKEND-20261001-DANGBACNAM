import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import type { ISinhVienDTO } from '../dtos/sinhVien.dto.js';
import { SinhVien, Lop } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Lấy toàn bộ danh sách sinh viên từ SQL Server, sắp xếp theo maSV tăng dần
 */
export const layDanhSachSinhVien = async (): Promise<ISinhVienDTO[]> => {
  const danhSach = await SinhVien.findAll({
    order: [['maSV', 'ASC']],
  });

  // Chuyển đổi Model instance sang plain DTO đúng 4 trường
  return danhSach.map((sv) => ({
    maSV: sv.maSV,
    hoTen: sv.hoTen,
    email: sv.email,
    maLop: sv.maLop,
  }));
};

/**
 * Tìm sinh viên theo khóa chính maSV từ SQL Server
 */
export const timSinhVienTheoMa = async (
  maSV: string
): Promise<ISinhVienDTO | undefined> => {
  const sv = await SinhVien.findByPk(maSV);
  if (!sv) {
    return undefined; // Trả về undefined để Controller nhận biết và trả mã lỗi 404
  }

  return {
    maSV: sv.maSV,
    hoTen: sv.hoTen,
    email: sv.email,
    maLop: sv.maLop,
  };
};

/**
 * Thêm sinh viên mới vào SQL Server với kiểm tra validation, độ dài cột và ràng buộc khóa ngoại Lop
 */
export const themSinhVien = async (input: unknown): Promise<ISinhVienDTO> => {
  // 1. Kiểm tra input phải là đối tượng JSON hợp lệ
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AppError(400, 'Dữ liệu gửi lên phải là một đối tượng JSON');
  }

  const rawData = input as Record<string, unknown>;

  // 2. Kiểm tra tồn tại và đúng kiểu string cho cả 4 trường
  if (
    typeof rawData.maSV !== 'string' ||
    typeof rawData.hoTen !== 'string' ||
    typeof rawData.email !== 'string' ||
    typeof rawData.maLop !== 'string'
  ) {
    throw new AppError(
      400,
      'Cần cung cấp đủ 4 trường maSV, hoTen, email, maLop có kiểu chuỗi (string)'
    );
  }

  // 3. Trim khoảng trắng thừa ở hai đầu
  const maSV = rawData.maSV.trim();
  const hoTen = rawData.hoTen.trim();
  const email = rawData.email.trim();
  const maLop = rawData.maLop.trim();

  // 4. Kiểm tra định dạng maSV theo regex SV kèm 3 chữ số
  const maSVRegex = /^SV[0-9]{3}$/;
  if (!maSVRegex.test(maSV)) {
    throw new AppError(
      400,
      'Mã sinh viên không đúng định dạng. Yêu cầu dạng SV kèm 3 chữ số (ví dụ: SV003)'
    );
  }

  // 5. Kiểm tra chuỗi rỗng
  if (hoTen.length === 0 || maLop.length === 0) {
    throw new AppError(400, 'Họ tên và mã lớp không được để trống');
  }

  // 6. Kiểm tra giới hạn độ dài theo schema bảng SQL (không tự cắt chuỗi)
  if (hoTen.length > 150) {
    throw new AppError(400, 'Họ tên không được vượt quá 150 ký tự');
  }
  if (email.length > 254) {
    throw new AppError(400, 'Email không được vượt quá 254 ký tự');
  }
  if (maLop.length > 50) {
    throw new AppError(400, 'Mã lớp không được vượt quá 50 ký tự');
  }

  // 7. Kiểm tra định dạng email cơ bản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Email không đúng định dạng');
  }

  // 8. Ràng buộc quan hệ Lớp: Kiểm tra mã lớp có tồn tại trong bảng dbo.Lop không
  const lop = await Lop.findByPk(maLop);
  if (!lop) {
    throw new AppError(400, 'Mã lớp không tồn tại');
  }

  // 9. Kiểm tra trước xem maSV đã tồn tại trong database chưa
  const existing = await SinhVien.findByPk(maSV);
  if (existing) {
    throw new AppError(409, 'Mã sinh viên đã tồn tại');
  }

  // 10. Thêm bản ghi mới vào CSDL, bắt thêm lỗi UniqueConstraintError & ForeignKeyConstraintError
  try {
    const created = await SinhVien.create({
      maSV,
      hoTen,
      email,
      maLop,
    });

    return {
      maSV: created.maSV,
      hoTen: created.hoTen,
      email: created.email,
      maLop: created.maLop,
    };
  } catch (error: unknown) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'Mã sinh viên đã tồn tại');
    }
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(400, 'Mã lớp không tồn tại');
    }
    throw error;
  }
};
