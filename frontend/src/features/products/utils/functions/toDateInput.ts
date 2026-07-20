/**
 * تحويل أي صيغة تاريخ (ISO 8601, Unix timestamp, string) إلى صيغة YYYY-MM-DD
 * المطلوبة لحقول الإدخال من نوع <input type="date"> في المتصفح.
 * ترجع null إذا كانت القيمة فارغة أو غير صالحة.
 *
 * @param value - تاريخ بصيغ مختلفة
 * @returns تاريخ بصيغة YYYY-MM-DD أو null
 */
export const toDateInput = (value: any): string | null => {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return null;
  }
};
