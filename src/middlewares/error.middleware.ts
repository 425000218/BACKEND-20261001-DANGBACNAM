import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware tập trung xử lý lỗi cho toàn bộ ứng dụng Express
 */
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  // 1. Xử lý lỗi nghiệp vụ dự kiến được ném thông qua AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // 2. Xử lý lỗi sai cú pháp JSON trong request body
  if (
    (err instanceof SyntaxError && 'status' in err && (err as { status: unknown }).status === 400) ||
    (err instanceof SyntaxError && 'body' in err)
  ) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu JSON gửi lên không đúng cú pháp',
    });
    return;
  }

  // 3. Lỗi chưa biết hoặc lỗi hệ thống không mong muốn
  console.error('Chi tiết lỗi hệ thống:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống',
  });
};
