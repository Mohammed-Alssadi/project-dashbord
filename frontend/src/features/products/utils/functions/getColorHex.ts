/**
 * ترجع كود اللون (Hex) بناءً على اسم اللون باللغة العربية أو الإنجليزية
 *
 * @param colorName - اسم اللون (مثال: أحمر، أبيض، Blue)
 * @returns كود اللون أو null في حال عدم التعرف عليه
 */
export function getColorHex(colorName: string): string | null {
  if (!colorName) return null;
  const name = colorName.trim().toLowerCase();
  
  if (name.includes("أحمر") || name.includes("احمر") || name.includes("red")) return "#ef4444";
  if (name.includes("أزرق") || name.includes("ازرق") || name.includes("blue")) return "#3b82f6";
  if (name.includes("أخضر") || name.includes("اخضر") || name.includes("green")) return "#22c55e";
  if (name.includes("أبيض") || name.includes("ابيض") || name.includes("white")) return "#ffffff";
  if (name.includes("أسود") || name.includes("اسود") || name.includes("black")) return "#111827";
  if (name.includes("أصفر") || name.includes("اصفر") || name.includes("yellow")) return "#eab308";
  if (name.includes("رمادي") || name.includes("grey") || name.includes("gray")) return "#9ca3af";
  if (name.includes("برتقالي") || name.includes("orange")) return "#f97316";
  if (name.includes("وردي") || name.includes("زهري") || name.includes("pink")) return "#f472b6";
  if (name.includes("بنفسجي") || name.includes("purple") || name.includes("violet")) return "#a855f7";
  if (name.includes("بني") || name.includes("brown")) return "#78350f";
  if (name.includes("كحلي") || name.includes("navy")) return "#1e3a8a";
  if (name.includes("ذهبي") || name.includes("gold")) return "#d97706";
  if (name.includes("فضي") || name.includes("silver")) return "#cbd5e1";
  
  return null;
}
