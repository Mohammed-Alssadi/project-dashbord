import sequelize from '../config/db.js';
import User from './User.js';
import StoreToken from './StoreToken.js';

// User <-> StoreToken (One-to-One)
User.hasOne(StoreToken, { foreignKey: 'userId', as: 'tokens', onDelete: 'CASCADE' });
StoreToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  sequelize,
  User,
  StoreToken
};
