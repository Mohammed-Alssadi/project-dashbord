/**
 * متحكم جلب بيانات المستخدم (التاجر) ككائن خام (Raw Object) من المنصة مباشرة
 */
export const getMerchantProfile = async (req, res) => {
  try {
    // استدعاء جلب بروفايل التاجر الخام من كلاس المنصة
    const rawProfile = await req.platformService.fetchRawMerchantProfile(
      req.storeToken.accessToken,
      req.storeToken.managerToken
    );

    if (!rawProfile) {
      return res.status(400).json({ success: false, message: 'فشل في جلب بيانات التاجر من المنصة' });
    }

    return res.status(200).json({
      success: true,
      data: rawProfile
    });
  } catch (error) {
    console.error('Error in getMerchantProfile controller:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء جلب بيانات التاجر' });
  }
};
