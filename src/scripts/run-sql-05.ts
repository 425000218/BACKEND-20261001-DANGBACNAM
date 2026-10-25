import 'dotenv/config';
import { sequelize } from '../config/database.js';

async function runMigration(): Promise<void> {
  try {
    console.log('🔄 Đang kết nối tới CSDL SQL Server...');
    await sequelize.authenticate();
    console.log('✅ Đã kết nối thành công.');

    // 1. Kiểm tra bảng dbo.Users
    const [tableCheck]: any = await sequelize.query(`
      SELECT OBJECT_ID(N'dbo.Users', N'U') AS tableId
    `);
    if (!tableCheck[0] || !tableCheck[0].tableId) {
      throw new Error("Chưa có bảng dbo.Users trong CSDL!");
    }

    // 2. Kiểm tra cột avatarUrl và thêm nếu chưa có (Lần 1)
    console.log('🚀 Đang thực thi bổ sung cột avatarUrl (Lần 1)...');
    const [colCheckBefore]: any = await sequelize.query(`
      SELECT COL_LENGTH('dbo.Users', 'avatarUrl') AS colLength
    `);
    
    if (!colCheckBefore[0] || colCheckBefore[0].colLength === null) {
      await sequelize.query(`
        ALTER TABLE dbo.Users
        ADD avatarUrl NVARCHAR(255) NULL
      `);
      console.log('✨ Đã thêm mới cột avatarUrl NVARCHAR(255) NULL thành công.');
    } else {
      console.log('ℹ️ Cột avatarUrl đã tồn tại từ trước.');
    }

    // 3. Chạy kiểm chứng lần 2 (Chứng minh Idempotent không lỗi khi chạy lại)
    console.log('🔄 Đang chạy kiểm chứng Idempotent (Lần 2)...');
    const [colCheckAgain]: any = await sequelize.query(`
      SELECT COL_LENGTH('dbo.Users', 'avatarUrl') AS colLength
    `);
    if (!colCheckAgain[0] || colCheckAgain[0].colLength === null) {
      await sequelize.query(`
        ALTER TABLE dbo.Users
        ADD avatarUrl NVARCHAR(255) NULL
      `);
    } else {
      console.log('✅ Lần 2 thành công: Phát hiện cột đã có, giữ nguyên không tạo trùng.');
    }

    // 4. Lấy danh sách cột để xác minh kiểu dữ liệu và nullable
    const [columns]: any = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Users' AND TABLE_SCHEMA = 'dbo'
    `);
    console.log('📊 Danh sách cột trong dbo.Users:');
    console.table(columns);

    // 5. Kiểm tra số lượng và mẫu bản ghi trong dbo.Users
    const [users]: any = await sequelize.query(`
      SELECT TOP (5) id, fullName, email, role, avatarUrl FROM dbo.Users
    `);
    console.log('👥 Mẫu bản ghi người dùng sau khi nâng cấp cột:');
    console.table(users);

    const [countResult]: any = await sequelize.query(`SELECT COUNT(*) AS totalUsers FROM dbo.Users`);
    console.log(`📌 Tổng số Users trong CSDL: ${countResult[0]?.totalUsers}`);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Lỗi khi thực hiện bản vá SQL:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    console.log('🔒 Đã đóng kết nối CSDL.');
  }
}

runMigration();
