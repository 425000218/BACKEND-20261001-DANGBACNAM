import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../utils/jwt.js';

export interface IUserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

/**
 * Service xử lý Đăng ký tài khoản mới (POST /api/auth/register)
 * - Kiểm tra định dạng dữ liệu (Validation)
 * - Từ chối khi client cố tình gửi trường role (A03)
 * - Băm mật khẩu bằng bcrypt với cost 12
 * - Lưu role mặc định là 'student'
 * - Kiểm tra trùng lặp email (409 Conflict)
 */
export const registerUser = async (input: unknown): Promise<IUserResponseDTO> => {
  // 1. Kiểm tra cấu trúc input
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AppError(400, 'Dữ liệu gửi lên phải là một đối tượng JSON');
  }

  const rawData = input as Record<string, unknown>;

  // 2. Ca test A03: Không cho phép client tự truyền role để tạo Admin
  if (rawData.role !== undefined) {
    throw new AppError(400, 'Không được phép chỉ định trường role khi đăng ký tài khoản');
  }

  // 3. Kiểm tra các trường bắt buộc
  if (
    typeof rawData.fullName !== 'string' ||
    typeof rawData.email !== 'string' ||
    typeof rawData.password !== 'string'
  ) {
    throw new AppError(400, 'Cần cung cấp đầy đủ fullName, email, password kiểu chuỗi (string)');
  }

  const fullName = rawData.fullName.trim();
  const email = rawData.email.trim().toLowerCase();
  const password = rawData.password;

  // 4. Kiểm tra rỗng và độ dài
  if (fullName.length === 0) {
    throw new AppError(400, 'Họ và tên không được để trống');
  }
  if (fullName.length > 150) {
    throw new AppError(400, 'Họ và tên không được vượt quá 150 ký tự');
  }
  if (email.length === 0) {
    throw new AppError(400, 'Email không được để trống');
  }
  if (email.length > 254) {
    throw new AppError(400, 'Email không được vượt quá 254 ký tự');
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Email không đúng định dạng hợp lệ');
  }

  // Kiểm tra mật khẩu
  if (password.length === 0) {
    throw new AppError(400, 'Mật khẩu không được để trống');
  }
  if (password.length < 6) {
    throw new AppError(400, 'Mật khẩu phải có tối thiểu 6 ký tự');
  }

  // 5. Kiểm tra email đã tồn tại trong CSDL chưa (Ca A02: 409 Conflict)
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError(409, 'Email đã được sử dụng');
  }

  // 6. Băm mật khẩu với bcrypt cost factor 12
  const passwordHash = await bcrypt.hash(password, 12);

  // 7. Tạo User mới trong SQL Server với role mặc định là student
  const newUser = await User.create({
    fullName,
    email,
    passwordHash,
    role: 'student',
  });

  // 8. Trả về thông tin công khai của User (TUYỆT ĐỐI không trả password/passwordHash)
  return {
    id: newUser.id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
  };
};

export interface ILoginResponseDTO {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Service xử lý Đăng nhập tài khoản (POST /api/auth/login)
 * - Kiểm tra định dạng dữ liệu (Validation)
 * - Tra cứu User theo email
 * - So khớp mật khẩu bằng bcrypt.compare
 * - Báo lỗi chung 401 khi email không tồn tại hoặc sai mật khẩu (tránh enumeration)
 * - Cấp JWT Access Token HS256 có sub và role, hạn 1 giờ
 */
export const loginUser = async (input: unknown): Promise<ILoginResponseDTO> => {
  // 1. Kiểm tra cấu trúc input
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AppError(400, 'Dữ liệu gửi lên phải là một đối tượng JSON');
  }

  const rawData = input as Record<string, unknown>;

  // 2. Kiểm tra các trường bắt buộc
  if (
    typeof rawData.email !== 'string' ||
    typeof rawData.password !== 'string'
  ) {
    throw new AppError(400, 'Cần cung cấp đầy đủ email và password kiểu chuỗi');
  }

  const email = rawData.email.trim().toLowerCase();
  const password = rawData.password;

  if (email.length === 0 || password.length === 0) {
    throw new AppError(400, 'Email và mật khẩu không được để trống');
  }

  // 3. Tra cứu người dùng theo email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Tránh tấn công dò email: dùng chung thông điệp lỗi 401
    throw new AppError(401, 'Email hoặc mật khẩu không chính xác');
  }

  // 4. So khớp mật khẩu với hash trong CSDL
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(401, 'Email hoặc mật khẩu không chính xác');
  }

  // 5. Tạo Access Token với payload gồm sub (id) và role
  const accessToken = generateToken({
    sub: String(user.id),
    role: user.role,
  });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 3600,
  };
};
