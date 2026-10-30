import {
  UniqueConstraintError,
  ForeignKeyConstraintError,
  Op,
  fn,
  col,
  QueryTypes,
  type WhereOptions,
} from "sequelize";
import type { ISinhVienDTO } from "../dtos/sinhVien.dto.js";
import { SinhVien, Lop } from "../models/index.js";
import { sequelize } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

export interface IPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: IPaginationMeta;
}

/**
 * 1. Lấy danh sách sinh viên từ SQL Server có hỗ trợ Phân trang và Tìm kiếm (Chương 08)
 * Sử dụng findAndCountAll tại tầng Database, sắp xếp cố định ORDER BY maSV ASC.
 * - rows: mảng sinh viên thuộc trang hiện tại (không tải toàn bộ rồi slice).
 * - count: tổng số sinh viên thỏa điều kiện search hoTen.
 * - Khi không có dữ liệu: data = [], totalPages = 0, totalItems = 0.
 */
export const layDanhSachSinhVien = async (
  queryOptions?: { page?: number; limit?: number; search?: string }
): Promise<IPaginatedResult<ISinhVienDTO>> => {
  const page = queryOptions?.page ?? 1;
  const limit = queryOptions?.limit ?? 10;
  const search = queryOptions?.search ? queryOptions.search.trim() : "";

  const offset = (page - 1) * limit;

  // Điều kiện tìm kiếm theo hoTen (áp dụng trước khi đếm và chia trang)
  const where: WhereOptions = {};
  if (search.length > 0) {
    where.hoTen = { [Op.like]: `%${search}%` };
  }

  // Thực hiện phân trang thật tại SQL Server với findAndCountAll
  const { rows, count } = await SinhVien.findAndCountAll({
    where,
    limit,
    offset,
    order: [["maSV", "ASC"]],
  });

  const totalPages = count === 0 ? 0 : Math.ceil(count / limit);

  return {
    data: rows.map((sv) => ({
      maSV: sv.maSV,
      hoTen: sv.hoTen,
      email: sv.email,
      maLop: sv.maLop,
    })),
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages,
    },
  };
};

/**
 * 2. Tìm sinh viên theo khóa chính maSV từ SQL Server
 */
export const timSinhVienTheoMa = async (
  maSV: string,
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
 * 3. Thêm sinh viên mới vào SQL Server (POST)
 */
export const themSinhVien = async (input: unknown): Promise<ISinhVienDTO> => {
  // 1. Kiểm tra input phải là đối tượng JSON hợp lệ
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new AppError(400, "Dữ liệu gửi lên phải là một đối tượng JSON");
  }

  const rawData = input as Record<string, unknown>;

  // 2. Kiểm tra tồn tại và đúng kiểu string cho cả 4 trường
  if (
    typeof rawData.maSV !== "string" ||
    typeof rawData.hoTen !== "string" ||
    typeof rawData.email !== "string" ||
    typeof rawData.maLop !== "string"
  ) {
    throw new AppError(
      400,
      "Cần cung cấp đủ 4 trường maSV, hoTen, email, maLop có kiểu chuỗi (string)",
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
      "Mã sinh viên không đúng định dạng. Yêu cầu dạng SV kèm 3 chữ số (ví dụ: SV003)",
    );
  }

  // 5. Kiểm tra chuỗi rỗng
  if (hoTen.length === 0 || maLop.length === 0) {
    throw new AppError(400, "Họ tên và mã lớp không được để trống");
  }

  // 6. Kiểm tra giới hạn độ dài theo schema bảng SQL (không tự cắt chuỗi)
  if (hoTen.length > 150) {
    throw new AppError(400, "Họ tên không được vượt quá 150 ký tự");
  }
  if (email.length > 254) {
    throw new AppError(400, "Email không được vượt quá 254 ký tự");
  }
  if (maLop.length > 50) {
    throw new AppError(400, "Mã lớp không được vượt quá 50 ký tự");
  }

  // 7. Kiểm tra định dạng email cơ bản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, "Email không đúng định dạng");
  }

  // 8. Kiểm tra trước xem maSV đã tồn tại trong database chưa
  const existing = await SinhVien.findByPk(maSV);
  if (existing) {
    throw new AppError(409, "Mã sinh viên đã tồn tại");
  }

  // 9. Thêm bản ghi mới vào CSDL, bắt thêm lỗi UniqueConstraintError
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
      throw new AppError(409, "Mã sinh viên đã tồn tại");
    }
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(400, "Mã lớp không tồn tại");
    }
    throw error;
  }
};

/**
 * 4. Cập nhật thông tin sinh viên theo maSV (PUT)
 */
export const capNhatSinhVien = async (
  maSV: string,
  input: unknown,
): Promise<ISinhVienDTO> => {
  // 1. Kiểm tra input là object
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new AppError(400, "Dữ liệu gửi lên phải là một đối tượng JSON");
  }

  const rawData = input as Record<string, unknown>;

  // 2. Kiểm tra đủ 3 trường chuỗi: hoTen, email, maLop
  if (
    typeof rawData.hoTen !== "string" ||
    typeof rawData.email !== "string" ||
    typeof rawData.maLop !== "string"
  ) {
    throw new AppError(
      400,
      "Cần cung cấp đủ 3 trường hoTen, email, maLop có kiểu chuỗi (string)",
    );
  }

  const hoTen = rawData.hoTen.trim();
  const email = rawData.email.trim();
  const maLop = rawData.maLop.trim();

  // 3. Validation rỗng, độ dài và regex email
  if (hoTen.length === 0 || maLop.length === 0) {
    throw new AppError(400, "Họ tên và mã lớp không được để trống");
  }
  if (hoTen.length > 150) {
    throw new AppError(400, "Họ tên không được vượt quá 150 ký tự");
  }
  if (email.length > 254) {
    throw new AppError(400, "Email không được vượt quá 254 ký tự");
  }
  if (maLop.length > 50) {
    throw new AppError(400, "Mã lớp không được vượt quá 50 ký tự");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, "Email không đúng định dạng");
  }

  // 4. Tìm sinh viên cần sửa theo maSV
  const sv = await SinhVien.findByPk(maSV);
  if (!sv) {
    throw new AppError(404, "Không tìm thấy sinh viên");
  }

  // 5. Thực hiện cập nhật vào CSDL
  try {
    await sv.update({ hoTen, email, maLop });

    return {
      maSV: sv.maSV,
      hoTen: sv.hoTen,
      email: sv.email,
      maLop: sv.maLop,
    };
  } catch (error: unknown) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(400, "Mã lớp không tồn tại");
    }
    throw error;
  }
};

/**
 * 5. Xóa sinh viên theo maSV (DELETE)
 */
export const xoaSinhVien = async (maSV: string): Promise<void> => {
  const sv = await SinhVien.findByPk(maSV);
  if (!sv) {
    throw new AppError(404, "Không tìm thấy sinh viên");
  }

  await sv.destroy();
};

/**
 * 6. [MỞ RỘNG BUỔI 10 - A] Thống kê số lượng sinh viên theo lớp bằng Raw SQL Query
 */
export const thongKeTheoLopRawQuery = async (): Promise<Array<{ maLop: string; totalStudents: number }>> => {
  const query = `
    SELECT maLop, COUNT(*) AS totalStudents
    FROM dbo.SinhVien
    GROUP BY maLop
    ORDER BY maLop ASC;
  `;
  const results = await sequelize.query<{ maLop: string; totalStudents: number }>(query, {
    type: QueryTypes.SELECT,
  });
  return results.map(r => ({
    maLop: r.maLop,
    totalStudents: Number(r.totalStudents),
  }));
};

/**
 * 7. [MỞ RỘNG BUỔI 10 - B] Thống kê số lượng sinh viên theo lớp bằng Sequelize Group/Count Method
 */
export const thongKeTheoLopSequelize = async (): Promise<Array<{ maLop: string; totalStudents: number }>> => {
  const results = (await SinhVien.findAll({
    attributes: ["maLop", [fn("COUNT", col("maSV")), "totalStudents"]],
    group: ["maLop"],
    order: [["maLop", "ASC"]],
    raw: true,
  })) as unknown as Array<{ maLop: string; totalStudents: number | string }>;

  return results.map(r => ({
    maLop: r.maLop,
    totalStudents: Number(r.totalStudents),
  }));
};

/**
 * 8. [MỞ RỘNG BUỔI 10 - C] Thống kê qua Stored Procedure chỉ đọc dbo.sp_ThongKeSinhVienTheoLop
 */
export const thongKeTheoLopStoredProcedure = async (): Promise<Array<{ maLop: string; totalStudents: number }>> => {
  const query = `EXEC dbo.sp_ThongKeSinhVienTheoLop;`;
  const results = await sequelize.query<{ maLop: string; totalStudents: number }>(query, {
    type: QueryTypes.SELECT,
  });
  return results.map(r => ({
    maLop: r.maLop,
    totalStudents: Number(r.totalStudents),
  }));
};

/**
 * 9. [MỞ RỘNG BUỔI 10 - D] Lấy danh sách Sinh viên JOIN với bảng Lop
 */
export const layDanhSachKemLop = async (): Promise<Array<ISinhVienDTO & { tenLop?: string }>> => {
  const danhSach = await SinhVien.findAll({
    include: [
      {
        model: Lop,
        as: "lop",
        attributes: ["tenLop"],
      },
    ],
    order: [["maSV", "ASC"]],
  });

  return danhSach.map(sv => ({
    maSV: sv.maSV,
    hoTen: sv.hoTen,
    email: sv.email,
    maLop: sv.maLop,
    tenLop: (sv as unknown as { lop?: { tenLop: string } }).lop?.tenLop,
  }));
};
