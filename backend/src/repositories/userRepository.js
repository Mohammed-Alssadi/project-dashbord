import User from '../models/User.js';
import StoreToken from '../models/StoreToken.js';
import sequelize from '../config/db.js';

/**
 * البحث عن مستخدم بـ ID
 * @param {string} id
 * @returns {Promise<User|null>}
 */
export const findUserById = async (id) => {
  return await User.findByPk(id);
};

/**
 * البحث عن مستخدم بـ Email
 * @param {string} email
 * @returns {Promise<User|null>}
 */
export const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

/**
 * حفظ أو تحديث التاجر في قاعدة البيانات وتحديث التوكنات الخاصة به في عملية واحدة (Transaction)
 * @param {object} data - بيانات المستخدم والمتجر والتوكنز
 * @returns {Promise<User>}
 */
export const saveMerchantUser = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      platform,
      platformStoreId,
      name,
      email: targetEmail,
      storeName,
      storeDomain,
      storePhone,
      tokens
    } = data;

    const storeIdStr = platformStoreId ? platformStoreId.toString() : '';
    let user = null;

    // 1. معالجة وحل مشكلة تعارض قيود البريد الإلكتروني فريد (Unique Constraint)
    if (targetEmail) {
      const existingUserByEmail = await User.findOne({
        where: { email: targetEmail },
        transaction
      });

      if (existingUserByEmail) {
        // إذا كان ينتمي لنفس المتجر والمنصة، نقوم بتحديثه فقط
        if (existingUserByEmail.platform === platform && existingUserByEmail.platformStoreId === storeIdStr) {
          user = existingUserByEmail;
          await user.update({
            name: name || user.name,
            storeName: storeName || user.storeName,
            storeDomain: storeDomain || user.storeDomain,
            storePhone: storePhone || user.storePhone
          }, { transaction });
        } else {
          // إذا كان البريد مسجلاً لمتجر آخر، ننشئ بريداً فريداً مضافاً إليه المعرف لمنع التعارض
          const emailParts = targetEmail.split('@');
          const uniqueEmail = `${emailParts[0]}+${platform}-${storeIdStr}@${emailParts[1]}`;

          const [newUser, created] = await User.findOrCreate({
            where: { platform, platformStoreId: storeIdStr },
            defaults: {
              name: name || `${platform.toUpperCase()} Merchant`,
              email: uniqueEmail,
              storeName: storeName || null,
              storeDomain: storeDomain || null,
              storePhone: storePhone || null
            },
            transaction
          });

          user = newUser;
          if (!created) {
            await user.update({
              name: name || user.name,
              storeName: storeName || user.storeName,
              storeDomain: storeDomain || user.storeDomain,
              storePhone: storePhone || user.storePhone
            }, { transaction });
          }
        }
      }
    }

    // إذا لم يتم العثور/الإنشاء بعد
    if (!user) {
      const [newUser, created] = await User.findOrCreate({
        where: { platform, platformStoreId: storeIdStr },
        defaults: {
          name: name || `${platform.toUpperCase()} Merchant`,
          email: targetEmail,
          storeName: storeName || null,
          storeDomain: storeDomain || null,
          storePhone: storePhone || null
        },
        transaction
      });

      user = newUser;
      if (!created) {
        await user.update({
          name: name || user.name,
          email: targetEmail || user.email,
          storeName: storeName || user.storeName,
          storeDomain: storeDomain || user.storeDomain,
          storePhone: storePhone || user.storePhone
        }, { transaction });
      }
    }

    // 2. حفظ أو تحديث التوكنات في جدول store_tokens
    // tokens هنا هي بالفعل normalized { accessToken, refreshToken, managerToken, expiresAt }
    const { accessToken, refreshToken, managerToken, expiresAt } = tokens;

    const [tokenRecord, tokenCreated] = await StoreToken.findOrCreate({
      where: { userId: user.id },
      defaults: {
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        managerToken: managerToken || null,
        expiresAt: expiresAt || new Date(Date.now() + 86400 * 1000)
      },
      transaction
    });

    if (!tokenCreated) {
      await tokenRecord.update({
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        managerToken: managerToken || tokenRecord.managerToken,
        expiresAt: expiresAt || new Date(Date.now() + 86400 * 1000)
      }, { transaction });
    }

    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();
    console.error('Error saving merchant user in repository:', error);
    throw error;
  }
};
