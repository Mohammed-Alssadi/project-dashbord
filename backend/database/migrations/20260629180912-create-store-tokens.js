'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('store_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      store_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // يضمن علاقة One-to-One مع المتاجر
        references: {
          model: 'linked_stores', // يجب أن يطابق اسم جدول المتاجر في قاعدة البيانات
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // عند حذف المتجر، يتم حذف توكناته تلقائياً
      },
      access_token: {
        type: Sequelize.TEXT('long'), // نستخدم النص الطويل لأن التوكنز قد تكون كبيرة جداً وتتجاوز 255 حرف
        allowNull: true
      },
      refresh_token: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      manager_token: {
        type: Sequelize.TEXT('long'), // خاص بمنصة زد (Zid)
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('store_tokens');
  }
};
