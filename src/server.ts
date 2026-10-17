import "dotenv/config";
import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import sinhVienRoutes from "./routes/sinhVien.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { sequelize } from "./config/database.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config.js";

const app = express();

// 1. Logger middleware
app.use(loggerMiddleware);

// 2. Bảo mật headers và CORS (cho phép Swagger và Client test chạy scripts)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());

// 3. Parser JSON
app.use(express.json());

// 4. Tuyến đường gốc kiểm tra trạng thái hoạt động của server
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend quản lý sinh viên đang hoạt động",
  });
});

// 5. Gắn Swagger UI tại đường dẫn /api-docs (trước handler 404)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5b. Giao diện kiểm thử trực quan (Playwright MCP & Dev)
app.use("/client", express.static(path.join(process.cwd(), "public")));

// 5c. Gắn route xác thực tài khoản (Register, Login, Profile)
app.use("/api/auth", authRoutes);

// 6. Gắn route quản lý sinh viên
app.use("/api/v1/sinh-vien", sinhVienRoutes);

// 6. Xử lý đường dẫn không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Không tìm thấy đường dẫn",
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
