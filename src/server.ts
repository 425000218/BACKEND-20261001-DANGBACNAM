import "dotenv/config";
import { app } from "./app.js";
import { sequelize } from "./config/database.js";

// Hàm khởi động an toàn: Xác thực CSDL trước khi mở cổng HTTP
async function start(): Promise<void> {
  const PORT = Number(process.env.PORT ?? 5000);
  try {
    // 1. Kiểm tra kết nối tới cơ sở dữ liệu
    await sequelize.authenticate();
    console.log(
      `Kết nối CSDL thành công tới: ${process.env.DB_NAME ?? "QuanLySinhVienDB"}`,
    );

    // 2. Khởi động server lắng nghe HTTP
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      "Không thể khởi động server do lỗi kết nối CSDL:",
      err.message,
    );
    try {
      await sequelize.close();
    } catch {
      // bỏ qua lỗi khi đóng kết nối nếu có
    }
    process.exit(1);
  }
}

start();
