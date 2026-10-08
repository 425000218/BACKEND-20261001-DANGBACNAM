import { Model, DataTypes } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { Lop } from './Lop.js';

/**
 * Sequelize Model ánh xạ tới bảng dbo.SinhVien trong SQL Server
 */
export class SinhVien extends Model<
  InferAttributes<SinhVien>,
  InferCreationAttributes<SinhVien>
> {
  // Khai báo thuộc tính bằng `declare` trong TypeScript để không che getter/setter của Sequelize
  declare maSV: string;
  declare hoTen: string;
  declare email: string;
  declare maLop: string;

  // Thuộc tính quan hệ (NonAttribute)
  declare lop?: NonAttribute<Lop>;
}

SinhVien.init(
  {
    maSV: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
      // Không bật autoIncrement, không tạo id số tự tăng
    },
    hoTen: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
    },
    maLop: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'SinhVien',
    schema: 'dbo',
    timestamps: false, // Bảng không dùng createdAt/updatedAt
  }
);
