import StoreToken from '../models/StoreToken.js';

/**
 * جلب التوكن الخاص بالمستخدم عبر الـ ID
 * @param {string} userId
 * @returns {Promise<StoreToken|null>}
 */
export const findTokenByUserId = async (userId) => {
  return await StoreToken.findOne({ where: { userId } });
};

/**
 * تحديث التوكنات الخاصة بمتجر معين في طلب DB واحد
 * @param {string} userId
 * @param {object} tokenData - البيانات الجديدة للتوكنز { accessToken, refreshToken, managerToken, expiresAt }
 * @returns {Promise<StoreToken>}
 */
export const updateToken = async (userId, tokenData) => {
  // UPDATE في طلب واحد — أكثر أداءً من findOne ثم update
  const [affectedRows] = await StoreToken.update(tokenData, {
    where: { userId }
  });

  if (affectedRows === 0) {
    throw new Error(`Token record for user ID '${userId}' not found or no changes made`);
  }

  // نُعيد التوكن المحدث للمستخدم
  return await StoreToken.findOne({ where: { userId } });
};

