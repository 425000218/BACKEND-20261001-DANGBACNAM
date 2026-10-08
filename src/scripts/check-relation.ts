import { sequelize, SinhVien, Lop } from '../models/index.js';

/**
 * Script kiểm tra quan hệ 1-N giữa Lop và SinhVien bằng Sequelize Include
 */
async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('--- KẾT NỐI CSDL THÀNH CÔNG ---');

    // 1. Lấy danh sách SinhVien kèm thông tin Lop (belongsTo)
    console.log('\n=== 1. DANH SÁCH SINH VIÊN KÈM THÔNG TIN LỚP (SinhVien -> Lop) ===');
    const sinhViens = await SinhVien.findAll({
      include: [
        {
          model: Lop,
          as: 'lop',
        },
      ],
      order: [['maSV', 'ASC']],
    });

    sinhViens.forEach((sv) => {
      console.log(
        `[${sv.maSV}] ${sv.hoTen} - Email: ${sv.email} | Lớp: ${sv.maLop} - ${sv.lop?.tenLop ?? 'Chưa rõ'}`
      );
    });

    // 2. Lấy danh sách Lop kèm danh sách SinhVien thuộc lớp (hasMany)
    console.log('\n=== 2. DANH SÁCH LỚP VÀ CÁC SINH VIÊN THUỘC LỚP (Lop -> SinhViens) ===');
    const lops = await Lop.findAll({
      include: [
        {
          model: SinhVien,
          as: 'sinhViens',
        },
      ],
      order: [['maLop', 'ASC']],
    });

    lops.forEach((lop) => {
      console.log(`\nLớp: [${lop.maLop}] ${lop.tenLop}`);
      const svCount = lop.sinhViens?.length ?? 0;
      console.log(`Số lượng sinh viên: ${svCount}`);
      lop.sinhViens?.forEach((sv) => {
        console.log(`  - ${sv.maSV}: ${sv.hoTen} (${sv.email})`);
      });
    });

    console.log('\n--- KIỂM TRA QUAN HỆ 1-N HOÀN TẤT THÀNH CÔNG ---');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Lỗi khi kiểm tra quan hệ:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();
