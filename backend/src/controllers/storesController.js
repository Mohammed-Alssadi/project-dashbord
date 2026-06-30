import { LinkedStore } from '../models/index.js';

// جلب قائمة المتاجر المتصلة المخزنة في قاعدة البيانات
export const getLinkedStores = async (req, res) => {
  try {
    // جلب جميع المتاجر المتصلة (لا يوجد فلترة بمستخدم حالياً لتبسيط التجربة)
    const stores = await LinkedStore.findAll();
    res.json({ success: true, data: stores });
  } catch (error) {
    console.error('Error fetching linked stores:', error);
    res.status(500).json({ success: false, message: 'فشل جلب المتاجر المتصلة' });
  }
};

// حذف متجر متصل (إلغاء الربط)
export const deleteLinkedStore = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await LinkedStore.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'المتجر غير موجود' });
    }

    res.json({ success: true, message: 'تم إلغاء ربط المتجر بنجاح' });
  } catch (error) {
    console.error('Error deleting linked store:', error);
    res.status(500).json({ success: false, message: 'فشل إلغاء ربط المتجر' });
  }
};
