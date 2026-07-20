/**
 * دالة مقارنة ذكية لاستخراج الحقول الملوثة/المعدلة فقط (Dirty Fields)
 * لتوليد Payload متوافق مع طلبات PATCH لمنصات زد وسلة.
 */
export function getDirtyValues(dirtyFields: any, formValues: any): any {
  if (typeof dirtyFields !== 'object' || dirtyFields === null) return {};

  const dirtyValues: any = {};

  for (const key in dirtyFields) {
    if (Object.prototype.hasOwnProperty.call(dirtyFields, key)) {
      const isFieldDirty = dirtyFields[key];
      const val = formValues[key];

      if (isFieldDirty === true) {
        // الحقل معدل بالكامل
        dirtyValues[key] = val;
      } else if (typeof isFieldDirty === 'object') {
        if (Array.isArray(val)) {
          // في حال كانت مصفوفة (مثل المتغيرات variants)
          // نقوم بإرسال المصفوفة كاملة بالقيم المعدلة لتفادي مشاكل الفهارس الناقصة بالـ API
          dirtyValues[key] = val;
        } else {
          // في حال كان كائن فرعي متداخل (مثل name أو weight)
          const childDiff = getDirtyValues(isFieldDirty, val);
          if (Object.keys(childDiff).length > 0) {
            dirtyValues[key] = childDiff;
          }
        }
      }
    }
  }

  return dirtyValues;
}
