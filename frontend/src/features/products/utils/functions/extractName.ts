/**
 * دالة مساعدة لاستخراج الاسم المترجم بأمان
 * تقوم بفحص القيمة المارة: إذا كانت نصاً ترجعه مباشرة، وإذا كانت كائناً ثنائياً
 * ترجع الاسم العربي (ar) أو الإنجليزي (en) بحسب التوفر، وإلا ترجع قيمة فارغة.
 *
 * @param name - القيمة المراد استخراج الاسم منها (نص أو كائن)
 * @returns الاسم المستخرج كنص
 */
export const extractName = (name: any): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    return name.ar || name.en || '';
  }
  return String(name);
};
