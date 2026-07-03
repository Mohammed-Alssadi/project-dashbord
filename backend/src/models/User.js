import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'avatar_url'
  },
  storeName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'store_name'
  },
  storeDomain: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'store_domain'
  },
  storePhone: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'store_phone'
  },
  platform: {
    type: DataTypes.ENUM('salla', 'zid'),
    allowNull: false
  },
  platformStoreId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'platform_store_id'
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [{ unique: true, fields: ['platform', 'platform_store_id'] }]
});

export default User;
