import 'dotenv/config';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';
import { User } from '../models/user.model.js';

/**
 * Script nội bộ khởi tạo tài khoản Quản trị viên (Admin) cho môi trường Dev
 * Giải quyết yêu cầu: Không cho phép đăng ký admin qua public API (Ca A03)
 */
async function seedAdmin(): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminFullName = 'Quản Trị Viên Hệ Thống';

  try {
    console.log('🔄 Đang kết nối CSDL SQL Server...');
    await sequelize.authenticate();
    console.log('✅ Kết nối CSDL thành công.');

    console.log(`🔍 Kiểm tra tài khoản admin: ${adminEmail}...`);
    const existingUser = await User.findOne({ where: { email: adminEmail } });

    // Băm mật khẩu với bcrypt cost factor 12
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    if (existingUser) {
      console.log(`⚠️ Tài khoản ${adminEmail} đã tồn tại trong CSDL.`);
      await existingUser.update({
        fullName: adminFullName,
        passwordHash,
        role: 'admin',
      });
      console.log(`👑 Đã đồng bộ tài khoản ${adminEmail} với quyền Admin thành công (ID: ${existingUser.id})!`);
    } else {
      const newAdmin = await User.create({
        fullName: adminFullName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
      });
      console.log(`🎉 Đã tạo mới tài khoản Admin thành công (ID: ${newAdmin.id}, Email: ${newAdmin.email}, Role: admin)!`);
    }

    console.log('--------------------------------------------------');
    console.log('🔑 Thông tin đăng nhập Admin môi trường Dev:');
    console.log(`   - Email:    ${adminEmail}`);
    console.log(`   - Password: ${adminPassword}`);
    console.log('--------------------------------------------------');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Lỗi khi khởi tạo tài khoản Admin:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    console.log('🔒 Đã đóng kết nối CSDL.');
  }
}

seedAdmin();
