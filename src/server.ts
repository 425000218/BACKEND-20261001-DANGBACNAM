import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sinhVienRoutes from './routes/sinhVien.routes.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { sequelize } from './config/database.js';

const app = express();

// 1. Logger middleware
app.use(loggerMiddleware);

// 2. Bảo mật headers và CORS
app.use(helmet());
app.use(cors());

// 3. Parser JSON
app.use(express.json());

// 4. Tuyến đường gốc kiểm tra trạng thái hoạt động của server
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend quản lý sinh viên đang hoạt động',
  });
});

// 5. Gắn route quản lý sinh viên
app.use('/api/v1/sinh-vien', sinhVienRoutes);

// 6. Xử lý đường dẫn không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy đường dẫn',
  });
});

// 7. Middleware xử lý lỗi tập trung (luôn đứng cuối cùng)
app.use(errorMiddleware);

// Hàm khởi động an toàn: Xác thực CSDL trước khi mở cổng HTTP
async function start(): Promise<void> {
  const PORT = Number(process.env.PORT ?? 5000);
  try {
    // 1. Kiểm tra kết nối tới cơ sở dữ liệu
    await sequelize.authenticate();
    console.log(`Kết nối CSDL thành công tới: ${process.env.DB_NAME ?? 'QuanLySinhVienDB'}`);

    // 2. Khởi động server lắng nghe HTTP
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Không thể khởi động server do lỗi kết nối CSDL:', err.message);
    try {
      await sequelize.close();
    } catch {
      // bỏ qua lỗi khi đóng kết nối nếu có
    }
    process.exit(1);
  }
}

start();
