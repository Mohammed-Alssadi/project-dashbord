/**
 * متحكم جلب ملف المتجر الشخصي حي ومباشر من الـ API مباشرة — بدون كاش
 */
export const getStoreProfile = async (req, res) => {
  try {
    // استدعاء جلب الملف التعريفي للمتجر حياً ومباشرة من كلاس المنصة
    const profileData = await req.platformService.fetchStoreProfile(
      req.storeToken.accessToken,
      req.storeToken.managerToken
    );

    if (!profileData) {
      return res.status(400).json({ success: false, message: 'فشل في جلب بيانات المتجر من المنصة' });
    }

    return res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error in getStoreProfile controller:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء جلب بيانات المتجر' });
  }
};
