'use strict';

/**
 * Migration: إنشاء جدول المستخدمين (users)
 * يتطابق مع نموذج User.js الحالي
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      avatar_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      store_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      store_domain: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      store_phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      platform: {
        type: Sequelize.ENUM('salla', 'zid'),
        allowNull: false
      },
      platform_store_id: {
        type: Sequelize.STRING(255),
        allowNull: false
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

    // فهرس فريد للمنصة + معرف المتجر
    await queryInterface.addIndex('users', ['platform', 'platform_store_id'], {
      unique: true,
      name: 'unique_platform_store_id'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
