import sequelize from '../config/db.js';
import LinkedStore from './LinkedStore.js';
import StoreToken from './StoreToken.js';

// تعريف العلاقة بين LinkedStore و StoreToken (One-to-One)
// كل متجر لديه سجل واحد فقط من التوكنز
LinkedStore.hasOne(StoreToken, {
  foreignKey: 'storeId',
  as: 'tokens',
  onDelete: 'CASCADE' // حذف التوكنز تلقائياً عند حذف المتجر
});

StoreToken.belongsTo(LinkedStore, {
  foreignKey: 'storeId',
  as: 'store'
});

export {
  sequelize,
  LinkedStore,
  StoreToken
};
