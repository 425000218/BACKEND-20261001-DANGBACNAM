import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware tập trung xử lý lỗi cho toàn bộ ứng dụng Express (Chương 08)
 * - Luôn trả định dạng JSON chuẩn hóa: { success: false, status: number, message: string, data: null }
 * - res.headersSent: Chuyển tiếp next(err) nếu header đã được gửi.
 * - Lỗi 500: Ghi log server, che giấu chi tiết nhạy cảm trong production.
 * - Chỉ cho phép trường stack khi NODE_ENV === 'development' cục bộ.
 */
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  // 1. Kiểm tra an toàn: nếu headers đã gửi, chuyển tiếp tới handler mặc định
  if (res.headersSent) {
    return next(err);
  }

  // 2. Xử lý lỗi nghiệp vụ dự kiến được ném qua AppError (400, 401, 403, 404, 409, ...)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
      data: null,
    });
    return;
  }

  // 3. Xử lý lỗi từ Multer upload (413 Payload Too Large, 400 Bad Request)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        status: 413,
        message: 'Kích thước file vượt quá giới hạn cho phép (tối đa 2MB)',
        data: null,
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        status: 400,
        message: 'Tên trường file không hợp lệ (yêu cầu field name là avatar)',
        data: null,
      });
      return;
    }
    res.status(400).json({
      success: false,
      status: 400,
      message: `Lỗi tải file: ${err.message}`,
      data: null,
    });
    return;
  }

  // 4. Xử lý lỗi cú pháp JSON trong request body
  if (
    (err instanceof SyntaxError && 'status' in err && (err as { status: unknown }).status === 400) ||
    (err instanceof SyntaxError && 'body' in err)
  ) {
    res.status(400).json({
      success: false,
      status: 400,
      message: 'Dữ liệu JSON gửi lên không đúng cú pháp',
      data: null,
    });
    return;
  }

  // 5. Lỗi hệ thống 500 (Ghi log chi tiết tại server, che giấu thông tin nhạy cảm ở client)
  console.error('[SERVER ERROR]:', err);

  const isDev = process.env.NODE_ENV === 'development';
  const responsePayload: Record<string, unknown> = {
    success: false,
    status: 500,
    message: isDev ? (err.message || 'Lỗi hệ thống') : 'Lỗi hệ thống, vui lòng thử lại sau',
    data: null,
  };

  // Chỉ thêm stack trace khi NODE_ENV=development, tuyệt đối không có ở production
  if (isDev && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(500).json(responsePayload);
};
