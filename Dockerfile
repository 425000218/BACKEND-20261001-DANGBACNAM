# ==============================================================================
# Giai đoạn 1: Build - Biên dịch mã nguồn TypeScript sang JavaScript ESM
# ==============================================================================
FROM node:22-bookworm-slim AS build

WORKDIR /app

# Kích hoạt corepack để sử dụng pnpm phiên bản chuẩn
RUN corepack enable

# Sao chép manifest và lockfile để tận dụng Docker layer cache
COPY package.json pnpm-lock.yaml ./

# Cài đặt toàn bộ dependencies phục vụ quá trình biên dịch (tsc)
RUN pnpm install --frozen-lockfile

# Sao chép file cấu hình TypeScript, mã nguồn và tài liệu
COPY tsconfig*.json ./
COPY src ./src
COPY docs ./docs

# Biên dịch TypeScript sang JavaScript (dist/)
RUN pnpm build

# ==============================================================================
# Giai đoạn 2: Runtime - Môi trường thực thi tinh gọn, bảo mật cho Production
# ==============================================================================
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN corepack enable

# Sao chép manifest và chỉ cài đặt production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Sao chép kết quả biên dịch và thư mục docs cần thiết cho Swagger UI
COPY --from=build /app/dist ./dist
COPY --from=build /app/docs ./docs

# Khởi tạo thư mục uploads cho Multer
RUN mkdir -p public/uploads

# Khai báo cổng kết nối
EXPOSE 5000

# Khởi chạy máy chủ Express từ entrypoint dist/server.js
CMD ["node", "dist/server.js"]
