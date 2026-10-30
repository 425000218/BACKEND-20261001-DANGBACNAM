import { sequelize } from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function measureSQLQueries() {
  console.log('🔍 Đang kết nối SQL Server và đo lường STATISTICS IO, TIME...');

  await sequelize.authenticate();

  // Truy vấn 1: Truy vấn chưa tối ưu (SELECT * không lọc chặt chẽ, quét toàn bảng dbo.SinhVien)
  console.log('\n--- ĐO TRUY VẤN 1 (TRƯỚC TỐI ƯU: SELECT toàn bộ cột, quét bảng) ---');
  const t1Start = performance.now();
  const q1Results = await sequelize.query(
    `
    SET STATISTICS IO ON;
    SET STATISTICS TIME ON;
    SELECT * FROM dbo.SinhVien WHERE hoTen LIKE N'%Anh%';
    SET STATISTICS IO OFF;
    SET STATISTICS TIME OFF;
    `,
    { type: QueryTypes.SELECT }
  );
  const t1Elapsed = (performance.now() - t1Start).toFixed(2);
  console.log(`Số bản ghi trả về: ${q1Results.length}`);
  console.log(`Thời gian đo client (Node.js): ${t1Elapsed} ms`);

  // Truy vấn 2: Truy vấn đã tối ưu (Chỉ chiếu các cột cần thiết, áp dụng ORDER BY maSV và phân trang OFFSET/FETCH)
  console.log('\n--- ĐO TRUY VẤN 2 (SAU TỐI ƯU: Chiếu đúng 4 cột, sắp xếp ổn định, OFFSET/FETCH) ---');
  const t2Start = performance.now();
  const q2Results = await sequelize.query(
    `
    SET STATISTICS IO ON;
    SET STATISTICS TIME ON;
    SELECT maSV, hoTen, email, maLop
    FROM dbo.SinhVien
    WHERE hoTen LIKE N'%Anh%'
    ORDER BY maSV ASC
    OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY;
    SET STATISTICS IO OFF;
    SET STATISTICS TIME OFF;
    `,
    { type: QueryTypes.SELECT }
  );
  const t2Elapsed = (performance.now() - t2Start).toFixed(2);
  console.log(`Số bản ghi trả về: ${q2Results.length}`);
  console.log(`Thời gian đo client (Node.js): ${t2Elapsed} ms`);

  await sequelize.close();
}

measureSQLQueries().catch((err) => {
  console.error('Lỗi đo lường SQL:', err);
  process.exit(1);
});
