'use strict';
const crypto = require('crypto');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // إدخال متاجر تجريبية مرتبطة (سلة وزد)
    return queryInterface.bulkInsert('linked_stores', [
      {
        id: crypto.randomUUID(),
        user_id: 1, // معرف مستخدم افتراضي
        platform: 'salla',
        platform_store_id: 'salla_store_demo_123',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        user_id: 1, // معرف مستخدم افتراضي
        platform: 'zid',
        platform_store_id: 'zid_store_demo_456',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('linked_stores', null, {});
  }
};
