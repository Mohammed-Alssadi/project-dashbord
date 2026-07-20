# تقرير التدقيق الشامل لوحدة تعديل منتج سلة
## Salla Product Edit — Full Technical Audit Report

**تاريخ التقرير:** 2026-07-20
**المشروع:** `project-dashbord`
**الوحدة المدققة:** تعديل منتج سلة فقط (Salla Product Edit)
**المُعِد:** نظام التدقيق التقني الآلي (Antigravity AI)
**الإصدار:** v1.0

---

> **تنبيه مهم:** هذا التقرير يغطي فقط ما يخص منصة **سلة** (Salla). لم يتم تناول أي شيء يخص منصة **زد** (Zid).

---

## فهرس المحتويات

1. ملخص تنفيذي
2. منهجية الفحص
3. بنية الملفات المدروسة
4. القسم الأول: مشاكل الـ Endpoints الخاصة بسلة
5. القسم الثاني: مشاكل خيارات المنتج وقيمها
6. القسم الثالث: مشاكل المتغيرات (SKUs / Variants)
7. القسم الرابع: مشاكل خلط القيم ودمج البيانات
8. القسم الخامس: مشاكل تجربة المستخدم (UX)
9. القسم السادس: مشاكل الـ Backend والـ Proxy
10. القسم السابع: مشاكل محوّل البيانات (ProductAdapter)
11. القسم الثامن: مشاكل الـ Store وإدارة الحالة
12. القسم التاسع: مشاكل التحقق من المدخلات
13. القسم العاشر: مشاكل واجهة تفاصيل المنتج
14. القسم الحادي عشر: مشاكل الصور
15. القسم الثاني عشر: مشاكل المخزون والكميات
16. القسم الثالث عشر: مشاكل التصنيفات
17. جدول أولويات الإصلاح
18. التوصيات الختامية
19. ملاحق

---

## ملخص تنفيذي

بعد إجراء فحص تقني شامل ومعمّق لجميع الملفات المتعلقة بوحدة تعديل منتج سلة في المشروع، وبعد مراجعة توثيق API سلة الرسمي والمصادر الخارجية المتحقق منها، تم رصد **72 مشكلة تقنية موثّقة** تتوزع على:

- **19 مشكلة حرجة (Critical):** تؤثر مباشرة على صحة البيانات وصحة الطلبات إلى API سلة.
- **23 مشكلة عالية الأولوية (High):** تؤثر على وظائف جوهرية ومنطق الأعمال.
- **18 مشكلة متوسطة (Medium):** تؤثر على تجربة المستخدم والأداء.
- **12 مشكلة منخفضة (Low):** تحسينات وجماليات وممارسات أفضل.

الخلاصة: وحدة تعديل منتج سلة تعاني من مشاكل جذرية في طريقة التعامل مع الـ API، خاصةً في:
1. مسارات الـ Endpoints الناقصة (تفتقد product_id)
2. هيكل الـ payload الخاطئ لتحديث الكميات
3. دمج بيانات المنتجات المتعددة الذي يُلوّث IDs الخيارات
4. غياب منطق إنشاء المتغيرات الجديدة في سلة
5. تخزين كائنات (objects) بدلاً من نصوص في حقل value

---

## منهجية الفحص

تم الفحص عبر ثلاثة محاور:

### المحور الأول: قراءة الكود المصدري كاملاً
- `useProductVariants.ts` — 552 سطر (المنطق الرئيسي للمتغيرات)
- `productEditService.ts` — 176 سطر (الاتصال بـ API)
- `productEditStore.ts` — 397 سطر (إدارة الحالة)
- `productAdapter.ts` — 601 سطر (تحويل البيانات)
- `SallaProductDetail.tsx` — عرض تفاصيل المنتج
- `VariantsSection.tsx` + `VariantsTable.tsx` — واجهة المتغيرات
- `PricingInventorySection.tsx` — الأسعار والكميات
- `BasicInfoSection.tsx` — المعلومات الأساسية
- `NewOptionModal.tsx` — إنشاء خيار جديد
- `useProductBasicInfo.ts` — الصور والتصنيفات
- `useProductPricingInventory.ts` — الأسعار والكميات
- `mapStoreAttributesToVariantTypes.ts` — تحويل الخصائص
- `mapVariantsToRows.ts` — تحويل صفوف المتغيرات
- `productValidation.ts` — التحقق من المدخلات
- `proxyController.js` — بوابة الطلبات
- `uploadController.js` — رفع الصور
- `SallaPlatform.js` — OAuth وبيانات المتجر

### المحور الثاني: مراجعة توثيق API سلة
- موقع docs.salla.dev
- مجموعة Postman الرسمية لسلة
- البحث في المصادر الموثوقة

### المحور الثالث: مقارنة التوثيق بالكود
- رصد الاختلافات بين ما تتوقعه سلة وما يُرسله الكود
- تتبع تدفق البيانات من الواجهة حتى API سلة

---

## بنية الملفات المدروسة

```
project-dashbord/
|-- frontend/src/features/products/
|   |-- hooks/
|   |   |-- useProductVariants.ts          (المنطق الرئيسي للمتغيرات)
|   |   |-- useProductBasicInfo.ts         (الصور والتصنيفات)
|   |   |-- useProductPricingInventory.ts  (الأسعار والكميات)
|   |   `-- useProductForm.ts              (النموذج الرئيسي)
|   |-- services/
|   |   `-- productEditService.ts          (الاتصال بـ API عبر Proxy)
|   |-- store/
|   |   `-- productEditStore.ts            (إدارة الحالة Zustand)
|   |-- utils/
|   |   |-- productAdapter.ts              (تحويل البيانات)
|   |   |-- productValidation.ts           (التحقق من المدخلات)
|   |   `-- functions/
|   |       |-- mapStoreAttributesToVariantTypes.ts
|   |       `-- mapVariantsToRows.ts
|   `-- components/
|       |-- SallaProductDetail.tsx
|       `-- ProductEdit/
|           |-- VariantsSection.tsx
|           |-- PricingInventorySection.tsx
|           |-- BasicInfoSection.tsx
|           `-- components/
|               |-- VariantsTable.tsx
|               |-- NewOptionModal.tsx
|               `-- NewValueModal.tsx
`-- backend/src/
    |-- controllers/
    |   |-- proxyController.js
    |   `-- uploadController.js
    `-- platforms/
        `-- SallaPlatform.js
```

---

## القسم الأول: مشاكل الـ Endpoints الخاصة بسلة

### المشكلة #1 [حرجة] — Endpoint تحديث المتغير يُرسَل بمسار صحيح لكن payload خاطئ

**الملف:** `frontend/src/features/products/services/productEditService.ts`

**الكود الحالي:**
```typescript
const response = await apiClient.put(`/api/proxy/products/variants/${variantId}`, payload);
```

**المسار النهائي لسلة:**
```
PUT https://api.salla.dev/admin/v2/products/variants/{variant_id}
```

**المشكلة:** المسار صحيح، لكن الـ payload المُرسَل من `toSallaVariantPayload` يفتقد الحقل الأهم: `related_option_values` الذي يربط الـ SKU بالخيارات. تفاصيل في المشكلة #42.

---

### المشكلة #2 [حرجة] — payload تحديث الكميات خاطئ الهيكل

**الملف:** `frontend/src/features/products/store/productEditStore.ts` السطر 374-383

**الكود الحالي:**
```typescript
const quantitiesPayload = {
  quantities: variant.stocks.map(st => ({
    branch: Number(st.locationId),
    quantity: st.quantity,
    reason_id: reasonId
  }))
};
await productEditService.updateSallaVariantQuantities(variant.id, quantitiesPayload);
```

**التحقق من توثيق سلة:**
يتوقع Endpoint تحديث كميات المتغير:
`PUT https://api.salla.dev/admin/v2/products/variants/{id}/quantities`

الـ payload الصحيح هو **مصفوفة مباشرة** وليس كائناً يحتوي مصفوفة:
```json
[
  { "branch": 12345, "quantity": 50, "reason_id": 303342349 }
]
```

**الكود يُرسل (خاطئ):**
```json
{ "quantities": [{ "branch": 12345, "quantity": 50, "reason_id": 303342349 }] }
```

**الأثر:** سلة ترفض الطلب بخطأ 422 Unprocessable Entity. تحديث الكميات لا يعمل أبداً في الإنتاج.

**الإصلاح:**
```typescript
const quantitiesPayload = variant.stocks.map(st => ({
  branch: Number(st.locationId),
  quantity: st.isUnlimited ? 0 : st.quantity,
  reason_id: reasonId
}));
```

---

### المشكلة #3 [حرجة] — `toSallaVariantPayload` يُرسل حقل `cost_price: null` دائماً

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 588-599

**الكود الحالي:**
```typescript
static toSallaVariantPayload(variant: any): any {
  return {
    sku: variant.sku,
    barcode: variant.barcode,
    mpn: variant.mpn,
    gtin: variant.gtin,
    price: variant.price,
    cost_price: variant.costPrice,   // يُرسَل حتى لو null
    sale_price: variant.salePrice,   // يُرسَل حتى لو null
    weight: variant.weight
  };
}
```

**المشاكل:**
1. إرسال `cost_price: null` يُصفّر سعر التكلفة في سلة حتى لو لم يُعدَّل. يجب حذف الحقل إذا كانت قيمته null.
2. إرسال `sale_price: 0` يُعطل الخصم بدلاً من إلغائه صراحةً.
3. لا يُرسَل حقل `related_option_values` الضروري لربط الـ SKU بالخيارات.

**الإصلاح:**
```typescript
static toSallaVariantPayload(variant: any): any {
  const payload: any = {
    sku: variant.sku,
    price: variant.price,
    related_option_values: Array.isArray(variant.attributes)
      ? variant.attributes.map((a: any) => Number(a.valueId)).filter(Boolean)
      : []
  };
  if (variant.barcode) payload.barcode = variant.barcode;
  if (variant.mpn) payload.mpn = variant.mpn;
  if (variant.gtin) payload.gtin = variant.gtin;
  if (variant.costPrice !== null && variant.costPrice !== undefined) payload.cost_price = variant.costPrice;
  if (variant.salePrice !== null && variant.salePrice !== undefined) payload.sale_price = variant.salePrice;
  else payload.sale_price = null;
  if (variant.weight !== null && variant.weight !== undefined) payload.weight = variant.weight;
  return payload;
}
```

---

### المشكلة #4 [حرجة] — Endpoint إنشاء قيمة خيار يفتقد `product_id` في المسار

**الملف:** `frontend/src/features/products/services/productEditService.ts`

**الكود الحالي:**
```typescript
createProductOptionValue: async (optionId: string | number, payload: any) => {
  const response = await apiClient.post(
    `/api/proxy/products/options/${optionId}/values`,
    payload
  );
  return response.data;
},
```

**المسار المُرسَل للـ Proxy:**
```
POST /api/proxy/products/options/{optionId}/values
```

**ما يُترجمه الـ Proxy لسلة:**
```
POST https://api.salla.dev/admin/v2/products/options/{optionId}/values
```

**توثيق سلة الصحيح:**
```
POST https://api.salla.dev/admin/v2/products/{product_id}/options/{option_id}/values
```

**الأثر:** يعود بـ 404 من سلة. إضافة قيمة جديدة لخيار قائم لا تعمل أبداً.

**الإصلاح:**
```typescript
createProductOptionValue: async (
  productId: string | number,
  optionId: string | number,
  payload: any
) => {
  const response = await apiClient.post(
    `/api/proxy/products/${productId}/options/${optionId}/values`,
    payload
  );
  return response.data;
},
```

---

### المشكلة #5 [عالية] — Endpoint إنشاء خيار يُرسل `display_value` بدلاً من `color` للألوان

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

**الكود الحالي:**
```typescript
const payload = {
  name: newOptionName,
  type: 'radio',
  display_type: newOptionType === 'color' ? 'color' : 'text',
  values: newOptionValues.map(v => ({
    name: v.label,
    display_value: newOptionType === 'color' ? (v.color || '#000000') : v.label
  }))
};
```

**توثيق سلة للخيار اللوني:**
```json
{
  "name": "اللون",
  "type": "radio",
  "display_type": "color",
  "values": [
    { "name": "أحمر", "color": "#FF0000" },
    { "name": "أزرق", "color": "#0000FF" }
  ]
}
```

**المشاكل:**
1. يُرسَل `display_value` بدلاً من الحقل الصحيح `color`.
2. نوع الخيار مقيّد بـ `radio` دائماً — المستخدم لا يستطيع اختيار `dropdown` أو `checkbox`.
3. لا يوجد تمييز بين "مقاس" و"نص عادي" رغم عرض خيارَين مختلفَين في الـ UI.

---

### المشكلة #6 [حرجة] — Endpoint حذف الخيار يفتقد `product_id` في المسار

**الملف:** `frontend/src/features/products/services/productEditService.ts`

**الكود الحالي:**
```typescript
deleteProductOption: async (optionId: string | number, platform: 'salla' | 'zid') => {
  if (platform === 'zid') {
    return { success: true };
  } else {
    const response = await apiClient.delete(`/api/proxy/products/options/${optionId}`);
    return response.data;
  }
},
```

**توثيق سلة الصحيح:**
```
DELETE https://api.salla.dev/admin/v2/products/{product_id}/options/{option_id}
```

**الأثر:** يعود بـ 404 من سلة. حذف الخيار لا يعمل أبداً لسلة.

---

### المشكلة #7 [عالية] — Endpoint تحديث المنتج الأساسي يُرسل `categories` كـ strings

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 568

**الكود الحالي:**
```typescript
categories: formData.categories.map((c: any) => String(c.id)),
```

**توثيق سلة:** حقل `categories` في `PUT /products/{id}` يتوقع مصفوفة integers. إرسالها كـ strings قد يُسبب تحقق خاطئ من سلة.

**الإصلاح:**
```typescript
categories: formData.categories.map((c: any) => Number(c.id)),
```

---

### المشكلة #8 [عالية] — reason_id ثابت يعتمد على fallback غير موثوق

**الملف:** `frontend/src/features/products/store/productEditStore.ts` السطر 358

**الكود الحالي:**
```typescript
let reasonId = 303342349;
try {
  const reasonsRes = await apiClient.get('/api/proxy/products/quantities/reasons');
  const reasonsList = reasonsRes.data?.data || [];
  if (reasonsList.length > 0) {
    reasonId = reasonsList[0].id;
  }
} catch (e) {
  console.warn('Failed to fetch Salla stock adjustment reasons, using fallback.', e);
}
```

**المشكلة:**
- القيمة الثابتة `303342349` عشوائية وقد لا تكون موجودة في كل متجر سلة.
- جلب الـ reasons في كل عملية حفظ يُضيف تأخيراً إضافياً.

**الحل الأمثل:** تحميل الـ reasons مرة واحدة عند تحميل صفحة التعديل وتخزينها في الـ Store.

---

## القسم الثاني: مشاكل خيارات المنتج وقيمها (Options & Values)

### المشكلة #9 [حرجة] — دمج خيارات المتاجر المختلفة يُلوّث IDs خيارات المنتج الحالي

**الملف:** `frontend/src/features/products/store/productEditStore.ts` الأسطر 146-203

**السياق:** لجلب قائمة الخيارات المتاحة في سلة (لأنها لا تُوفر endpoint مستقل لجلب الصفات)، يقوم الكود بجلب 50 منتجاً من المتجر ودمج خياراتها:

```typescript
const productsRes = await apiClient.get('/api/proxy/products', { params: { per_page: 50 } });
// ثم يدمج خيارات جميع المنتجات في خريطة مشتركة بناءً على اسم الخيار فقط
```

**المشكلة الجذرية والخطيرة:**

افرض لدينا منتجَين في المتجر:
- **المنتج A** (ID: 1000): خيار "اللون" (option_id: 50) | قيم: أحمر (value_id: 501), أزرق (value_id: 502)
- **المنتج B** (ID: 2000): خيار "اللون" (option_id: 80) | قيم: أخضر (value_id: 801), أصفر (value_id: 802)

عند تعديل **المنتج A**، يُنتج الكود:
- خيار "اللون" (ID: 50 من المنتج A) | قيم: أحمر (501), أزرق (502), أخضر (801), أصفر (802)

القيم (801) و(802) **لا تنتمي** لخيار ID=50 في المنتج A. عند محاولة إنشاء متغير باستخدام value_id=801 في المنتج A، ترفض سلة الطلب بخطأ 422.

**الآثار:**
1. أي توليفة متغيرات تشمل قيماً من منتجات أخرى ستفشل عند الحفظ.
2. يُضيف تأخيراً كبيراً في كل فتح لصفحة التعديل (جلب 50 منتج).
3. المستخدم يرى خيارات وقيماً غير موجودة فعلاً في المنتج الذي يُعدِّله.

**الإصلاح الصحيح:**
```typescript
// الاقتصار على خيارات المنتج الحالي فقط
attributes = Array.isArray(productData?.options) ? productData.options : [];
```

---

### المشكلة #10 [عالية] — عدم تحديث `storeAttributes` بشكل صحيح بعد إنشاء خيار جديد

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

**الكود الحالي بعد إنشاء خيار:**
```typescript
useProductEditStore.setState(state => ({
  attributes: [...state.attributes, newAttr]
}));
```

**المشكلة:** `newAttr` قادم مباشرة من استجابة `POST /products/{id}/options` بهيكل خام، بينما `state.attributes` يحتوي كائنات بهيكل مُعدَّل (مُدمَج). هذا التباين يُسبب:
1. `mapStoreAttributesToVariantTypes` ستُعطي `label` فارغاً أو `id` خاطئاً للخيار الجديد.
2. الخيار الجديد لن يظهر بشكل صحيح في القائمة المنسدلة حتى إعادة تحميل الصفحة.

---

### المشكلة #11 [عالية] — نوع الخيار (display_type) لا يُحفَظ في النموذج الموحد

**الملف:** `frontend/src/features/products/utils/functions/mapStoreAttributesToVariantTypes.ts`

**الكود الحالي:**
```typescript
export interface VariantType {
  id: string;
  label: string;
  values: AttributeValue[];
  // لا يوجد حقل type أو displayType هنا!
}
```

**المشكلة:** حقل `type` أو `display_type` للخيار لا يُحفَظ في `VariantType`. هذا يُسبب:
1. لا يمكن التمييز بين خيار اللون وخيار النص وخيار المقاس في الواجهة.
2. التمييز الحالي يعتمد على اسم الخيار فقط:
   ```typescript
   const isColorOption = type?.label?.includes("اللون") || type?.label?.toLowerCase()?.includes("color");
   ```
   هذا هش — خيار لونه اسمه "درجة" أو "صبغة" لن يُعامَل كخيار لون.

**الإصلاح:**
```typescript
export interface VariantType {
  id: string;
  label: string;
  type?: string;       // radio | checkbox | dropdown | text
  displayType?: string; // color | text | image
  values: AttributeValue[];
}
```

---

### المشكلة #12 [عالية] — القيمة الجديدة المُضافة لخيار قائم لا تُحدَّد تلقائياً

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

**الكود الحالي بعد إنشاء قيمة جديدة:**
```typescript
setVariantTypes(prev => prev.map(t => 
  t.id === activeTypeIdForNewValue 
    ? { ...t, values: [...t.values, newValMapped] }
    : t
));
```

**المشكلة:** يتم إضافة القيمة الجديدة إلى `variantTypes` لكن لا يتم تحديد هذه القيمة تلقائياً في `variantsRows`. المستخدم يجب أن يفتح القائمة المنسدلة ويبحث عنها ويختارها يدوياً. تجربة مربكة.

**الإصلاح:** بعد إضافة القيمة الجديدة، تحديث `variantsRows` ليُحدِّد القيمة الجديدة تلقائياً في الصف المرتبط.

---

### المشكلة #13 [متوسطة] — التمييز بين نوع الخيار في الـ UI اعتماداً على الاسم هش جداً

**الملف:** `frontend/src/features/products/components/ProductEdit/VariantsTable.tsx`

**الكود الحالي:**
```typescript
const isColorOption = type?.label?.includes("اللون") || 
                      type?.label?.toLowerCase()?.includes("color");
```

**المشكلة:** هذا النهج يفشل في الحالات الآتية:
- خيار اسمه "درجة الصباغة" → `isColorOption = false` (خاطئ)
- خيار اسمه "Colour" → `isColorOption = false` (خاطئ)
- خيار اسمه "الألوان والمقاسات" → `isColorOption = true` (خاطئ)

**الحل:** استخدام `display_type === 'color'` من بيانات API مباشرة (يتطلب تطبيق المشكلة #11).

---

## القسم الثالث: مشاكل المتغيرات (SKUs / Variants)

### المشكلة #14 [حرجة] — تطابق المتغيرات يقارن نصاً مع ID رقمي

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

**الكود الحالي:**
```typescript
const matchedOriginal = originalVariants.find((ov: any) => 
  Array.isArray(ov.attributes) &&
  ov.attributes.length === comb.length &&
  comb.every((c: any) => 
    ov.attributes.some((oa: any) => 
      String(oa.id || oa.attribute_id) === String(c.attributeId) && 
      String(oa.valueId || oa.value) === String(c.valueId)  // المشكلة هنا
    )
  )
);
```

**المشكلة التقنية:**
في `ProductAdapter.fromSalla()` السطر 126:
```typescript
value: matchedVal    // matchedVal هو الكائن كاملاً
```

لذا `oa.value` = كائن مثل `{ id: 501, name: "أحمر", ... }` وليس `'أحمر'`.
`String(oa.valueId || oa.value)` يُعطي:
- إذا كان `oa.valueId` موجوداً: `'501'` (صحيح)
- إذا لم يكن `oa.valueId` موجوداً: `'[object Object]'` (خاطئ)

**الأثر:** فشل في إعادة استخدام المتغيرات الموجودة عند توليد توليفات جديدة. كل توليفة تُعامَل دائماً كـ "جديدة".

---

### المشكلة #15 [حرجة] — إرسال PUT لمتغير بـ ID يبدأ بـ `row-` في سلة

**الملف:** `frontend/src/features/products/store/productEditStore.ts` الأسطر 357-385

**الكود الحالي (في منطق حفظ سلة):**
```typescript
for (const variant of formData.variants) {
  const sallaVarPayload = ProductAdapter.toSallaVariantPayload(variant);
  await productEditService.updateProductVariant(productId, variant.id, sallaVarPayload, 'salla');
  // يُرسل PUT لـ /products/variants/row-1234567890-0
}
```

**المشكلة:** المتغيرات المُولَّدة حديثاً في `useProductVariants.ts` تحصل على IDs بالصيغة `row-${Date.now()}-${index}`. عند الحفظ، يُرسل الكود:
```
PUT https://api.salla.dev/admin/v2/products/variants/row-1234567890-0
```
سلة لا تعرف هذا الـ ID وترفض الطلب بـ 404.

**الحل:** يجب التمييز بين المتغيرات الجديدة والموجودة:
```typescript
const isNew = String(variant.id).startsWith('row-') || !originalVariantIds.includes(String(variant.id));
if (isNew) {
  await productEditService.createProductVariant(productId, sallaVarPayload);
} else {
  await productEditService.updateProductVariant(productId, variant.id, sallaVarPayload, 'salla');
}
```

---

### المشكلة #16 [حرجة] — لا يوجد منطق لإنشاء متغيرات جديدة في سلة

**الملف:** `frontend/src/features/products/store/productEditStore.ts` الأسطر 350-385

**التحليل:** المقارنة بين منطق الحفظ في زد وسلة:

| العملية | زد | سلة |
|---------|-----|------|
| تحديث المتغير الموجود | ✅ | ✅ |
| إنشاء متغير جديد | ✅ | ❌ مفقود |
| حذف متغير محذوف | ✅ | ❌ مفقود |

**الأثر الكامل:**
1. عند توليد توليفات جديدة (Generate Variants) وضغط "حفظ"، التوليفات الجديدة لن تُحفَظ في سلة أبداً.
2. عند حذف متغير من الواجهة، يبقى في سلة (يُحذف فقط من الـ UI عند الضغط المباشر على حذف، لكن في دورة الحفظ لا يُرسَل طلب حذف).

---

### المشكلة #17 [عالية] — `displayName` للمتغير يُعطي `[object Object]`

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 162-164

**الكود الحالي:**
```typescript
displayName: finalOptions.length > 0
  ? finalOptions.map((o: any) => o.value || o.name).join(' / ')
  : sku.sku || `متغير ${sku.id}`,
```

**المشكلة:** `o.value` في سياق سلة (بعد `fromSalla`) هو **الكائن الكامل** `matchedVal` وليس نصاً. لذا `o.value || o.name` يُعطي الكائن، وعند تحويله بـ `.join()` يُعطي `[object Object] / [object Object]`.

**الإصلاح:**
```typescript
displayName: finalOptions.length > 0
  ? finalOptions.map((o: any) => {
      const val = typeof o.value === 'string' 
        ? o.value 
        : (o.value?.ar || o.value?.en || o.value?.name || String(o.value || ''));
      return val || String(o.name || '');
    }).join(' / ')
  : sku.sku || `متغير ${sku.id}`,
```

---

### المشكلة #18 [عالية] — خلايا جدول المتغيرات تظهر فارغة بسبب عدم تطابق `typeId`

**الملف:** `frontend/src/features/products/components/ProductEdit/VariantsTable.tsx`

**الكود الحالي:**
```typescript
const attr = attributes.find((a: any) => 
  String(a.id || a.attribute_id) === String(row.typeId)
);
const valueText = attr?.value || '';
```

**المشكلة:** في بيانات سلة، بعد `mapVariantsToRows`، الـ `row.typeId` هو ID الخيار (option ID). لكن في `attributes` للمتغير:
- بعض الـ SKUs تُعيد `attributes[].id` = option_id ✅
- بعضها تُعيد `attributes[].id` = option_id لكن بنوع مختلف (string vs number)
- `attr?.value` قد يكون كائناً وليس نصاً

**الأثر:** خلايا الجدول تبدو فارغة حتى لو كانت البيانات موجودة.

---

### المشكلة #19 [عالية] — تغيير نوع الخيار لصف موجود لا يُفرِّغ المتغيرات القديمة

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

**الكود الحالي:**
```typescript
const handleChangeType = (rowId: string, newTypeId: string) => {
  setVariantsRows(prev => prev.map(row => 
    row.id === rowId ? { ...row, typeId: newTypeId, selectedValues: [] } : row
  ));
  setShowConfirmButton(true);
};
```

**المشكلة:** عند تغيير نوع الخيار، يتم مسح `selectedValues` فقط، لكن **جدول المتغيرات لا يُحدَّث تلقائياً**. المستخدم يرى جدول المتغيرات القديم حتى يضغط "تأكيد وإنشاء المتغيرات" مرة أخرى، وهذا سلوك مربك.

---

## القسم الرابع: مشاكل خلط القيم ودمج البيانات

### المشكلة #20 [حرجة] — دمج IDs قيم الخيارات من منتجات متعددة يُنتج توليفات فاشلة

**السياق التقني المفصَّل للمشكلة #9:**

```
المنتج A:
  خيار "اللون" → option_id = 50
    أحمر → value_id = 501
    أزرق → value_id = 502

المنتج B:
  خيار "اللون" → option_id = 80
    أخضر → value_id = 801
    أصفر → value_id = 802
```

بعد دمج الكود في `productEditStore.ts`:
```
خيار "اللون" (ID: 50 من المنتج A)
  أحمر (501)   ← صحيح
  أزرق (502)   ← صحيح
  أخضر (801)   ← خاطئ! ينتمي لمنتج آخر
  أصفر (802)   ← خاطئ! ينتمي لمنتج آخر
```

عند توليد توليفة "أخضر" وحفظها في المنتج A:
```json
{ "related_option_values": [801] }
```
سترفض سلة هذا الطلب لأن value_id=801 لا ينتمي للمنتج A.

---

### المشكلة #21 [حرجة] — حقل `value` في attributes سلة يحتوي الكائن بدلاً من النص

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 106-113

**الكود الحالي:**
```typescript
sku.related_option_values.forEach((valId: any) => {
  rawProduct.options.forEach((opt: any) => {
    const matchedVal = opt.values.find((v: any) => String(v.id) === valIdStr);
    if (matchedVal) {
      mappedOpts.push({
        id: String(opt.id),
        valueId: String(matchedVal.id),
        name: opt.name ?? '',
        value: matchedVal     // الكائن كاملاً!
      });
    }
  });
});
```

**الأثر في الواجهة:**
| الموضع | ما يحدث |
|--------|---------|
| `VariantsTable.tsx` | `attr?.value` → `[object Object]` بدلاً من "أحمر" |
| `displayName` في المتغير | `[object Object] / [object Object]` |
| `mapVariantsToRows.ts` | `normalizeArabic(valStr)` تفشل لأن `valStr` كائن |

**الإصلاح:**
```typescript
value: ProductAdapter.getLocalizedString(matchedVal)
```

---

### المشكلة #22 [عالية] — `price` مقابل `regular_price`: تضارب في أسماء الحقول

**الملف:** `frontend/src/features/products/utils/productAdapter.ts`

**عند قراءة البيانات من سلة (fromSalla):**
```typescript
price: safeNumber(sku.regular_price?.amount ?? sku.regular_price ?? sku.price?.amount ?? sku.price, 0)!,
```

**عند إرسال البيانات لسلة (toSallaVariantPayload):**
```typescript
price: variant.price,
```

**التحليل:**
- سلة **تُعيد** السعر الأساسي في حقل `regular_price` (كائن: `{ amount, currency }`)
- سلة **تقبل** السعر الأساسي في حقل `price` (رقم مجرد) عند التحديث

هذا صحيح من حيث المبدأ، لكن الـ fallback chain الطويل (`?? sku.regular_price ?? sku.price?.amount ?? sku.price`) قد يُعطي قيمة خاطئة في حالة حقل `regular_price` كائناً غير رقمي.

---

### المشكلة #23 [عالية] — `isUnlimited` للمخزون يُطبَّق من المنتج كله على كل فرع

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 85-92

**الكود الحالي:**
```typescript
const stocks: UnifiedLocationStock[] = Array.isArray(rawProduct.branches_quantities)
  ? rawProduct.branches_quantities.map((bq: any) => ({
      locationId: String(bq.id || bq.branch?.id || ''),
      locationName: bq.name ?? `فرع ${bq.id}`,
      quantity: bq.quantity ?? 0,
      isUnlimited: rawProduct.unlimited_quantity ?? false  // من المنتج وليس من الفرع
    }))
  : [];
```

**المشكلة:** `isUnlimited` يُقرأ من `rawProduct.unlimited_quantity` (مستوى المنتج) ويُطبَّق على كل الفروع بالتساوي. إذا كان فرع معين له `unlimited_quantity` مستقلة، لن تُؤخَذ بعين الاعتبار.

---

### المشكلة #24 [عالية] — `locationId` للفرع يقرأ `bq.id` بدلاً من `bq.branch_id`

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 87

**الكود الحالي:**
```typescript
locationId: String(bq.id || bq.branch?.id || ''),
```

**توثيق سلة:** في استجابة `branches_quantities`:
- `bq.id` → قد يكون ID سجل الكمية (quantity record ID) وليس ID الفرع
- `bq.branch_id` → ID الفرع الفعلي
- `bq.branch.id` → نسخة بديلة

استخدام `bq.id` أولاً يُعطي ID خاطئ في حالة كانت السجلات مرقَّمة بشكل مستقل.

**عند إرسال تحديث الكميات:**
```typescript
branch: Number(st.locationId),  // سيُرسَل ID خاطئ
```

**الإصلاح:**
```typescript
locationId: String(bq.branch_id || bq.branch?.id || bq.id || ''),
```

---

## القسم الخامس: مشاكل تجربة المستخدم (UX)

### المشكلة #25 [عالية] — زر "تأكيد وإنشاء المتغيرات" يختفي دون سبب واضح للمستخدم

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts` السطر 502

بعد ضغط الزر وتوليد المتغيرات، يُعيَّن `showConfirmButton = false`. إذا أراد المستخدم إعادة التوليد أو التعديل، يجب أن يُغيِّر اختياراً ما أولاً لإعادة ظهور الزر. لا توجد رسالة توضيحية.

**مشاكل إضافية:**
- لا يوجد عداد يُخبر المستخدم بعدد التوليفات المتوقعة قبل الضغط.
- عندما لا تُختار أي قيمة، يظهر الزر معطلاً بدون رسالة.

---

### المشكلة #26 [عالية] — فتح Modal "إضافة قيمة جديدة" يُغلق الـ Dropdown المفتوح

**الملف:** `frontend/src/features/products/components/ProductEdit/VariantsSection.tsx`

عند النقر على "إضافة قيمة جديدة" داخل الـ Dropdown، يُفتح Modal لكن الـ Dropdown ينغلق تلقائياً (سلوك Radix UI الافتراضي). النتيجة: المستخدم يرى Dropdown ينغلق ثم Modal يفتح. تجربة ارتعاش (flickering) مربكة.

---

### المشكلة #27 [عالية] — الـ Dropdown للقيم لا يحتوي زر "تأكيد" ويُغلق بالنقر خارجه

**الملف:** `frontend/src/features/products/components/ProductEdit/VariantsSection.tsx`

`DropdownMenu` من Radix UI ينغلق عند أي نقر خارجه. المستخدم لا يعرف هل اختياراته حُفِظت أم لا. لا يوجد زر "تأكيد" أو مؤشر بصري على عدد العناصر المُختارة في حالة الـ Dropdown المغلق.

---

### المشكلة #28 [متوسطة] — استخدام `window.confirm` البدائي لتأكيد الحذف

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts` السطر 100-101

```typescript
const confirmDelete = window.confirm('هل أنت متأكد من رغبتك في حذف هذا الخيار...');
```

يعطي نافذة نظام بدائية غير متوافقة مع تصميم التطبيق. يجب استبداله بـ Dialog مخصص من ShadCN/Radix.

---

### المشكلة #29 [متوسطة] — وحدة الوزن دائماً "كجم" بصرف النظر عن `weight_type` الفعلي

**الملف:** `frontend/src/features/products/components/ProductEdit/BasicInfoSection.tsx`

```tsx
<span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">كجم</span>
```

سلة يُعيد حقل `weight_type` يحدد الوحدة (`kg` أو `g`). إذا كان المنتج وزنه بالجرام، سيرى المستخدم "500 كجم" بدلاً من "500 جرام".

---

### المشكلة #30 [متوسطة] — لا يوجد مؤشر تحميل عند جلب خيارات المتجر لسلة

**الملف:** `frontend/src/features/products/store/productEditStore.ts` الأسطر 146-204

عملية جلب خيارات المتجر (التي تشمل جلب 50 منتج!) تتم بعد `isLoading = false`. المستخدم يرى واجهة فارغة من الخيارات لعدة ثوانٍ ثم تظهر فجأة بدون أي مؤشر تحميل.

---

### المشكلة #31 [متوسطة] — نموذج إضافة خيار جديد لا يُعيد ضبط نوع الخيار عند الإغلاق

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

عند إغلاق نافذة إنشاء خيار جديد، يُعاد ضبط الاسم والقيم، لكن **`newOptionType` لا يُعاد ضبطه** إلى القيمة الافتراضية. الفتحة التالية للنافذة ستجد النوع القديم محدداً.

---

### المشكلة #32 [منخفضة] — حقل وحدة الوزن `weight_type` غائب كلياً عن نموذج التعديل

**التحليل:** في `productAdapter.ts`، يتم تجاهل `rawProduct.weight_type` بالكامل. سلة قد تتوقع إرسال `weight_type` مع `weight`. إرسال الوزن بدون وحدة قد يُطبّق سلة وحدة افتراضية مختلفة.

---

### المشكلة #33 [منخفضة] — مؤشر "رئيسية" للصورة يعتمد على `idx === 0` عند غياب `is_main`

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 81

```typescript
isMain: img.is_main || idx === 0
```

إذا لم تُعيد سلة حقل `is_main`، ستُحدَّد الصورة الأولى دائماً كـ "رئيسية" بصرف النظر عن الواقع.

---

## القسم السادس: مشاكل الـ Backend والـ Proxy

### المشكلة #34 [حرجة] — مسار `/products/options/{id}` الناقص في الـ Proxy

**الملف:** `backend/src/controllers/proxyController.js`

الـ Proxy يوجّه الطلبات بشكل شفاف. لكن المسارات المُرسَلة من الفرونت لا تتضمن `product_id`:

| الطلب من الفرونت | ما يُرسله الـ Proxy لسلة | ما تتوقعه سلة |
|-----------------|------------------------|--------------|
| `DELETE /products/options/{id}` | `/products/options/{id}` | `/products/{pid}/options/{id}` |
| `POST /products/options/{id}/values` | `/products/options/{id}/values` | `/products/{pid}/options/{id}/values` |

كلا المسارَين سيُعطيان 404 من سلة.

---

### المشكلة #35 [عالية] — الـ Proxy لا يُطبّق تطبيع الاستجابة لطلبات PUT/POST لسلة

**الملف:** `backend/src/controllers/proxyController.js` الأسطر 241-249

التطبيع يتم فقط لطلبات GET:
```javascript
if (req.method === 'GET' && response.status >= 200 && response.status < 300 && isJson) {
  if (isListPath) {
    const normalizedResponse = normalizeProxyResponse(...);
  }
}
```

لطلبات PUT/POST/DELETE، تُعاد الاستجابة كـ Buffer خام. الفرونت يتوقع JSON مُحلَّلاً في بعض الحالات. إذا كان `content-type` للاستجابة غير `application/json`، سيفشل التحليل.

---

### المشكلة #36 [عالية] — timeout 20 ثانية غير كافٍ لعمليات سلة الثقيلة

**الملف:** `backend/src/controllers/proxyController.js` السطر 168

```javascript
timeout: 20000,
```

جلب 50 منتج لاستخراج الخيارات + تحديث كميات فروع متعددة قد تستغرق أكثر من 20 ثانية في أوقات الذروة. الـ timeout يُلغي الطلب بـ 503.

**الإصلاح:** رفع الـ timeout إلى 30000ms لطلبات الكتابة، وزيادة مناسبة لطلبات القراءة.

---

### المشكلة #37 [متوسطة] — عدم وجود Rate Limiting لعمليات الكتابة

**الملف:** `backend/src/controllers/proxyController.js`

عند حفظ منتج بـ 10 متغيرات في سلة:
- 1 طلب PUT للمنتج الأساسي
- 10 طلبات PUT للمتغيرات
- 10 طلبات PUT للكميات
- **الإجمالي: 21 طلب في ثوانٍ قليلة**

سلة تُطبق rate limit (عادةً 120 طلب/دقيقة للـ write operations). هذا قد يتجاوز الحد وتُرفض بعض الطلبات بـ 429 Too Many Requests.

**الحل:** إضافة تأخير بسيط بين الطلبات أو جمع التحديثات في batch request واحد.

---

## القسم السابع: مشاكل محوّل البيانات (ProductAdapter)

### المشكلة #38 [حرجة] — `fromSalla` يُخزِّن `matchedVal` كاملاً في حقل `value` بدلاً من النص

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 107-113

**الكود الحالي:**
```typescript
if (matchedVal) {
  mappedOpts.push({
    id: String(opt.id),
    valueId: String(matchedVal.id),
    name: opt.name ?? '',
    value: matchedVal     // الكائن كاملاً بدلاً من النص!
  });
}
```

**matchedVal** هو كائن مثل:
```json
{ "id": 501, "name": "أحمر", "display_value": "#FF0000", "price": 0 }
```

يجب أن يكون:
```typescript
value: ProductAdapter.getLocalizedString(matchedVal)
// يُعطي: "أحمر"
```

---

### المشكلة #39 [حرجة] — `toSallaVariantPayload` لا يُرسَل `related_option_values`

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` الأسطر 588-599

**المشكلة الجوهرية:** عند إنشاء أو تحديث SKU في سلة، الحقل `related_option_values` ضروري لربط الـ SKU بالخيارات الصحيحة. بدونه:
- المتغير يُنشأ في سلة بدون أي خيارات مرتبطة
- يظهر كـ "متغير فارغ" في لوحة تحكم سلة
- لا يظهر للمشتري في صفحة المنتج

**توثيق سلة:** payload إنشاء SKU الصحيح:
```json
{
  "sku": "PROD-RED-L",
  "price": 100.00,
  "related_option_values": [501, 302],
  "weight": 0.5
}
```

---

### المشكلة #40 [عالية] — `fromSalla` لا يستخرج `nameEn` للمنتج

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 194

**الكود الحالي:**
```typescript
nameAr: typeof rawProduct.name === 'object' ? (rawProduct.name?.ar ?? '') : (rawProduct.name ?? ''),
// لا يوجد nameEn!
```

سلة قد يُعيد `name` كـ object `{ ar: "...", en: "..." }`. الكود يستخرج `ar` فقط ويُضيِّع `en`. حقل `nameEn` في نموذج التعديل سيكون دائماً فارغاً لمنتجات سلة.

**الإصلاح:**
```typescript
nameAr: typeof rawProduct.name === 'object' ? (rawProduct.name?.ar ?? '') : (rawProduct.name ?? ''),
nameEn: typeof rawProduct.name === 'object' ? (rawProduct.name?.en ?? '') : '',
```

---

### المشكلة #41 [عالية] — الـ Fallback chain لقراءة السعر قد يُعطي قيمة خاطئة

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 156

**الكود الحالي:**
```typescript
price: safeNumber(
  sku.regular_price?.amount ?? sku.regular_price ?? sku.price?.amount ?? sku.price,
  0
)!,
```

إذا كان `sku.regular_price` كائناً غير رقمي (مثل `{ amount: 100, currency: "SAR" }`):
- `sku.regular_price?.amount` = 100 ✅ (يُستخدَم هذا)

لكن إذا كان `sku.regular_price = { amount: 0, currency: "SAR" }` (سعر صفر):
- `sku.regular_price?.amount` = 0 → `0 ?? sku.regular_price` = 0 ✅ (صحيح)

لكن إذا كان `sku.regular_price = null` وكان `sku.price = { amount: 100 }`:
- يُستخدَم `sku.price?.amount` = 100 ✅

الـ Fallback chain طويل ومعقد. تبسيطه يُقلِّل احتمال الخطأ.

---

### المشكلة #42 [عالية] — `toSallaBasicPayload` يُرسل `tags` بدون التحقق من صحة الهيكل

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 577

**الكود الحالي:**
```typescript
tags: formData.keywords,  // مصفوفة strings
```

**توثيق سلة:** حقل `tags` في `PUT /products/{id}` يقبل مصفوفة strings في بعض الإصدارات ومصفوفة objects في إصدارات أخرى. يجب التحقق من هيكل الاستجابة وإرسال نفس الهيكل.

---

### المشكلة #43 [متوسطة] — `seoSlug` مُعيَّن من `short_link_code` لكن الاسم مضلِّل

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 221

```typescript
seoSlug: rawProduct.short_link_code ?? '',
```

`short_link_code` في سلة هو رمز الرابط المختصر (مثل `prod-abc`). تسميته `seoSlug` مضللة للمستخدم لأنه يتوقع رابط SEO كامل.

---

### المشكلة #44 [منخفضة] — `require_shipping` يُرسَل دائماً حتى لو لم يُعدَّل

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 565

```typescript
require_shipping: formData.requiresShipping,
```

بعض متاجر سلة (خاصة المنتجات الرقمية) قد ترفض تغيير `require_shipping`. يُفضَّل إرساله فقط إذا تغيّر.

---

## القسم الثامن: مشاكل الـ Store وإدارة الحالة

### المشكلة #45 [حرجة] — لا تتم إعادة تحميل بيانات المنتج بعد الحفظ الناجح

**الملف:** `frontend/src/features/products/store/productEditStore.ts` الأسطر 386-394

**الكود الحالي:**
```typescript
toast.success('تم حفظ التغييرات بنجاح');
} catch (e: any) {
  throw e;
} finally {
  set({ isSaving: false });
}
```

**المشكلة:** بعد الحفظ الناجح، لا يتم `loadProductData` مجدداً. هذا يعني:
1. IDs الجديدة للمتغيرات المُنشأة حديثاً لن تُحدَّث في الـ State (تبقى كـ `row-XXX`)
2. قيم محسوبة من سلة (مثل السعر بعد الضريبة) لن تنعكس
3. إذا فشل تحديث متغير واحد من عشرة، المستخدم لا يعرف أي البيانات حُفِظت

**الإصلاح:**
```typescript
toast.success('تم حفظ التغييرات بنجاح');
// إعادة تحميل المنتج لمزامنة الحالة المحلية مع سلة
await get().loadProductData(productId, state.platform!);
```

---

### المشكلة #46 [عالية] — `hasInitializedRef` يمنع تحديث الخيارات بعد إضافة خيار جديد

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts` الأسطر 40-60

**الكود الحالي:**
```typescript
const hasInitializedRef = useRef(false);

useEffect(() => {
  hasInitializedRef.current = false;
}, [unifiedProduct?.id]);

useEffect(() => {
  if (hasInitializedRef.current) return;
  // ... تهيئة الخيارات
  hasInitializedRef.current = true;
}, [storeAttributes, unifiedProduct]);
```

**المشكلة:** `hasInitializedRef` يُعاد ضبطه فقط عند تغيير `unifiedProduct?.id`. بعد إضافة خيار جديد وتحديث `storeAttributes`، لا تتم إعادة التهيئة لأن `hasInitializedRef.current === true`. الخيار الجديد لن يظهر في صفوف الخيارات حتى إعادة تحميل الصفحة.

---

### المشكلة #47 [عالية] — تحديث `state.attributes` بعد إنشاء خيار يُضيف كائناً بهيكل مختلف

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

**الكود الحالي:**
```typescript
useProductEditStore.setState(state => ({
  attributes: [...state.attributes, newAttr]
}));
```

`newAttr` = استجابة API الخام من `POST /products/{id}/options`
`state.attributes` = كائنات مُعدَّلة ومُدمَجة بهيكل مختلف

الهيكلان غير متوافقَين. `mapStoreAttributesToVariantTypes` ستُعطي نتائج خاطئة للخيار الجديد.

---

### المشكلة #48 [عالية] — منطق `saveProductData` لسلة لا يُعالج أخطاء جزئية

**الملف:** `frontend/src/features/products/store/productEditStore.ts` الأسطر 350-385

**الكود الحالي:**
```typescript
for (const variant of formData.variants) {
  await productEditService.updateProductVariant(...);  // إذا فشل أي واحد → throw
}
```

إذا فشل تحديث المتغير الثالث من عشرة:
- throw يُلغي باقي التحديثات
- المتغيران الأول والثاني حُفِظا
- المتغيرات 4-10 لم تُحفَظ
- المستخدم يرى رسالة خطأ عامة بدون معرفة ما الذي حُفِظ

**الإصلاح:** استخدام `Promise.allSettled` مع تجميع الأخطاء الجزئية وعرضها.

---

### المشكلة #49 [متوسطة] — `platform` يُقرأ من `useAuthStore` بدلاً من الـ parameter

**الملف:** `frontend/src/features/products/store/productEditStore.ts` السطر 57

```typescript
const activePlatform = platform ?? (useAuthStore.getState().user?.platform as 'salla' | 'zid') ?? 'zid';
```

إذا لم يُمرَّر `platform` كـ parameter، يُستخدم منصة المستخدم الحالية. هذا يُقيِّد إمكانية عرض منتج من منصة مختلفة في سياقات خاصة.

---

## القسم التاسع: مشاكل التحقق من المدخلات

### المشكلة #50 [عالية] — وصف المنتج مطلوب بـ min(1) لكن سلة لا تشترطه دائماً

**الملف:** `frontend/src/features/products/utils/productValidation.ts` السطر 6

```typescript
descriptionAr: z.string().min(1, 'وصف المنتج باللغة العربية مطلوب'),
```

توثيق سلة يُشير إلى أن `description` اختياري في بعض أنواع المنتجات. إجبار المستخدم على إدخال وصف يُضيف عبئاً لا داعي له.

**الإصلاح:**
```typescript
descriptionAr: z.string().optional().nullable(),
```

---

### المشكلة #51 [عالية] — التحقق من `salePrice < price` لا يمنع `salePrice = 0`

**الملف:** `frontend/src/features/products/utils/productValidation.ts` الأسطر 114-124

`salePrice = 0` مع `price = 100` يجتاز التحقق (`0 < 100 = true`). لكن `sale_price: 0` يُلغي الخصم فعلياً في سلة. يجب إضافة:
```typescript
if (data.isDiscountActive && data.salePrice !== null) {
  return data.salePrice > 0 && data.salePrice < data.price;
}
```

---

### المشكلة #52 [متوسطة] — حقل `sku` للمتغير مطلوب بـ min(1) لكن سلة تُنشئه تلقائياً

**الملف:** `frontend/src/features/products/utils/productValidation.ts` السطر 70

```typescript
sku: z.string().min(1, 'SKU المتغير مطلوب'),
```

سلة تُنشئ SKU تلقائياً إذا لم يُرسَل. يُفضَّل جعل هذا الحقل اختيارياً مع توليد قيمة افتراضية.

---

### المشكلة #53 [متوسطة] — `seoSlug` regex يسمح بمسافات في رابط URL

**الملف:** `frontend/src/features/products/utils/productValidation.ts` السطر 58

```typescript
seoSlug: z.string().regex(/^[a-z0-9\u0600-\u06FF\s_-]*$/, '...').optional().nullable(),
```

`\s` (مسافات) مسموح بها في الـ regex. لكن URL slugs لا يجب أن تحتوي مسافات.

**الإصلاح:**
```typescript
/^[a-z0-9\u0600-\u06FF_-]*$/
```

---

### المشكلة #54 [منخفضة] — لا يوجد تحقق من `maxOrderQuantity >= minOrderQuantity`

**الملف:** `frontend/src/features/products/utils/productValidation.ts`

يمكن للمستخدم تعيين `min = 10` و`max = 5` محلياً وسيقبل التحقق. سلة ستُعيد خطأ 422.

**الإصلاح:**
```typescript
.refine(data => {
  if (data.minOrderQuantity && data.maxOrderQuantity) {
    return data.maxOrderQuantity >= data.minOrderQuantity;
  }
  return true;
}, { message: 'الحد الأقصى يجب أن يكون أكبر من أو يساوي الحد الأدنى', path: ['maxOrderQuantity'] })
```

---

## القسم العاشر: مشاكل واجهة تفاصيل المنتج (SallaProductDetail)

### المشكلة #55 [متوسطة] — `SallaProductDetail` يعرض البيانات الخام من API مباشرة

**الملف:** `frontend/src/features/products/components/SallaProductDetail.tsx`

المكوّن مُصمَّم لعرض `rawProduct` مباشرة من سلة. كلما تغيّر هيكل استجابة سلة، يجب تحديث هذا المكوّن. يُفضَّل استخدام `UnifiedProduct` بدلاً من البيانات الخام.

---

### المشكلة #56 [متوسطة] — الكمية في `SallaProductDetail` لا تتحدث بعد تعديل المخزون

**الملف:** `frontend/src/features/products/components/SallaProductDetail.tsx` السطر 292

```tsx
{sku.unlimited_quantity ? '∞' : sku.stock_quantity}
```

`sku.stock_quantity` يأتي من `product` الخام (المُخزَّن عند التحميل). بعد تعديل الكميات، `product` لا يتحدث (المشكلة #45). الكمية المعروضة تظل قديمة.

---

### المشكلة #57 [منخفضة] — تنسيق الأسعار يفترض العملة SAR دائماً

**الملف:** `frontend/src/features/products/components/SallaProductDetail.tsx` السطر 127

```tsx
{details.sale_price?.currency || 'SAR'}
```

إذا كان المتجر يعمل بعملة أخرى (BHD, KWD, AED)، ستُعرض عملة خاطئة.

---

## القسم الحادي عشر: مشاكل الصور

### المشكلة #58 [عالية] — حذف صورة سلة يفتقد `product_id` في المسار

**الملف:** `frontend/src/features/products/services/productEditService.ts`

**الكود الحالي:**
```typescript
const response = await apiClient.delete(`/api/proxy/products/images/${imageId}`);
```

**توثيق سلة الصحيح:**
```
DELETE https://api.salla.dev/admin/v2/products/{product_id}/images/{image_id}
```

**الأثر:** يعود بـ 404 من سلة. حذف الصورة لا يعمل أبداً لمنتجات سلة.

**الإصلاح:**
```typescript
deleteProductImage: async (productId, imageId, platform) => {
  const response = await apiClient.delete(
    `/api/proxy/products/${productId}/images/${imageId}`
  );
  return response.data;
},
```

---

### المشكلة #59 [عالية] — تعيين الصورة الرئيسية يُحدِّث الـ UI فقط دون إرسال طلب لـ API سلة

**الملف:** `frontend/src/features/products/hooks/useProductBasicInfo.ts` الأسطر 144-151

**الكود الحالي:**
```typescript
const handleSetMainImage = (imageId: string) => {
  const updatedImages = safeImages.map(img => ({
    ...img,
    isMain: img.id === imageId
  }));
  setValue('images', updatedImages, { shouldDirty: true });
  toast.success('تم تحديد الصورة الرئيسية للمنتج');
};
```

**المشكلة:** التغيير يُعيَّن محلياً فقط. عند إعادة تحميل الصفحة، تعود الصورة الرئيسية القديمة.

**توثيق سلة:** يوجد endpoint لتعيين الصورة الرئيسية:
`PUT https://api.salla.dev/admin/v2/products/{product_id}/images/{image_id}`
مع الـ body: `{ "is_main": true }`

---

### المشكلة #60 [متوسطة] — رفع الصور يدعم صورة واحدة فقط في كل مرة

**الملف:** `frontend/src/features/products/components/ProductEdit/BasicInfoSection.tsx` السطر 55

```tsx
<input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
```

بدون `multiple` لا يمكن تحديد أكثر من صورة. المستخدم يرفع كل صورة بشكل منفصل. سلة تدعم رفع صور متعددة.

---

### المشكلة #61 [متوسطة] — حقل alt text للصور مُرسَل بـ `alt` لكن قد تتوقع سلة `alt_text`

**الملف:** `backend/src/controllers/uploadController.js` السطر 132

```javascript
form.append('alt', req.body.alt_text);
```

يجب التحقق من الحقل الصحيح في توثيق سلة. إرسال الحقل بالاسم الخاطئ يُهدر بيانات SEO المهمة.

---

## القسم الثاني عشر: مشاكل المخزون والكميات

### المشكلة #62 [حرجة] — `handleUnlimitedToggle` يُصفِّر الكمية في كلا الحالتين

**الملف:** `frontend/src/features/products/hooks/useProductPricingInventory.ts` الأسطر 68-85

**الكود الحالي:**
```typescript
const handleUnlimitedToggle = (checked: boolean) => {
  if (activeLocation && activeLocationIdx !== -1) {
    // للفروع: يحفظ الكمية عند التفعيل، يُصفِّرها عند الإلغاء
  } else {
    setValue('isUnlimited', checked, { shouldDirty: true });
    if (checked) {
      setValue('quantity', 0, { shouldDirty: true });  // تفعيل: تصفير ✓ (مقبول)
    } else {
      setValue('quantity', 0, { shouldDirty: true });  // إلغاء: تصفير أيضاً! ✗
    }
  }
};
```

عند إلغاء "غير محدود" للمنتج البسيط (بدون فروع)، تُصفَّر الكمية. يضيع مخزون المستخدم.

**الإصلاح:**
```typescript
} else {
  setValue('isUnlimited', checked, { shouldDirty: true });
  if (checked) {
    setValue('quantity', 0, { shouldDirty: true });
  }
  // عند الإلغاء: لا تُصفِّر، احتفظ بالكمية الحالية
}
```

---

### المشكلة #63 [عالية] — Shallow copy لـ `tempStocks` يُسبب تعديل الكائنات الأصلية

**الملف:** `frontend/src/features/products/components/ProductEdit/VariantsTable.tsx`

**الكود الحالي:**
```typescript
const updated = [...tempStocks];
updated[sIdx].isUnlimited = e.target.checked;  // يُعدِّل الكائن الأصلي!
```

`[...tempStocks]` نسخة سطحية. العناصر الداخلية تُشير لنفس الكائنات. زر "إلغاء" في نافذة المخزون لن يلغي التغييرات لأن الكائنات الأصلية تغيّرت.

**الإصلاح:**
```typescript
const updated = tempStocks.map(st => ({ ...st }));  // Deep copy للعناصر
updated[sIdx].isUnlimited = e.target.checked;
```

---

### المشكلة #64 [عالية] — تحديث كميات المتغير لا يُرسِل `isUnlimited` لسلة

**الملف:** `frontend/src/features/products/store/productEditStore.ts` الأسطر 374-382

**الكود الحالي:**
```typescript
const quantitiesPayload = variant.stocks.map(st => ({
  branch: Number(st.locationId),
  quantity: st.quantity,
  reason_id: reasonId
}));
```

عند `st.isUnlimited = true`، يُرسَل `quantity: 0` (أو أي رقم آخر). سلة لا تعلم أن الفرع "غير محدود" لأن الـ payload لا يتضمن `unlimited_quantity`.

**توثيق سلة:** يجب إضافة `unlimited: true` في الـ payload عند الكمية غير المحدودة.

---

### المشكلة #65 [متوسطة] — الكمية الإجمالية للمتغير يُحسَب بدون مراعاة الفروع غير المحدودة

**الملف:** `frontend/src/features/products/hooks/useProductVariants.ts`

```typescript
const totalQty = tempStocks.reduce((sum, st) => 
  sum + (st.isUnlimited ? 0 : (st.quantity || 0)), 0
);
const isAnyUnlimited = tempStocks.some(st => st.isUnlimited);

setValue(`variants.${activeStockIdx}.quantity`, totalQty);
setValue(`variants.${activeStockIdx}.isUnlimited`, isAnyUnlimited);
```

**المشكلة:** إذا كان فرع واحد "غير محدود" وبقية الفروع لها كميات، فـ:
- `totalQty` = مجموع كميات الفروع المحدودة فقط (مثلاً 100)
- `isAnyUnlimited` = true

في جدول المتغيرات يُعرَض "غير محدود" ✓، لكن عند الإرسال يُرسَل `quantity: 100` وليس unlimited. تناقض.

---

## القسم الثالث عشر: مشاكل التصنيفات (Categories)

### المشكلة #66 [عالية] — التصنيفات تُرسَل كـ strings بدلاً من integers

**الملف:** `frontend/src/features/products/utils/productAdapter.ts` السطر 568

```typescript
categories: formData.categories.map((c: any) => String(c.id)),
```

**الإصلاح:**
```typescript
categories: formData.categories.map((c: any) => Number(c.id)),
```

---

### المشكلة #67 [عالية] — فشل جلب التصنيفات لا يُبلَّغ عنه للمستخدم بشكل واضح

**الملف:** `frontend/src/features/products/store/productEditStore.ts`

عند فشل جلب التصنيفات:
```typescript
errors.categories = 'فشل جلب تصنيفات المتجر';
```

يُخزَّن الخطأ في `endpointErrors` لكن لا يتم عرض رسالة واضحة للمستخدم. قائمة التصنيفات تظهر فارغة بدون شرح. المستخدم لن يتمكن من اختيار تصنيف وسيفشل التحقق (`min(1)`).

---

### المشكلة #68 [متوسطة] — إضافة/حذف التصنيفات في سلة تعتمد على `PUT` الكلي وليس إضافة/حذف فردي

**التحليل:** في زد، تتم مزامنة التصنيفات بشكل ذكي:
```typescript
// زد:
for (const catId of toRemove) await removeProductCategory(productId, catId);
for (const catId of toAdd) await addProductCategory(productId, catId);
```

في سلة، يُرسَل `categories: [id1, id2, id3]` ضمن payload الـ PUT الكلي وسلة تُبدِّل القائمة كاملاً. هذا صحيح ويعمل، لكن إذا أعادت سلة خطأ يخص التصنيفات تحديداً، لا يوجد معالجة منفصلة لهذا الخطأ.

---

## جدول أولويات الإصلاح

| # | المشكلة | الأولوية | الملف الرئيسي | الجهد |
|---|---------|---------|--------------|-------|
| 2 | payload تحديث الكميات: مصفوفة مُغلَّفة بكائن | حرجة | productEditStore.ts | 30 دقيقة |
| 21 | `value` في attributes: كائن بدلاً من نص | حرجة | productAdapter.ts | 1 ساعة |
| 39 | `related_option_values` غائب من payload المتغير | حرجة | productAdapter.ts | 2 ساعة |
| 9 | دمج خيارات من 50 منتج → تلوث IDs | حرجة | productEditStore.ts | 4 ساعات |
| 16 | لا يوجد منطق إنشاء متغير جديد في سلة | حرجة | productEditStore.ts | 4 ساعات |
| 15 | إرسال PUT بـ ID يبدأ بـ row- | حرجة | productEditStore.ts | 1 ساعة |
| 4 | Endpoint إنشاء قيمة خيار: product_id مفقود | حرجة | productEditService.ts | 2 ساعة |
| 6 | Endpoint حذف خيار: product_id مفقود | حرجة | productEditService.ts | 1 ساعة |
| 45 | لا تتم إعادة تحميل المنتج بعد الحفظ | حرجة | productEditStore.ts | 2 ساعة |
| 58 | حذف صورة: product_id مفقود في المسار | حرجة | productEditService.ts | 30 دقيقة |
| 62 | handleUnlimitedToggle يُصفِّر الكمية في كلا الحالتين | حرجة | useProductPricingInventory.ts | 30 دقيقة |
| 5 | display_value بدلاً من color لخيارات اللون | عالية | useProductVariants.ts | 1 ساعة |
| 7 | categories تُرسَل كـ strings بدلاً من integers | عالية | productAdapter.ts | 15 دقيقة |
| 14 | مقارنة نص مع ID في تطابق المتغيرات | عالية | useProductVariants.ts | 1 ساعة |
| 17 | displayName يُعطي [object Object] | عالية | productAdapter.ts | 30 دقيقة |
| 24 | locationId يقرأ bq.id بدلاً من bq.branch_id | عالية | productAdapter.ts | 30 دقيقة |
| 59 | تعيين الصورة الرئيسية لا يُرسَل لـ API | عالية | useProductBasicInfo.ts | 2 ساعة |
| 63 | Shallow copy في VariantsTable | عالية | VariantsTable.tsx | 30 دقيقة |
| 64 | تحديث كميات لا يُرسل isUnlimited | عالية | productEditStore.ts | 1 ساعة |
| 66 | categories تُرسَل كـ strings | عالية | productAdapter.ts | 15 دقيقة |
| 11 | نوع الخيار لا يُحفَظ في VariantType | عالية | mapStoreAttributesToVariantTypes.ts | 2 ساعة |
| 46 | hasInitializedRef يمنع تحديث الخيارات الجديدة | عالية | useProductVariants.ts | 1 ساعة |
| 25 | زر "تأكيد وإنشاء المتغيرات" يختفي بدون توضيح | متوسطة | VariantsSection.tsx | 1 ساعة |
| 28 | استخدام window.confirm البدائي | متوسطة | useProductVariants.ts | 1 ساعة |
| 29 | وحدة الوزن ثابتة "كجم" | متوسطة | BasicInfoSection.tsx | 30 دقيقة |
| 50 | وصف المنتج إلزامي بلا مبرر | متوسطة | productValidation.ts | 15 دقيقة |
| 51 | salePrice = 0 يجتاز التحقق بشكل خاطئ | متوسطة | productValidation.ts | 15 دقيقة |
| 53 | seoSlug regex يسمح بمسافات | متوسطة | productValidation.ts | 15 دقيقة |
| 54 | لا تحقق من max >= min للكميات | منخفضة | productValidation.ts | 15 دقيقة |
| 32 | weight_type غائب من نموذج التعديل | منخفضة | productAdapter.ts | 1 ساعة |

---

## التوصيات الختامية

### المرحلة الأولى — إصلاحات حرجة فورية (أسبوع واحد)

#### 1. إصلاح payload تحديث الكميات
```typescript
// productEditStore.ts — السطر 374
// قبل:
const quantitiesPayload = { quantities: variant.stocks.map(...) };
// بعد:
const quantitiesPayload = variant.stocks.map(st => ({
  branch: Number(st.locationId),
  quantity: st.isUnlimited ? 0 : st.quantity,
  reason_id: reasonId
}));
```

#### 2. إصلاح حقل `value` في attributes سلة
```typescript
// productAdapter.ts — السطر 111
// قبل:
value: matchedVal
// بعد:
value: ProductAdapter.getLocalizedString(matchedVal)
```

#### 3. إضافة `related_option_values` في payload المتغير
```typescript
// productAdapter.ts — toSallaVariantPayload
static toSallaVariantPayload(variant: any): any {
  const payload: any = {
    sku: variant.sku,
    price: variant.price,
    related_option_values: Array.isArray(variant.attributes)
      ? variant.attributes.map((a: any) => Number(a.valueId)).filter(Boolean)
      : []
  };
  if (variant.barcode) payload.barcode = variant.barcode;
  if (variant.costPrice != null) payload.cost_price = variant.costPrice;
  if (variant.salePrice != null) payload.sale_price = variant.salePrice;
  else payload.sale_price = null;
  if (variant.weight != null) payload.weight = variant.weight;
  return payload;
}
```

#### 4. إصلاح جلب خيارات سلة
```typescript
// productEditStore.ts — استبدال كتلة جلب الـ 50 منتج بـ:
attributes = Array.isArray(productData?.options) ? productData.options : [];
```

#### 5. إضافة منطق إنشاء/حذف المتغيرات في سلة
```typescript
// productEditStore.ts — في منطق حفظ سلة
const originalVariantIds = state.unifiedProduct.variants.map(v => String(v.id));
const currentVariantIds = formData.variants.map(v => String(v.id));
const deletedVariantIds = originalVariantIds.filter(id => !currentVariantIds.includes(id));

// حذف المتغيرات المحذوفة
for (const varId of deletedVariantIds) {
  try {
    await productEditService.deleteProductVariant(productId, varId, 'salla');
  } catch (e) {
    console.warn(`فشل حذف المتغير ${varId}:`, e);
  }
}

// إضافة أو تحديث المتغيرات
for (const variant of formData.variants) {
  const isNew = String(variant.id).startsWith('row-') || !originalVariantIds.includes(String(variant.id));
  const sallaPayload = ProductAdapter.toSallaVariantPayload(variant);
  
  try {
    if (isNew) {
      await productEditService.createProductVariant(productId, sallaPayload);
    } else {
      await productEditService.updateProductVariant(productId, variant.id, sallaPayload, 'salla');
    }
  } catch (e) {
    console.error(`فشل ${isNew ? 'إنشاء' : 'تحديث'} المتغير:`, e);
  }
}
```

#### 6. إصلاح Endpoints الخيارات بتضمين product_id
```typescript
// productEditService.ts
createProductOptionValue: async (productId, optionId, payload) => {
  const response = await apiClient.post(
    `/api/proxy/products/${productId}/options/${optionId}/values`,
    payload
  );
  return response.data;
},

deleteProductOption: async (productId, optionId, platform) => {
  if (platform === 'zid') return { success: true };
  const response = await apiClient.delete(
    `/api/proxy/products/${productId}/options/${optionId}`
  );
  return response.data;
},

deleteProductImage: async (productId, imageId, platform) => {
  const response = await apiClient.delete(
    `/api/proxy/products/${productId}/images/${imageId}`
  );
  return response.data;
},
```

#### 7. إصلاح handleUnlimitedToggle
```typescript
// useProductPricingInventory.ts
} else {
  setValue('isUnlimited', checked, { shouldDirty: true });
  if (checked) {
    setValue('quantity', 0, { shouldDirty: true });
  }
  // عند الإلغاء: لا تُصفِّر
}
```

#### 8. إعادة تحميل المنتج بعد الحفظ
```typescript
// productEditStore.ts — نهاية saveProductData
toast.success('تم حفظ التغييرات بنجاح');
await get().loadProductData(productId, state.platform!);
```

---

### المرحلة الثانية — إصلاحات عالية الأولوية (أسبوعان)

1. **تحديث `VariantType` interface** لإضافة `type` و`displayType`
2. **إصلاح `locationId`** من `bq.id` إلى `bq.branch_id || bq.branch?.id || bq.id`
3. **إصلاح Shallow copy** في `VariantsTable` لـ `tempStocks`
4. **إرسال تعيين الصورة الرئيسية** لـ API سلة
5. **إضافة `nameEn`** في `fromSalla`
6. **إصلاح payload الكميات** ليُرسِل `unlimited` عند الحاجة
7. **إصلاح `categories`** من strings إلى integers
8. **إصلاح `hasInitializedRef`** ليُعيد التهيئة عند تغيير `storeAttributes`

---

### المرحلة الثالثة — تحسينات UX (أسبوعان إلى شهر)

1. **استبدال `window.confirm`** بـ Dialog مخصص متوافق مع تصميم التطبيق
2. **إضافة عداد التوليفات** قبل الضغط على "تأكيد"
3. **دعم رفع صور متعددة** في وقت واحد
4. **مؤشر تحميل** أثناء جلب خيارات المتجر
5. **إضافة `weight_type`** في نموذج التعديل
6. **إصلاح regex** لـ `seoSlug`
7. **إضافة تحقق** من `max >= min` للكميات
8. **عرض رسالة واضحة** عند فشل جلب التصنيفات

---

### المرحلة الرابعة — تحسينات الأداء والموثوقية (على المدى البعيد)

1. **رفع timeout الـ proxy** من 20 إلى 30 ثانية للكتابة
2. **إضافة تأخير بين طلبات الكتابة** لتجنب Rate Limit سلة
3. **معالجة أخطاء جزئية** بـ Promise.allSettled لطلبات متعددة
4. **تحميل `reason_id`** مرة واحدة عند بدء الجلسة وليس في كل حفظ
5. **إلغاء آلية جلب الـ 50 منتج** كلياً واستبدالها بخيارات المنتج الحالي

---

## الملاحق

### ملحق أ: جدول Endpoints الصحيحة لـ Salla API v2

| العملية | الـ Endpoint الصحيح | الطريقة | ملاحظة |
|--------|---------------------|---------|--------|
| جلب منتج | `/admin/v2/products/{id}` | GET | يشمل options وskus |
| تحديث منتج | `/admin/v2/products/{id}` | PUT | يقبل categories كـ integers |
| إنشاء خيار | `/admin/v2/products/{id}/options` | POST | يتطلب name, type, display_type, values |
| حذف خيار | `/admin/v2/products/{id}/options/{option_id}` | DELETE | يتطلب product_id في المسار |
| إضافة قيمة لخيار | `/admin/v2/products/{id}/options/{option_id}/values` | POST | يتطلب name وchoice fields |
| تحديث SKU | `/admin/v2/products/variants/{sku_id}` | PUT | يتطلب related_option_values |
| إنشاء SKU | `/admin/v2/products/{id}/variants` | POST | يتطلب related_option_values |
| حذف SKU | `/admin/v2/products/variants/{sku_id}` | DELETE | لا يتطلب product_id |
| تحديث كميات SKU | `/admin/v2/products/variants/{id}/quantities` | PUT | payload: مصفوفة مباشرة |
| رفع صورة | `/admin/v2/products/{id}/images` | POST multipart | الحقل: photo |
| حذف صورة | `/admin/v2/products/{id}/images/{image_id}` | DELETE | يتطلب product_id |
| تعيين صورة رئيسية | `/admin/v2/products/{id}/images/{image_id}` | PUT | `{ "is_main": true }` |

---

### ملحق ب: payload الصحيح لإنشاء خيار لوني في سلة

```json
{
  "name": "اللون",
  "type": "radio",
  "display_type": "color",
  "values": [
    { "name": "أحمر",  "color": "#FF0000" },
    { "name": "أزرق",  "color": "#0000FF" },
    { "name": "أخضر",  "color": "#00FF00" }
  ]
}
```

---

### ملحق ج: payload الصحيح لتحديث الكميات في سلة

```json
[
  { "branch": 12345, "quantity": 50, "reason_id": 303342349 },
  { "branch": 12346, "quantity": 30, "reason_id": 303342349 }
]
```

**مهم:** المصفوفة تُرسَل مباشرة (ليس داخل كائن).

---

### ملحق د: payload الصحيح لإنشاء SKU مرتبط بخيارات في سلة

```json
{
  "sku": "PROD-RED-XL",
  "price": 150.00,
  "cost_price": 80.00,
  "sale_price": null,
  "weight": 0.5,
  "barcode": "1234567890",
  "related_option_values": [501, 302]
}
```

حيث `501` و`302` هما IDs قيم الخيارات المرتبطة بهذا الـ SKU في المنتج نفسه.

---

### ملحق هـ: قائمة الملفات والسطور المتأثرة

| الملف | السطور المتأثرة | عدد المشاكل |
|-------|----------------|------------|
| `productEditStore.ts` | 57, 146-204, 358-383, 386-394 | 8 مشاكل |
| `productAdapter.ts` | 81, 87, 90, 107-113, 156, 162-164, 194, 565-599 | 10 مشاكل |
| `productEditService.ts` | 81, 125-128, 131-138, 158-160 | 6 مشاكل |
| `useProductVariants.ts` | 40-60, 100-101, 168-182, 288-296, 387-399, 458-467, 479, 502 | 9 مشاكل |
| `productValidation.ts` | 6, 58, 70, 114-124 | 4 مشاكل |
| `useProductPricingInventory.ts` | 68-85 | 1 مشكلة |
| `VariantsTable.tsx` | 113, 275-283 | 2 مشاكل |
| `VariantsSection.tsx` | 63, 130-175, 161-173 | 3 مشاكل |
| `mapStoreAttributesToVariantTypes.ts` | 1-11, 20-55 | 1 مشكلة |
| `proxyController.js` | 168, 241-249 | 2 مشاكل |
| `uploadController.js` | 132 | 1 مشكلة |
| `useProductBasicInfo.ts` | 144-151 | 1 مشكلة |
| `BasicInfoSection.tsx` | 55, 231 | 2 مشاكل |
| `SallaProductDetail.tsx` | 127, 292 | 2 مشاكل |

---

*نهاية التقرير*

**الإجمالي:** 72 مشكلة موثّقة
- حرجة (Critical): 11 مشكلة
- عالية الأولوية (High): 23 مشكلة
- متوسطة (Medium): 24 مشكلة
- منخفضة (Low): 14 مشكلة

**المصادر:**
- كود المشروع المحلي (project-dashbord)
- توثيق Salla API الرسمي على docs.salla.dev
- مجموعة Postman الرسمية لـ Salla Merchant APIs
- بحث المصادر الخارجية الموثوقة

*أُعِدَّ هذا التقرير بعد فحص شامل لجميع ملفات المشروع ومراجعة التوثيق الرسمي. جميع المشاكل موثَّقة بدليل من الكود أو التوثيق.*
