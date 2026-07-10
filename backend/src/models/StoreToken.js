import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { encryptToken, decryptToken } from '../utils/crypto.js';

const StoreToken = sequelize.define('StoreToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id' 
  },
  accessToken: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'access_token',
    get() {
      const rawValue = this.getDataValue('accessToken');
      return rawValue ? decryptToken(rawValue) : null;
    },
    set(value) {
      this.setDataValue('accessToken', value ? encryptToken(value) : null);
    }
  },
  refreshToken: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'refresh_token',
    get() {
      const rawValue = this.getDataValue('refreshToken');
      return rawValue ? decryptToken(rawValue) : null;
    },
    set(value) {
      this.setDataValue('refreshToken', value ? encryptToken(value) : null);
    }
  },
  managerToken: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'manager_token',
    get() {
      const rawValue = this.getDataValue('managerToken');
      return rawValue ? decryptToken(rawValue) : null;
    },
    set(value) {
      this.setDataValue('managerToken', value ? encryptToken(value) : null);
    }
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
