import { Model, DataTypes } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Sequelize Model ánh xạ bảng dbo.Users trong SQL Server
 */
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare fullName: string;
  declare email: string;
  declare passwordHash: string;
  declare role: CreationOptional<string>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'student',
    },
  },
  {
    sequelize,
    tableName: 'Users',
    schema: 'dbo',
    timestamps: false,
  }
);
