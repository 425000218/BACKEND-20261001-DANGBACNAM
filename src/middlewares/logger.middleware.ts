import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware ghi log phương thức và đường dẫn của mỗi yêu cầu gửi đến
 */
export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(`${req.method} ${req.path}`);
  next();
};
