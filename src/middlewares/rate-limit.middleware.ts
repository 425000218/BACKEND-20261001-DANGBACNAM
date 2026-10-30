import { rateLimit } from 'express-rate-limit';

/**
 * Middleware giới hạn tần suất yêu cầu (Rate Limiting) cho endpoint Đăng nhập (POST /api/auth/login)
 * Quy định theo giáo trình Chương 09 (Slide 18, 19, 20):
 * - Cửa sổ thời gian: 60 giây (windowMs = 60 * 1000)
 * - Số lượng tối đa: 5 yêu cầu (limit = 5)
 * - Lần thứ 6 trong cùng cửa sổ trả về HTTP 429 Too Many Requests
 * - Chuẩn hóa response theo mẫu lỗi thống nhất của dự án
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  limit: 5,            // Tối đa 5 yêu cầu trên mỗi IP
  standardHeaders: 'draft-7', // Trả về headers RateLimit-* theo chuẩn IETF
  legacyHeaders: false,       // Tắt headers X-RateLimit-*
  statusCode: 429,
  message: {
    success: false,
    status: 429,
    message: 'Bạn đã gửi quá nhiều yêu cầu',
    data: null,
  },
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
