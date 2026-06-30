# التقرير الهندسي المتكامل لهيكلة خادم الباك إند وتدفق تكامل المتاجر (سلة وزد)

يحتوي هذا الملف على توثيق شامل ودليل هندسي تفصيلي 100% لخادم الباك إند (Backend) الخاص بمنصة **DashAI**، تم إعداده وتفصيله باللغة العربية لشرح بنية المجلدات، وعمل كل ملف، ودوره في دورة حياة التطبيق، بالإضافة إلى الدليل العملي الكامل لبرمجة وتدفق عمليات ربط منصتي سلة وزد تجارياً وتقنياً.

---

## جدول المحتويات
1. [المقدمة والمعمارية العامة](#1-المقدمة-والمعمارية-العامة)
2. [شجرة المجلدات والملفات ووظائفها](#2-شجرة-المجلدات-والملفات-ووظائفها)
3. [البنية الأساسية للخادم والتكوينات (Core Setup)](#3-البنية-الأساسية-للخادم-والتكوينات-core-setup)
4. [طبقة قواعد البيانات ونمذجة البيانات (ORM & Models)](#4-طبقة-قواعد-البيانات-ونمذجة-البيانات-orm--models)
5. [طبقة التوجيه والتحكم بالمسارات (Routes & Controllers)](#5-طبقة-التوجيه-والتحكم-بالمسارات-routes--controllers)
6. [مجلد الخدمات المعزول للمنصات (Modular Services Directory)](#6-مجلد-الخدمات-المعزول-للمنصات-modular-services-directory)
7. [التدفق البرمجي المتكامل لربط منصة سلة (Salla OAuth 2.0 Integration)](#7-التدفق-البرمجي-المتكامل-لربط-منصة-سلة-salla-oauth-20-integration)
8. [التدفق البرمجي المتكامل لربط منصة زد (Zid OAuth 2.0 Integration)](#8-التدفق-البرمجي-المتكامل-لربط-منصة-زد-zid-oauth-20-integration)
9. [دليل الأمان والحماية وتشفير التوكنز (Security & Encryption Manual)](#9-دليل-الأمان-والحماية-تشفير-التوكنز-security--encryption-manual)
10. [تكامل تدفق العمليات الخلفية (Webhooks & Background Sync)](#10-تكامل-تدفق-العمليات-الخلفية-webhooks--background-sync)

---

## 1. المقدمة والمعمارية العامة

تم بناء خادم الباك إند لمنصة **DashAI** باستخدام تقنيات متطابقة مع المعايير الحديثة للويب، وتتألف البنية الأساسية من:
* **Node.js & Express:** إطار عمل خفيف وسريع لبناء واجهات برمجية RESTful APIs للتعامل مع طلبات الفرونت إند.
* **Sequelize ORM:** محرك رسم الخرائط الكائنية (ORM) المخصص لـ Node.js، للتعامل مع قاعدة بيانات MySQL دون الحاجة لكتابة استعلامات SQL معقدة بشكل يدوي، مما يضمن أماناً تاماً ضد ثغرات SQL Injection ويسهل الهجرة الهيكلية (Migrations).
* **MySQL Database:** قاعدة بيانات علائقية لحفظ معلومات المتاجر المرتبطة، ورموز الاتصال (Access Tokens)، والمنتجات، والطلبات بشكل مستقر وسريع.

### مبادئ التصميم الأساسية (Design Principles):
1. **فصل الاهتمامات (Separation of Concerns):** فصل ملفات الاتصال بقاعدة البيانات، عن تعريف نماذج الجداول (Models)، عن توجيه المسارات (Routes)، عن منطق التحكم (Controllers)، عن المنطق الخاص بالمنصات الخارجية (Services).
2. **الموديلية المعزولة (Feature-based Modular Services):** وضع منطق كل منصة خارجية (مثل سلة وزد) داخل مجلد خاص بها يضم ملف إعداداتها وعميل الاتصال الخاص بها ومنطق مصادقتها، لضمان سهولة صيانة المنصات بشكل مستقل وتجنب تضخم الكود المركزي.
3. **الأمان المغلق (Strict Encapsulation):** عدم إتاحة أي مفاتيح سرية في الفرونت إند، وتوليد روابط الـ OAuth الحساسة في خادم الباك إند فقط مع التشفير الصارم لبيانات الوصول المخزنة بقاعدة البيانات.

---

## 2. شجرة المجلدات والملفات ووظائفها

يوضح المخطط التالي الهيكل البرمجي المعتمد لملفات الباك إند:

```text
backend/
├── server.js                     # نقطة الدخول الرئيسية وتشغيل خادم الـ Express
├── .env                          # ملف متغيرات البيئة الحساسة (لا يرفع للـ Git)
├── package.json                  # ملف تعريف التبعيات والمحركات ونصوص التشغيل
│
└── src/
    ├── config/                   # مجلد إعدادات الاتصال وقاعدة البيانات الأساسية
    │   ├── db.js                 # تهيئة وتصدير اتصال Sequelize بالـ MySQL
    │   ├── config.cjs            # ملف تكوين مسارات وعناوين Sequelize CLI
    │   └── schema.sql            # المخطط الهيكلي الأولي للجداول بصيغة SQL
    │
    ├── models/                   # مجلد نماذج الجداول لـ Sequelize
    │   ├── index.js              # ملف التصدير المركزي للنماذج وربط العلاقات
    │   └── LinkedStore.js        # نموذج جدول المتاجر المرتبطة (linked_stores)
    │
    ├── routes/                   # مجلد توجيه طلبات الـ HTTP
    │   ├── auth.js               # مسارات الربط وبدء الـ OAuth لـ سلة وزد
    │   └── stores.js             # مسارات جلب وإلغاء المتاجر المتصلة الحالية
    │
    ├── controllers/              # مجلد المنطق البرمجي (التحكم) لكل مسار
    │   ├── sallaAuthController.js # معالجة الـ Callback والربط الفعلي لـ سلة
    │   ├── zidAuthController.js   # معالجة الـ Callback والربط الفعلي لـ زد
    │   └── storesController.js   # منطق جلب قائمة المتاجر وإلغاء اتصالها
    │
    └── services/                 # مجلد بوابات الخدمات المعزولة للمنصات الخارجية
        ├── salla/                # مجلد ربط منصة سلة
        │   ├── sallaConfig.js    # ثوابت وإعدادات تطبيق سلة (ClientID/Secret)
        │   ├── sallaAuth.js      # منطق تبديل كود سلة وتوليد وتحديث التوكنز
        │   └── sallaClient.js    # عميل الاتصال وجلب المنتجات والطلبات من سلة
        │
        └── zid/                  # مجلد ربط منصة زد
            ├── zidConfig.js      # ثوابت وإعدادات تطبيق زد (ClientID/Secret)
            ├── zidAuth.js        # منطق تبديل كود زد وتوليد وتحديث التوكنز
            └── zidClient.js      # عميل الاتصال وجلب المنتجات والطلبات من زد
```

---

## 3. البنية الأساسية للخادم والتكوينات (Core Setup)

### 3.1 ملف `backend/server.js`
* **الهدف والوظيفة:** هو حجر الأساس ونقطة البداية للخادم. يقوم بتهيئة بيئة Express وتفعيل برمجيات الوسائط (Middlewares) مثل `cors` و `express.json` لتسهيل قراءة البيانات المرسلة بطلب الفرونت إند، وربط مسارات التوجيه العامة بالمسارات الفرعية وتشغيل الخادم للاستماع على البورت المحدد.
* **من يستدعيه؟** يتم استدعاؤه مباشرة بواسطة محرك تشغيل الـ Node عبر الأمر `npm run dev` أو `npm start`.
* **الأكواد البرمجية والتحليل الهيكلي للملف:**
```javascript
// server.js

// استيراد حزم الخادم الأساسية
import express from 'express'; // إطار عمل السيرفر
import cors from 'cors'; // تفعيل تخطي حظر مشاركة الموارد من نطاقات مختلفة لربط الفرونت إند بالباك إند
import dotenv from 'dotenv'; // مكتبة قراءة ملف المتغيرات .env
import authRoutes from './src/routes/auth.js'; // استيراد مسارات الربط للـ OAuth
import storesRoutes from './src/routes/stores.js'; // استيراد مسارات التحكم بالمتاجر الحالية
import './src/config/db.js'; // تشغيل ملف الاتصال بقاعدة البيانات تلقائياً للتأكد من نجاح الاتصال

// تهيئة متغيرات البيئة قبل تشغيل الخادم
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // قراءة البورت من .env أو تعيين القيمة 5000 كبديل

// تفعيل برمجيات الوسائط (Middlewares)
app.use(cors()); // السماح لطلبات الفرونت إند (مستضافة على بورت 5173) بالوصول للباك إند
app.use(express.json()); // تفعيل قراءة طلبات HTTP التي تحتوي على محتوى بصيغة JSON

// ربط المسارات الفرعية بواجهات الـ API النظيفة
app.use('/auth', authRoutes); // يربط مسارات المصادقة والربط ببادئة /auth
app.use('/stores', storesRoutes); // يربط مسارات إدارة المتاجر ببادئة /stores

// مسار فحص حالة الخادم (Health Check Route)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'خادم الباك إند يعمل بنجاح تام وبشكل مستقر' });
});

// بدء تشغيل الاستماع الفعلي للطلبات
app.listen(PORT, () => {
  console.log(`خادم المنصة يعمل بنجاح الآن على المنفذ (Port): ${PORT}`);
});
```

---

### 3.2 ملف `backend/.env`
* **الهدف والوظيفة:** تخزين كل كلمات السر والمتغيرات الهامة محلياً في جهاز التطوير. هذا الملف لا يتم دفعه نهائياً لـ GitHub لحماية سرية البيانات.
* **المحتوى المثالي والتفسير:**
```text
PORT=5000                           # المنفذ الذي سيعمل عليه الباك إند
DB_HOST=localhost                   # خادم قاعدة البيانات المحلي (MySQL)
DB_USER=root                        # اسم مستخدم قاعدة البيانات
DB_PASSWORD=your_mysql_password     # كلمة مرور قاعدة البيانات
DB_NAME=dashai_db                   # اسم قاعدة البيانات

# إعدادات تطبيق سلة (يتم سحبها من لوحة مطوري سلة)
SALLA_CLIENT_ID=d06a97fa-your-client-id-here
SALLA_CLIENT_SECRET=your-salla-client-secret-here
SALLA_REDIRECT_URI=http://localhost:5000/auth/salla/callback

# إعدادات تطبيق زد (يتم سحبها من لوحة شركاء زد)
ZID_CLIENT_ID=your-zid-client-id-here
ZID_CLIENT_SECRET=your-zid-client-secret-here
ZID_REDIRECT_URI=http://localhost:5000/auth/zid/callback
```

---

## 4. طبقة قواعد البيانات ونمذجة البيانات (ORM & Models)

### 4.1 ملف تهيئة الاتصال `backend/src/config/db.js`
* **الهدف والوظيفة:** إنشاء خيط اتصال (Connection Instance) مركزي باستخدام مكتبة `Sequelize` مع تمرير بيانات قاعدة البيانات المستوردة من ملف الـ `.env`. ويتم اختبار الاتصال والتأكد من نجاحه فور إقلاع السيرفر.
* **من يستدعيه؟** يُستدعى بـ `server.js` وبجميع نماذج الجداول `models` للتعريف وحفظ السجلات.
* **الكود البرمجي التفصيلي:**
```javascript
// db.js

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// تهيئة كائن Sequelize مع بيانات الاتصال لـ MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME, // اسم قاعدة البيانات
  process.env.DB_USER, // اسم المستخدم
  process.env.DB_PASSWORD, // كلمة السر
  {
    host: process.env.DB_HOST, // اسم الخادم
    dialect: 'mysql', // تحديد نوع قاعدة البيانات
    logging: false, // تعطيل طباعة استعلامات الـ SQL في الكونسول لتنظيف شاشة التشغيل
    define: {
      underscored: true, // تحويل حقول التوقيت createdAt و updatedAt تلقائياً إلى صيغة Snake Case في الجداول لسهولة القراءة بـ MySQL
    }
  }
);

// اختبار والتحقق من سلامة الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('⚡ تم الاتصال بقاعدة بيانات MySQL بنجاح تام عبر Sequelize ORM.');
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات، تأكد من تشغيل خادم MySQL وإدخال كلمة المرور بشكل صحيح:', error);
  }
};

testConnection();

export default sequelize; // تصدير كائن الاتصال الافتراضي للاستخدام في النماذج
```

---

### 4.2 ملف نموذج المتاجر المرتبطة `backend/src/models/LinkedStore.js`
* **الهدف والوظيفة:** تعريف الجدول `linked_stores` برمجياً وتحديد أنواع البيانات لكل حقل فيه وقيود الحقول (Constraints) والمؤشرات (Indexes).
* **الكود البرمجي مع شرح الحقول:**
```javascript
// LinkedStore.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // استيراد كائن الاتصال لتأسيس النموذج عليه

const LinkedStore = sequelize.define('LinkedStore', {
  // الحقل 1: معرف فريد للمتجر المربوط في نظامنا بصيغة UUID لضمان العشوائية والأمان
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // الحقل 2: معرف المستخدم المالك للمتجر
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id' // اسم العمود الفعلي في قاعدة البيانات بـ MySQL
  },
  
  // الحقل 3: نوع منصة المتجر (قائمة خيارات مغلقة: سلة أو زد فقط)
  platform: {
    type: DataTypes.ENUM('salla', 'zid'),
    allowNull: false
  },
  
  // الحقل 4: اسم أو معرف المتجر الحركي القادم من سلة/زد لتمييزه وعرضه
  platformStoreId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'platform_store_id'
  }
}, {
  tableName: 'linked_stores', // اسم الجدول الفعلي بقاعدة البيانات
  timestamps: true, // تفعيل التوليد التلقائي لتواريخ الإنشاء والتعديل
  indexes: [
    {
      // إضافة قيد فريد (Unique Index) لمنع ربط نفس المتجر لنفس المنصة مرتين بالخطأ
      unique: true,
      fields: ['platform', 'platform_store_id']
    }
  ]
});

export default LinkedStore;
```

---

## 5. طبقة التوجيه والتحكم بالمسارات (Routes & Controllers)

### 5.1 ملف المسارات العام لعملية الربط `backend/src/routes/auth.js`
* **الهدف والوظيفة:** تحديد روابط وبوابات الـ HTTP لعمليات الـ OAuth ومعالجة العودة للمنصات.
* **الكود البرمجي ومكان الاستدعاء:**
```javascript
// routes/auth.js

import express from 'express';
// استيراد الدوال المسؤولة عن توجيه سلة وزد ومعالجة الراجع
import { handleSallaRedirect, handleSallaCallback } from '../controllers/sallaAuthController.js';
import { handleZidRedirect, handleZidCallback } from '../controllers/zidAuthController.js';

const router = express.Router();

// 1. مسارات منصة سلة
router.get('/salla/redirect', handleSallaRedirect); // يطلبه الفرونت للحصول على رابط ربط سلة
router.get('/salla/callback', handleSallaCallback); // يستقبل رمز code من سلة لتأكيد الربط

// 2. مسارات منصة زد
router.get('/zid/redirect', handleZidRedirect); // يطلبه الفرونت للحصول على رابط ربط زد
router.get('/zid/callback', handleZidCallback); // يستقبل رمز code من زد لتأكيد الربط

export default router;
```

---

### 5.2 ملف التحكم بالمتاجر وتصفحها `backend/src/controllers/storesController.js`
* **الهدف والوظيفة:** الاستعلام المباشر من جدول قاعدة البيانات لإرجاع مصفوفة المتاجر المتصلة حالياً للفرونت إند، أو قطع ارتباط متجر وحذفه نهائياً.
* **من يستدعيه؟** ملف مسارات المتاجر `routes/stores.js`.
* **الكود البرمجي المفصل:**
```javascript
// storesController.js

import { LinkedStore } from '../models/index.js'; // استيراد الموديل لإجراء الاستعلامات

// أ) جلب كافة المتاجر المرتبطة
export const getLinkedStores = async (req, res) => {
  try {
    // استدعاء دالة findAll() لجلب كافة السجلات في قاعدة البيانات
    const stores = await LinkedStore.findAll({
      order: [['createdAt', 'DESC']] // فرز المتاجر من الأحدث للأقدم
    });
    
    // إرجاع استجابة ناجحة للفرونت إند مع مصفوفة المتاجر
    res.json({ success: true, data: stores });
  } catch (error) {
    console.error('فشل جلب المتاجر المتصلة:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ بالخادم أثناء جلب المتاجر المربوطة' });
  }
};

// ب) إلغاء اتصال متجر وحذفه نهائياً
export const deleteLinkedStore = async (req, res) => {
  try {
    const { id } = req.params; // قراءة معرف المتجر المراد حذفه من معاملات الرابط
    
    // حذف السجل المتوافق مع المعرف
    const deletedCount = await LinkedStore.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'المتجر المطلوب غير موجود أو تم حذفه مسبقاً' });
    }

    res.json({ success: true, message: 'تم قطع وإلغاء ارتباط المتجر بنجاح' });
  } catch (error) {
    console.error('خطأ أثناء إلغاء ربط المتجر:', error);
    res.status(500).json({ success: false, message: 'فشل إلغاء ربط المتجر بنجاح' });
  }
};
```

---

## 6. مجلد الخدمات المعزول للمنصات (Modular Services Directory)

### 6.1 قسم خدمة منصة سلة (`backend/src/services/salla/`)
يحتوي على الأكواد والملفات المخصصة بالكامل للتعامل مع معايير منصة سلة دون خلطها ببقية الباك إند:

* **أ) ملف التهيئة `sallaConfig.js`:**
  يعزل المتغيرات المطلوبة للربط من ملف `.env` ويهيئ معلمات الصلاحيات لشركاء سلة.
* **ب) ملف المصادقة `sallaAuth.js`:**
  يتحكم بعملية استبدال الـ Code المؤقت بالـ Access Token وتجديد التوكنز المنتهية (Token Refresh Management).
* **ج) ملف العميل `sallaClient.js`:**
  عبارة عن ملف مهيأ بـ Axios لاستدعاء بيانات منتجات متجر سلة وطلباته مستخدماً التوكن الخاص بالمتجر.

### 6.2 قسم خدمة منصة زد (`backend/src/services/zid/`)
يعمل بنفس الأسلوب الموديل المعزول لمنصة زد:
* **أ) ملف التهيئة `zidConfig.js`:**
  يهيئ ثوابت زد ورموز الربط الخاصة بـ Zid Developers Portal.
* **ب) ملف المصادقة `zidAuth.js`:**
  يتحكم بعملية تفويض زد والمطابقة.
* **ج) ملف العميل `zidClient.js`:**
  يحتوي على استدعاءات API الخاصة بزد مستهدفاً معلمات الـ API والـ X-MANAGER-TOKEN المطلوبة بمنصة زد للوصول لبيانات المنتجات والطلبات والكميات.

---

## 7. التدفق البرمجي المتكامل لربط منصة سلة (Salla OAuth 2.0 Integration)

يوضح هذا الدليل التقني تفاصيل عملية الربط الفعلي وكود تشغيلها الحقيقي لربط متجر سلة وحفظ توكن الاتصال.

### 7.1 مخطط سير الطلبات والمصادقة (Sequence Flow)

```text
الفرونت إند (React)           الباك إند (Express)             سيرفر سلة (Salla OAuth)
        |                             |                             |
        |---- 1. جلب رابط الربط ----->|                             |
        |<--- 2. إرجاع الرابط الآمن --|                             |
        |                             |                             |
        |---- 3. تحويل العميل لصفحة سلة (تسجيل دخول وموافقة) ------->|
        |                             |                             |
        |                             |<--- 4. إرجاع code للمتصفح --|
        |                             |     (Callback Trigger)      |
        |                             |                             |
        |                             |---- 5. طلب المقايضة بالتوكن ->|
        |                             |<--- 6. إرجاع Access Tokens -|
        |                             |                             |
        |                             |---- 7. طلب ملف المتجر ------>|
        |                             |<--- 8. إرجاع بيانات المتجر --|
        |                             |                             |
        |                             |-- 9. حفظ المتجر بقاعدة البيانات
        |<--- 10. توجيه العميل للداشبورد (/stores?success=true) ------|
```

### 7.2 كود الباك إند الحقيقي الكامل لمعالجة الربط بمتجر سلة (`sallaAuthController.js`):
عند الانتقال للوضع الفعلي، يتم كتابة الكود التالي بالملف لمعالجة دورة الـ OAuth بالكامل:

```javascript
// sallaAuthController.js

import axios from 'axios';
import { sallaConfig } from '../services/salla/sallaConfig.js';
import { LinkedStore } from '../models/index.js';

// 1. توليد رابط المصادقة الموجه لسلة وإرساله للفرونت إند
export const handleSallaRedirect = async (req, res) => {
  try {
    // تكوين الرابط مع المعلمات المطلوبة وتحديد الصلاحيات ونوع الاستجابة
    const authUrl = `https://accounts.salla.sa/oauth2/auth?` +
      `response_type=code` +
      `&client_id=${sallaConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(sallaConfig.redirectUri)}` +
      `&scope=${sallaConfig.scopes}` +
      `&state=salla_secure_state_string`;

    res.json({ success: true, oauthUrl: authUrl });
  } catch (error) {
    console.error('خطأ أثناء تحضير رابط سلة:', error);
    res.status(500).json({ success: false, message: 'فشل إعداد عملية الربط بمتجر سلة' });
  }
};

// 2. استقبال كود سلة ومقايضته بـ Access Token وحفظ المتجر بقاعدة البيانات
export const handleSallaCallback = async (req, res) => {
  const { code, state } = req.query; // استقبال كود التفويض المؤقت المرسل من سلة

  if (!code) {
    // إعادة التوجيه للفرونت إند مع إرسال معامل خطأ في حال عدم استلام الكود
    return res.redirect('http://localhost:5173/dashboard/stores?error=no_code_provided');
  }

  try {
    // أ) إجراء طلب مقايضة الكود المؤقت بالرموز الدائمة (Access/Refresh Tokens)
    const tokenResponse = await axios.post('https://accounts.salla.sa/oauth2/token', {
      grant_type: 'authorization_code',
      client_id: sallaConfig.clientId,
      client_secret: sallaConfig.clientSecret,
      redirect_uri: sallaConfig.redirectUri,
      code: code,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // ب) جلب بيانات الملف التعريفي للتاجر للحصول على اسم المتجر
    const profileResponse = await axios.get('https://api.salla.dev/admin/v2/user/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`, // تمرير التوكن للمصادقة
      }
    });

    const merchantInfo = profileResponse.data.data.merchant;
    const storeName = merchantInfo.name; // اسم متجر التاجر في سلة
    const storeId = merchantInfo.id; // معرف المتجر الفريد

    // ج) حفظ أو تحديث المتجر المربوط في قاعدة البيانات
    // نستخدم upsert لضمان تحديث التوكنز فقط إذا كان المتجر مسجلاً مسبقاً بدلاً من تكرار السجلات
    await LinkedStore.upsert({
      userId: 1, // معرف افتراضي للمستخدم حالياً لعدم وجود نظام مستخدمين
      platform: 'salla',
      platformStoreId: storeName, // حفظ الاسم لعرضه في لوحة التحكم
      // في وضع الاتصال الكامل، نقوم بحفظ التوكنز في قاعدة البيانات مشفرة لأغراض المزامنة
    });

    // د) إعادة توجيه المتصفح لصفحة المتاجر بالفرونت إند مع إرسال علامة نجاح الربط
    res.redirect('http://localhost:5173/dashboard/stores?success=true');

  } catch (error) {
    console.error('فشل معالجة راجع سلة:', error.response?.data || error.message);
    res.redirect('http://localhost:5173/dashboard/stores?error=oauth_exchange_failed');
  }
};
```

---

## 8. التدفق البرمجي المتكامل لربط منصة زد (Zid OAuth 2.0 Integration)

تتبع منصة زد بروتوكول OAuth 2.0 بطريقة مشابهة مع اختلاف طفيف في معالجات العودة وعناوين الـ Endpoint وتوليد البيانات، وإليك كود المعالجة الحقيقي لها بالباك إند:

### 8.1 كود معالجة الربط بمتجر زد (`zidAuthController.js`):

```javascript
// zidAuthController.js

import axios from 'axios';
import { zidConfig } from '../services/zid/zidConfig.js';
import { LinkedStore } from '../models/index.js';

// 1. توليد رابط المصادقة الموجه لـ زد وإرساله للفرونت إند
export const handleZidRedirect = async (req, res) => {
  try {
    const authUrl = `https://oauth.zid.sa/oauth/authorize?` +
      `response_type=code` +
      `&client_id=${zidConfig.clientId}` +
      `&redirect_uri=${encodeURIComponent(zidConfig.redirectUri)}` +
      `&state=zid_secure_state_string`;

    res.json({ success: true, oauthUrl: authUrl });
  } catch (error) {
    console.error('خطأ أثناء تحضير رابط زد:', error);
    res.status(500).json({ success: false, message: 'فشل إعداد عملية الربط بمتجر زد' });
  }
};

// 2. استقبال كود زد ومقايضته بـ Access Token وحفظ المتجر
export const handleZidCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('http://localhost:5173/dashboard/stores?error=no_code_provided');
  }

  try {
    // أ) مقايضة الكود المؤقت بالـ Access Token لزد
    const tokenResponse = await axios.post('https://oauth.zid.sa/oauth/token', {
      grant_type: 'authorization_code',
      client_id: zidConfig.clientId,
      client_secret: zidConfig.clientSecret,
      redirect_uri: zidConfig.redirectUri,
      code: code,
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // ب) جلب بيانات الملف التعريفي لمتجر زد لمعرفة اسم المتجر
    const profileResponse = await axios.get('https://api.zid.sa/v1/managers/store/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'X-MANAGER-TOKEN': refresh_token, // تتطلب منصة زد تمرير الـ Manager Token في ترويسة الطلب
      }
    });

    const storeName = profileResponse.data.store.name.ar || profileResponse.data.store.name.en;

    // ج) حفظ المتجر في قاعدة بيانات MySQL
    await LinkedStore.upsert({
      userId: 1, // معرف مستخدم افتراضي
      platform: 'zid',
      platformStoreId: storeName,
    });

    // د) إعادة التوجيه للفرونت مع معامل نجاح
    res.redirect('http://localhost:5173/dashboard/stores?success=true');

  } catch (error) {
    console.error('فشل معالجة راجع زد:', error.response?.data || error.message);
    res.redirect('http://localhost:5173/dashboard/stores?error=oauth_exchange_failed');
  }
};
```

---

## 9. دليل الأمان والحماية وتشفير التوكنز (Security & Encryption Manual)

تخزين توكنز الربط (`access_token` و `refresh_token`) كقيمة نصية خام في قاعدة البيانات يعتبر خطأ أمني فادحاً؛ ففي حال تم اختراق قاعدة البيانات، سيتمكن المخترق من قراءة التوكنز والتحكم بمتاجر العملاء وسحب منتجاتهم.

### 🛡️ خطة الحماية الاحترافية المقترحة لـ DashAI:
لحل هذه المشكلة، نقوم بتشفير التوكنز قبل حفظها في MySQL وفك تشفيرها فقط عند الحاجة للاتصال بالـ API، وذلك باستخدام خوارزمية التشفير المتماثل المعتمدة عالمياً **AES-256-GCM** المدمجة في مكتبة الـ `crypto` بـ Node.js:

```javascript
// backend/src/utils/encryption.js

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY; // مفتاح تشفير عشوائي بطول 32 بايت يحفظ بـ .env
const IV_LENGTH = 12; // طول ناقل الحركة الفريد لـ GCM

// دالة التشفير
export const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH); // توليد ناقل حركة فريد لكل عملية
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex'); // علامة التحقق لضمان عدم التلاعب بالبيانات
  
  // دمج ناقل الحركة وعلامة التحقق والنص المشفر معاً في سجل واحد للحفظ بالجدول
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

// دالة فك التشفير
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```
بدمج هذه الدوال، نقوم بتمرير التوكنز لـ `encrypt` قبل استدعاء `LinkedStore.upsert` لحمايتها تماماً في قاعدة البيانات!

---

## 10. تكامل تدفق العمليات الخلفية (Webhooks & Background Sync)

بعد نجاح عملية الربط، لا يكفي حفظ التوكنز فقط؛ بل نحتاج إلى مزامنة مستمرة وتلقائية لبيانات المتجر دون إرهاق السيرفر.

### 10.1 التنبيهات الفورية (Webhooks):
بدلاً من الاستعلام المستمر عن التحديثات، نقوم بالتسجيل في خدمة الـ Webhooks لدى سلة أو زد.
* **طريقة عملها:** نقوم بإنشاء مسار استقبال في الباك إند: `POST /api/webhooks/salla`
* **السلوك:** بمجرد حدوث طلب شراء جديد أو إضافة منتج في متجر التاجر، يرسل سيرفر سلة طلباً لـ الباك إند لدينا يحتوي على تفاصيل الحدث، فيقوم الباك إند بتحديث لوحة تحكم التاجر فوراً وبشكل حي!

### 10.2 المزامنة المجدولة (Cron Jobs):
لحالات الصيانة الاحتياطية وتصحيح انحراف البيانات، ننشئ جدولاً زمنياً (مثلاً كل 6 ساعات) يقوم بالدوران على المتاجر المرتبطة وتحديث كميات المنتجات المتوفرة لضمان مطابقتها التامة للواقع.

---
**نهاية التقرير الفني.** هذا التقرير يمثل دليلاً ومرجعاً مرئياً وموثقاً لكامل معمارية خادم الباك إند لمنصة DashAI ويدعم اتخاذ القرارات وتطوير الكود بشكل مستقر ومستدام.
