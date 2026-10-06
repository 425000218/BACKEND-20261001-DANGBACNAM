/**
 * Lớp biểu diễn lỗi tùy chỉnh trong ứng dụng, kèm HTTP status code
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    // Đảm bảo prototype chain chính xác khi kế thừa Error trong TypeScript/ESM
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
