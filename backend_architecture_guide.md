# 🏛️ دليل الهيكلة والتنظيم البرمجي للباك إند — DashAI
> **الموضوع:** تحسين معمارية الكود، إزالة التكرار، وتسهيل التوسع الديناميكي لمنصتي (سلة وزد) مع زيادة حجم المشروع.

إذا كنت تشعر بـ **"الضياع"** عند تصفح الملفات، فهذا شعور طبيعي جداً في المشاريع التي تبدأ بالنمو دون تبني أنماط تصميمية (Design Patterns) تفصل بين المنصات المختلفة.

في هذا الملف، سنقوم بتحليل أسباب الضياع الحالي، وتوضيح النقاط غير الاحترافية، وتقديم **خطة هيكلة عملية** تجعل الكود قابلاً للقراءة والتوسع بمرونة فائقة.

---

## 🔍 أولاً: لماذا تشعر بالضياع في ملفات المشروع حالياً؟

1. **تكرار منطق العمل (Code Duplication):**
   ملفات مثل `sallaAuthController.js` و `zidAuthController.js` تحتوي على نفس العمليات تقريباً: إنشاء المستخدم، التحقق من الإيميل، حفظ التوكن في قاعدة البيانات، إصدار JWT، إرسال الكوكي، والتحويل للداشبورد. التغيير فقط في كيفية استدعاء API المنصة.
2. **الربط الوثيق (Tight Coupling):**
   المتحكمات (Controllers) تقوم بكل شيء: استقبال الطلب، الاتصال بـ API خارجي، التحقق من قيد فريد في قاعدة البيانات، معالجة البيانات، وإرجاع الاستجابة. هذا يجعل الملفات طويلة ومربكة.
3. **غياب البنية الموحدة للخدمات (No Abstract Layer):**
   عندما تريد إضافة ميزة جديدة (مثل جلب المنتجات أو الأقسام) لـ "زد"، ستضطر لكتابة شروط `if (platform === 'salla')` كثيرة داخل الكود، أو إنشاء متحكمات منفصلة تماماً، مما يضاعف حجم الكود وصعوبة صيانته.

---

## ⛔ ثانياً: نقاط نوصي بتغييرها (غير احترافية)

* **التحكم المباشر بقاعدة البيانات من الـ Controllers:** استخدام دوال مثل `User.findOrCreate` و `StoreToken.update` مباشرة داخل الـ Controller.
* **تعدد مسارات OAuth:** وجود مسارين منفصلين تماماً (`/auth/salla/...` و `/auth/zid/...`) بكل تفاصيلهما، بينما يمكن توحيدهما ديناميكياً.
* **البيانات الصلبة (Hardcoded Logic):** معالجة الاختلافات بين سلة وزد بشكل يدوي وصعب في كل ملف بدلاً من استخدام واجهة موحدة (Unified Interface).

---

## 🎯 ثالثاً: فلسفة جلب البيانات الحية (Live API Proxying)
أحد أهم أهداف تطبيقك هو **عدم تخزين بيانات المتجر الحساسة** (مثل المنتجات، الأقسام، الطلبات، العملاء) محلياً في قاعدة البيانات الخاصة بك.
* **لماذا؟** لتفادي مشكلة مزامنة البيانات القديمة (Out-of-sync Data)، ولتقليل حجم قاعدة البيانات وحمايتها.
* **كيف يعمل هذا التدفق؟**
  1. يقوم العميل بطلب صفحة المنتجات مثلاً من تطبيقك.
  2. يقوم الباك إند لدينا بدور **الوسيط (Proxy)**؛ حيث يأخذ التوكن الخاص بالتاجر من قاعدة البيانات ويطلب البيانات **حية (Live)** مباشرة من API سلة أو زد.
  3. يتم استخدام كاش خفيف في الذاكرة (Memory Cache) لمدة 5 دقائق لتفادي إرهاق خوادم سلة وزد وضمان سرعة فائقة للتطبيق.
  4. يتم تصفية وتنسيق البيانات الواردة وإرجاعها فوراً للفرونت إند.
  5. قاعدة البيانات الخاصة بك تخزن **فقط** بيانات حساب التاجر والتوكنات الخاصة به (`StoreToken` & `User`).

---

## 💡 رابعاً: هيكل الباك إند المحسن بالكامل مع وظيفة كل ملف

إليك الهيكل التنظيمي الكامل والمحدث للباك إند، يوضح مكان ووظيفة كل ملف لتسهيل تصفح الكود وتجنب التشتت:

```text
backend/
├── server.js               # الملف الرئيسي لتشغيل الخادم، ربط الإعدادات، والميدلويرز العامة
├── src/
│   ├── config/
│   │   └── db.js           # تكوين اتصال Sequelize بقاعدة البيانات MySQL ومزامنة الجداول
│   │
│   ├── models/             # نماذج الجداول في قاعدة البيانات (Sequelize)
│   │   ├── index.js        # تجميع النماذج وتعريف العلاقات بينها (User.hasOne StoreToken)
│   │   ├── User.js         # جدول التاجر (يخزن فقط: المعرف، الاسم، الإيميل، والمنصة)
│   │   └── StoreToken.js   # جدول التوكنات (يخزن التوكن، ريفريش توكن، وتاريخ الانتهاء)
│   │
│   ├── repositories/       # [طبقة جديدة] فصل كامل لعمليات الاستعلام والحفظ بقاعدة البيانات
│   │   ├── userRepository.js # عمليات قاعدة البيانات الخاصة بالمستخدم (البحث، الإنشاء، التحديث)
│   │   └── tokenRepository.js# عمليات قاعدة البيانات الخاصة بالتوكنات (حفظ وتحديث توكنات المتجر)
│   │
│   ├── middlewares/        # البرمجيات الوسيطة
│   │   └── authMiddleware.js # التحقق من JWT، تعيين req.user وتجهيز خدمة المنصة تلقائياً
│   │
│   ├── platforms/          # [طبقة جديدة] محرك المنصات الخارجية وعزل الـ APIs بالكامل
│   │   ├── BasePlatform.js # الكلاس الأب المجرد الذي يحدد الدوال المطلوبة لأي منصة
│   │   ├── SallaPlatform.js# تنفيذ استدعاءات API سلة (المصادقة، جلب المنتجات الحية، الأقسام، إلخ)
│   │   ├── ZidPlatform.js  # تنفيذ استدعاءات API زد (المصادقة، جلب المنتجات الحية، الأقسام، إلخ)
│   │   └── PlatformFactory.js # المصنع الديناميكي لجلب الكلاس المناسب بناءً على منصة المستخدم
│   │
│   ├── controllers/        # معالجة الطلبات والاستجابات فقط (خالية من أكواد قاعدة البيانات والـ APIs)
│   │   ├── authController.js    # متحكم المصادقة الموحد (Redirect, Callback, Logout)
│   │   ├── storeController.js   # جلب بيانات ملف تعريف المتجر الحية مباشرة من الـ API
│   │   ├── productController.js # جلب وتحديث المنتجات حية من API المنصة مباشرة
│   │   └── categoryController.js# جلب وتحديث الأقسام حية من API المنصة مباشرة
│   │
│   ├── routes/             # توجيه المسارات إلى المتحكمات
│   │   ├── authRoutes.js        # مسارات المصادقة الديناميكية (/:platform/redirect)
│   │   ├── storeRoutes.js       # مسارات إعدادات وملف المتجر
│   │   ├── productRoutes.js     # مسارات المنتجات
│   │   └── categoryRoutes.js    # مسارات الأقسام
│   │
│   └── utils/
│       └── cache.js        # إعداد NodeCache لتخزين الاستجابات حية لمدة 5 دقائق لضمان الأداء الفائق
```

---

## 💻 خامساً: أمثلة عملية لكتابة الكود الجديد طبقاً للهيكلية المحسنة

### 1. البرمجية الوسيطة الذكية (`middlewares/authMiddleware.js`)
أفضل طريقة لعدم تكرار الشروط في الكود هي جعل البرمجية الوسيطة تتعرف على منصة المستخدم تلقائياً وتجهيز الخدمة والتوكنات وإرفاقهم بكائن الطلب `req`:

```javascript
// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';
import * as tokenRepository from '../repositories/tokenRepository.js';
import { PlatformFactory } from '../platforms/PlatformFactory.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'غير مصرح بالدخول' });

    // 1. التحقق من الـ JWT وفك تشفيره
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. جلب المستخدم من المستودع
    const user = await userRepository.findUserById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    req.user = user;

    // 3. جلب التوكن الخاص بالمتجر من المستودع
    const storeToken = await tokenRepository.findTokenByUserId(user.id);
    if (!storeToken) return res.status(401).json({ success: false, message: 'توكن الوصول مفقود' });
    req.storeToken = storeToken;

    // 4. تهيئة خدمة المنصة ديناميكياً (زد أو سلة) وإرفاقها بالطلب
    req.platformService = PlatformFactory.getPlatform(user.platform);

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'جلسة عمل غير صالحة' });
  }
};
```

---

### 2. كلاس الكيان الأب للمنصات (`BasePlatform.js`)
يحدد جميع العمليات التي ستتم حية ومباشرة عبر الـ API دون الحاجة لقاعدة البيانات:

```javascript
// src/platforms/BasePlatform.js
export class BasePlatform {
  // المصادقة
  async generateAuthUrl() { throw new Error('Not implemented'); }
  async exchangeCodeForTokens(code) { throw new Error('Not implemented'); }
  
  // العمليات الحية (Live API Calls)
  async fetchStoreProfile(accessToken, managerToken) { throw new Error('Not implemented'); }
  async fetchProducts(accessToken, managerToken, queryParams) { throw new Error('Not implemented'); }
  async updateProduct(accessToken, managerToken, productId, updateData) { throw new Error('Not implemented'); }
  async fetchCategories(accessToken, managerToken) { throw new Error('Not implemented'); }
}
```

---

### 3. تطبيق كلاس سلة (`SallaPlatform.js`)
يتعامل حياً مع خوادم سلة:

```javascript
// src/platforms/SallaPlatform.js
import { BasePlatform } from './BasePlatform.js';
import axios from 'axios';

export class SallaPlatform extends BasePlatform {
  async fetchProducts(accessToken, managerToken, queryParams) {
    // جلب حيو ومباشر من API سلة
    const response = await axios.get('https://api.salla.dev/admin/v2/products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: queryParams,
      timeout: 10000
    });
    // إعادة صياغة البيانات بشكل موحد ليفهمه الفرونت إند
    return response.data.data.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price.amount,
      sku: p.sku,
      stock: p.quantity
    }));
  }
}
```

---

### 4. تطبيق كلاس زد (`ZidPlatform.js`)
يتعامل حياً مع خوادم زد:

```javascript
// src/platforms/ZidPlatform.js
import { BasePlatform } from './BasePlatform.js';
import axios from 'axios';

export class ZidPlatform extends BasePlatform {
  async fetchProducts(accessToken, managerToken, queryParams) {
    // جلب حي ومباشر من API زد باستخدام الترويسات المطلوبة
    const response = await axios.get('https://api.zid.sa/v1/products', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Manager-Token': managerToken
      },
      params: queryParams,
      timeout: 10000
    });
    // إعادة صياغة البيانات بنفس الشكل الموحد ليفهمه الفرونت إند
    return response.data.products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      sku: p.sku,
      stock: p.quantity
    }));
  }
}
```

---

### 5. متحكم المنتجات الموحد الذكي (`controllers/productController.js`)
شاهد كيف أصبح متحكم المنتجات غاية في البساطة والنظافة! لا يحتوي على شروط للمنصات، ولا يتصل بقاعدة البيانات، بل يستدعي المنصة المرفقة بالـ middleware ويعيد البيانات حية مع تفعيل الكاش:

```javascript
// src/controllers/productController.js
import cache from '../utils/cache.js';

export const getProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `products_${userId}`;

    // 1. فحص الكاش أولاً لتوفير استدعاءات الـ API
    const cachedProducts = cache.get(cacheKey);
    if (cachedProducts) {
      return res.json({ success: true, source: 'cache', data: cachedProducts });
    }

    // 2. استدعاء وظيفة جلب البيانات حية من الـ API ديناميكياً
    const products = await req.platformService.fetchProducts(
      req.storeToken.accessToken,
      req.storeToken.managerToken,
      req.query
    );

    // 3. تخزين النتيجة بالكاش لمدة 5 دقائق
    cache.set(cacheKey, products, 300);

    return res.json({ success: true, source: 'api', data: products });
  } catch (error) {
    console.error('Fetch Products Error:', error.message);
    res.status(500).json({ success: false, message: 'تعذر جلب المنتجات حالياً' });
  }
};
```

---

## 🎯 سادساً: النتائج والفوائد التي ستحصل عليها:

1. **السهولة القصوى في إضافة أي منصة مستقبلاً (مثل شوبيفاي أو ووكومرس):** لن تحتاج لتعديل ملفات التوجيه أو الـ JWT، فقط قم بإنشاء ملف كلاس جديد `ShopifyPlatform.js` وسيعمل كل شيء تلقائياً!
2. **اختصار حجم الكود:** سيتم حذف أكثر من 50% من الأكواد المكررة وتوحيدها في مكان واحد.
3. **سهولة تتبع الأخطاء:** إذا كان هناك مشكلة في ربط "زد"، ستذهب مباشرة لملف `ZidPlatform.js` دون تشتيت نفسك بأي تفاصيل أخرى تخص قاعدة البيانات أو جلسات المستخدمين.
4. **تسهيل جلب البيانات الحية (المنتجات، الطلبات):** سيكون لديك متحكم منتجات واحد `productController.js` يستدعي ديناميكياً `platformService.fetchProducts()` بناءً على منصة المستخدم الحالي.
