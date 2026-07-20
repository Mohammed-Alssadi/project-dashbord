import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';

// ─── إعداد multer — يحتفظ بالملف في الذاكرة مباشرة (بدون حفظ على القرص) ───────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // حد أقصى 10 ميجابايت
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WEBP, GIF'));
    }
  }
});

/**
 * Middleware لاستقبال ملف صورة واحد من حقل "image"
 * يُستخدم كـ route-level middleware قبل uploadZidProductImage
 */
export const handleImageUpload = upload.single('image');

/**
 * رفع صورة منتج لـ Zid API
 * POST /api/upload/zid/products/:productId/images
 *
 * الخطوات:
 * 1. multer يستقبل الملف ويحفظه في req.file (buffer في الذاكرة)
 * 2. نُنشئ FormData جديد ونُضيف الملف إليه
 * 3. نُرسله مباشرة لـ Zid API مع الترويسات الصحيحة
 */
export const uploadZidProductImage = async (req, res) => {
  try {
    const accessToken  = req.storeToken.accessToken;
    const managerToken = req.storeToken.managerToken;
    const storeId      = req.user.platformStoreId;
    const { productId } = req.params;

    // ─── التحقق من وجود الملف ─────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم إرسال أي ملف. يرجى إرسال الصورة في حقل "image"'
      });
    }

    // ─── بناء FormData لإرساله لـ Zid ────────────────────────────────────────
    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename:    req.file.originalname || 'product-image.jpg',
      contentType: req.file.mimetype,
      knownLength: req.file.size
    });

    // إضافة نص بديل إذا أُرسل مع الطلب
    if (req.body?.alt_text) {
      form.append('alt_text', req.body.alt_text);
    }

    // ─── إرسال الطلب لـ Zid API ──────────────────────────────────────────────
    const zidResponse = await axios.post(
      `https://api.zid.sa/v1/products/${productId}/images/`,
      form,
      {
        headers: {
          ...form.getHeaders(),              // يُعطي Content-Type مع boundary الصحيح
          'Authorization':   `Bearer ${accessToken}`, // نفس أسلوب باقي طلبات زد
          'Store-Id':        String(storeId),
          'Accept-Language': 'ar',
          'Role':            'Manager',
          ...(managerToken ? { 'X-Manager-Token': managerToken } : {})
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log(`[Image Upload ✅] Product: ${productId}, Status: ${zidResponse.status}`);

    return res.status(200).json({
      success: true,
      data: zidResponse.data
    });

  } catch (error) {
    // أخطاء Zid API (4xx / 5xx)
    if (error.response) {
      console.error(`[Image Upload ❌] Status: ${error.response.status}`, error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: 'فشل رفع الصورة في منصة زد',
        details: error.response.data
      });
    }

    // أخطاء الشبكة أو multer
    console.error('[Image Upload Fatal]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'خطأ داخلي أثناء رفع الصورة'
    });
  }
};

/**
 * رفع صورة منتج لـ Salla API
 * POST /api/upload/salla/products/:productId/images
 */
export const uploadSallaProductImage = async (req, res) => {
  try {
    const accessToken = req.storeToken.accessToken;
    const { productId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم إرسال أي ملف. يرجى إرسال الصورة في حقل "image"'
      });
    }

    const form = new FormData();
    form.append('photo', req.file.buffer, {
      filename: req.file.originalname || 'product-image.jpg',
      contentType: req.file.mimetype,
      knownLength: req.file.size
    });

    if (req.body?.alt_text) {
      form.append('alt', req.body.alt_text);
    }

    const sallaResponse = await axios.post(
      `https://api.salla.dev/admin/v2/products/${productId}/images`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log(`[Salla Image Upload ✅] Product: ${productId}, Status: ${sallaResponse.status}`);

    return res.status(200).json({
      success: true,
      data: sallaResponse.data?.data || sallaResponse.data
    });

  } catch (error) {
    if (error.response) {
      console.error(`[Salla Image Upload ❌] Status: ${error.response.status}`, error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: 'فشل رفع الصورة في منصة سلة',
        details: error.response.data
      });
    }

    console.error('[Salla Image Upload Fatal]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'خطأ داخلي أثناء رفع الصورة'
    });
  }
};
