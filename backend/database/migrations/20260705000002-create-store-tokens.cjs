'use strict';

/**
 * Migration: إنشاء جدول توكنات المتاجر (store_tokens)
 * يتطابق مع نموذج StoreToken.js الحالي ومرتبط بجدول users
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('store_tokens', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // علاقة One-to-One مع المستخدم
        references: {
          model: 'users', // يطابق اسم جدول users الحالي
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // عند حذف المستخدم تُحذف توكناته
      },
      access_token: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      refresh_token: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      manager_token: {
        type: Sequelize.TEXT('long'), // خاص بمنصة زد
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('store_tokens');
  }
};
