import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const StoreToken = sequelize.define('StoreToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'store_id' // اسم العمود الفعلي في قاعدة البيانات
  },
  accessToken: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'access_token'
  },
  refreshToken: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'refresh_token'
  },
  managerToken: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'manager_token'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  }
}, {
  tableName: 'store_tokens',
  timestamps: true,
  underscored: true // سيقوم بتحويل createdAt إلى created_at تلقائياً
});

export default StoreToken;
