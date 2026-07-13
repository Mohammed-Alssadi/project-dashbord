/**
 * Extracts localized string value from an object (checking 'ar' and 'en') or returns the string.
 */
export const extractName = (name: any): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    return name.ar || name.en || '';
  }
  return String(name);
};
