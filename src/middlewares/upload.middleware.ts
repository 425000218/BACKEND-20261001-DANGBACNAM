import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

// Thư mục lưu trữ ảnh đại diện hợp lệ
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Đảm bảo thư mục public/uploads luôn tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. Cấu hình DiskStorage: Đặt tên file ngẫu nhiên an toàn bằng UUID
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Lấy phần mở rộng chuẩn hóa
    const ext = path.extname(file.originalname).toLowerCase();
    // Tạo tên file ngẫu nhiên bằng UUID (tránh trùng lặp và tấn công Path Traversal)
    const uniqueFileName = `${randomUUID()}${ext}`;
    cb(null, uniqueFileName);
  },
});

// Giới hạn dung lượng tối đa: 2MB = 2 * 1024 * 1024 = 2.097.152 bytes
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

// 2. Bộ lọc đuôi file và mimetype cơ bản
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const ALLOWED_MIMETYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(
      new AppError(400, 'Chỉ chấp nhận file ảnh định dạng PNG hoặc JPEG (.png, .jpg, .jpeg)')
    );
  }
  cb(null, true);
};

// 3. Khởi tạo instance multer
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 2MB
    files: 1, // Chỉ nhận đúng 1 file
  },
  fileFilter,
});

/**
 * Hàm kiểm tra chữ ký nhị phân thực tế (Magic bytes) của file ảnh
 * - PNG: 89 50 4E 47 0D 0A 1A 0A
 * - JPEG: FF D8 FF
 */
export const verifyImageSignature = (filePath: string): boolean => {
  try {
    if (!fs.existsSync(filePath)) return false;
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    // Kiểm tra chữ ký PNG: 89 50 4e 47 0d 0a 1a 0a
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    // Kiểm tra chữ ký JPEG/JPG: ff d8 ff
    const isJpeg =
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    return isPng || isJpeg;
  } catch (err) {
    console.error('Lỗi khi đọc chữ ký file:', err);
    return false;
  }
};

/**
 * Middleware tích hợp nhận file 'avatar' và kiểm tra chữ ký nhị phân
 * - Tự động xóa file rác nếu kiểm tra magic bytes thất bại (ví dụ: file txt đổi đuôi thành png)
 */
export const uploadAvatarMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single('avatar')(req, res, (err: unknown) => {
    if (err) {
      return next(err);
    }

    // Nếu có file upload lên, tiến hành kiểm tra chữ ký nhị phân thực
    if (req.file) {
      const isValid = verifyImageSignature(req.file.path);
      if (!isValid) {
        // Xóa ngay file rác trên ổ đĩa để bảo vệ hệ thống
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Không thể xóa file rác:', unlinkErr);
        }
        return next(
          new AppError(400, 'Nội dung file không phải là ảnh hợp lệ (chữ ký nhị phân không khớp)')
        );
      }
    }

    next();
  });
};
