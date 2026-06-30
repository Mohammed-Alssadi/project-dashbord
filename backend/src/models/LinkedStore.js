import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const LinkedStore = sequelize.define('LinkedStore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
    // تم إلغاء حقل الربط (Foreign Key) مؤقتاً لعدم وجود جدول المستخدمين حالياً
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
  tableName: 'linked_stores',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['platform', 'platform_store_id']
    }
  ]
});

export default LinkedStore;
