export const getMe = async (req, res) => {
  try {
    const user = req.user;
    // إعادة حقول محددة فقط — لا نكشف كامل كائن Sequelize
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        storeName: user.storeName,
        storeDomain: user.storeDomain,
        platform: user.platform,
        platformStoreId: user.platformStoreId
      }
    });
  } catch (error) {
    console.error('Error fetching me:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const logout = (req, res) => {
  // clearCookie بنفس إعدادات الكوكي الأصلي لضمان مسحه فعلياً
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
};

