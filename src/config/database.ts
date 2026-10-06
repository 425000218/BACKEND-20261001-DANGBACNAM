import 'dotenv/config';
import { Sequelize } from 'sequelize';

// 1. Đọc và kiểm tra các biến môi trường bắt buộc từ .env
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST ?? '127.0.0.1';
const rawPort = process.env.DB_PORT ?? '1433';

const missingVars: string[] = [];
if (!dbName) missingVars.push('DB_NAME');
if (!dbUser) missingVars.push('DB_USER');
if (!dbPassword) missingVars.push('DB_PASSWORD');

if (missingVars.length > 0) {
  throw new Error(`Thiếu các biến môi trường cấu hình database: ${missingVars.join(', ')}`);
}

// 2. Chuyển đổi và kiểm tra tính hợp lệ của DB_PORT (1..65535)
const dbPort = Number(rawPort);
if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error(`DB_PORT không hợp lệ: "${rawPort}". Cổng phải là số nguyên từ 1 đến 65535.`);
}

// 3. Khởi tạo Sequelize instance dùng chung cho toàn ứng dụng
export const sequelize = new Sequelize(dbName!, dbUser!, dbPassword!, {
  dialect: 'mssql',
  host: dbHost,
  port: dbPort,
  logging: console.log,
  dialectOptions: {
    options: {
      // Chuyển đổi chuỗi sang boolean chính xác, tránh Boolean("false") trả về true
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    },
  },
});
