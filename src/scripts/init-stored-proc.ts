import { sequelize } from '../config/database.js';

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Đã kết nối CSDL.');

    const sqlDrop = `
      IF OBJECT_ID('dbo.sp_ThongKeSinhVienTheoLop', 'P') IS NOT NULL
      BEGIN
          DROP PROCEDURE dbo.sp_ThongKeSinhVienTheoLop;
      END
    `;
    await sequelize.query(sqlDrop);

    const sqlCreate = `
      CREATE PROCEDURE dbo.sp_ThongKeSinhVienTheoLop
      AS
      BEGIN
          SET NOCOUNT ON;
          SELECT maLop, COUNT(*) AS totalStudents
          FROM dbo.SinhVien
          GROUP BY maLop
          ORDER BY maLop ASC;
      END;
    `;
    await sequelize.query(sqlCreate);
    console.log('🎉 Đã khởi tạo thành công Stored Procedure dbo.sp_ThongKeSinhVienTheoLop!');

    // Chạy thử kiểm chứng
    const [results] = await sequelize.query('EXEC dbo.sp_ThongKeSinhVienTheoLop;');
    console.log('📊 Kết quả chạy thử Stored Procedure:', results);

    await sequelize.close();
  } catch (err) {
    console.error('❌ Lỗi tạo Stored Procedure:', err);
    process.exit(1);
  }
}

main();
