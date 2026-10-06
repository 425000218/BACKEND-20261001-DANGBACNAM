import { sequelize } from '../config/database.js';

async function main(): Promise<void> {
  try {
    // Thử xác thực kết nối tới SQL Server
    await sequelize.authenticate();
    console.log(`DB connected: ${process.env.DB_NAME ?? 'QuanLySinhVienDB'}`);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Lỗi kết nối cơ sở dữ liệu (chẩn đoán):', err.message);
    process.exitCode = 1;
  } finally {
    // Đóng kết nối sau khi kiểm tra xong để script kết thúc hoàn toàn
    await sequelize.close();
  }
}

main();
