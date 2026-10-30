import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import sinhVienRoutes from "./routes/sinhVien.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config.js";

const app = express();

// 1. Logger middleware
app.use(loggerMiddleware);

// 2. Bảo mật headers với Helmet và cấu hình CORS
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// 3. Parser JSON body
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

// 6. Phục vụ ảnh tĩnh đã được kiểm duyệt hợp lệ từ thư mục public/uploads
app.use("/uploads", express.static("public/uploads"));

// 7. Gắn route xác thực tài khoản (Register, Login, Profile, Avatar)
app.use("/api/auth", authRoutes);

// 8. Gắn route quản lý sinh viên (Chương 08: Pagination, Search, Error Flow, Extensions)
app.use("/api/v1/sinh-vien", sinhVienRoutes);

// 9. Xử lý đường dẫn không tồn tại (404 Fallback chuẩn hóa)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: "Không tìm thấy đường dẫn",
    data: null,
  });
});

// 10. Middleware xử lý lỗi tập trung (luôn đứng cuối cùng trong pipeline Express)
app.use(errorMiddleware);

export default app;
export { app };
