import { sequelize } from '../config/database.js';
import {
  thongKeTheoLopRawQuery,
  thongKeTheoLopSequelize,
  thongKeTheoLopStoredProcedure,
  layDanhSachKemLop,
} from '../services/sinhVien.service.js';

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('--- TEST MỞ RỘNG BUỔI 10 (CHƯƠNG 08) ---');

    console.log('\n[A. Raw Query - Thống kê số lượng sinh viên theo lớp]');
    const rawResult = await thongKeTheoLopRawQuery();
    console.log('Kết quả Raw Query:', rawResult);

    console.log('\n[B. Sequelize Method - group/count theo maLop]');
    const seqResult = await thongKeTheoLopSequelize();
    console.log('Kết quả Sequelize:', seqResult);

    console.log('\n[C. Stored Procedure - dbo.sp_ThongKeSinhVienTheoLop]');
    const spResult = await thongKeTheoLopStoredProcedure();
    console.log('Kết quả Stored Procedure:', spResult);

    console.log('\n[D. JOIN SinhVien với Lop]');
    const joinResult = await layDanhSachKemLop();
    console.log(`Số sinh viên lấy được kèm tên lớp: ${joinResult.length}`);
    joinResult.forEach(sv => console.log(`   - [${sv.maSV}] ${sv.hoTen} | Lớp: ${sv.maLop} - ${sv.tenLop ?? 'Chưa rõ'}`));

    await sequelize.close();
    console.log('\n✅ TẤT CẢ 4 PHƯƠNG PHÁP MỞ RỘNG BUỔI 10 ĐÃ CHẠY THÀNH CÔNG!');
  } catch (err) {
    console.error('❌ Lỗi test extensions:', err);
    process.exit(1);
  }
}

main();
