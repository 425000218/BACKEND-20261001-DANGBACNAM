import { Model, DataTypes } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { SinhVien } from './SinhVien.js';

/**
 * Sequelize Model ánh xạ tới bảng dbo.Lop trong SQL Server
 */
export class Lop extends Model<InferAttributes<Lop>, InferCreationAttributes<Lop>> {
  declare maLop: string;
  declare tenLop: string;

  // Thuộc tính quan hệ (NonAttribute)
  declare sinhViens?: NonAttribute<SinhVien[]>;
}

Lop.init(
  {
    maLop: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    tenLop: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'Lop',
    schema: 'dbo',
    timestamps: false,
  }
);
