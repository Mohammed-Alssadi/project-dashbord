'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('linked_stores', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
        // لا يوجد علاقة ForeignKey حالياً لعدم وجود جدول المستخدمين
      },
      platform: {
        type: Sequelize.ENUM('salla', 'zid'),
        allowNull: false
      },
      platform_store_id: {
        type: Sequelize.STRING(100),
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

    // إضافة مؤشر فريد للمنصة ومعرف المتجر
    await queryInterface.addIndex('linked_stores', ['platform', 'platform_store_id'], {
      unique: true,
      name: 'unique_platform_store'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('linked_stores');
  }
};
