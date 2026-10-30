import { sequelize } from '../config/database.js';
import { SinhVien } from '../models/SinhVien.js';
import { Lop } from '../models/Lop.js';

async function seedChuong08(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Đã kết nối CSDL SQL Server.');

    // 1. Đảm bảo có lớp 25CT114
    const [lop] = await Lop.findOrCreate({
      where: { maLop: '25CT114' },
      defaults: { maLop: '25CT114', tenLop: 'Lớp Công Nghệ Thông Tin K114' },
    });
    console.log(`✅ Lớp: ${lop.maLop} - ${lop.tenLop}`);

    // 2. Thêm SV003, SV005, SV006
    const sampleStudents = [
      { maSV: 'SV001', hoTen: 'Minh Nhật', email: 'minhnhat@example.com', maLop: '25CT114' },
      { maSV: 'SV002', hoTen: 'Lan Anh', email: 'lananh@example.com', maLop: '25CT114' },
      { maSV: 'SV003', hoTen: 'Nguyễn Tuấn Anh', email: 'tuananh@example.com', maLop: '25CT114' },
      { maSV: 'SV004', hoTen: 'Ngọc Mai', email: 'ngocmai@example.com', maLop: '25CT114' },
      { maSV: 'SV005', hoTen: 'Lê Hoàng Yến', email: 'hoangyen@example.com', maLop: '25CT114' },
      { maSV: 'SV006', hoTen: 'Đỗ Quỳnh Anh', email: 'quynhanh@example.com', maLop: '25CT114' },
    ];

    for (const s of sampleStudents) {
      const [record, created] = await SinhVien.findOrCreate({
        where: { maSV: s.maSV },
        defaults: s,
      });
      console.log(`${created ? '✨ Thêm mới' : '📌 Đã có'}: [${record.maSV}] ${record.hoTen}`);
    }

    const count = await SinhVien.count();
    console.log(`\n🎉 Tổng số sinh viên hiện có trong CSDL: ${count}`);

    const all = await SinhVien.findAll({ order: [['maSV', 'ASC']] });
    all.forEach(sv => console.log(`   - ${sv.maSV}: ${sv.hoTen} (${sv.email})`));

    await sequelize.close();
  } catch (error) {
    console.error('❌ Lỗi seed Chương 08:', error);
    process.exit(1);
  }
}

seedChuong08();
