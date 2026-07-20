import { useFormContext, Controller } from "react-hook-form";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { FormFieldError } from "../../../../components/ui/FormFieldError";
import { useProductEditStore } from "../../store/productEditStore";
import { X, Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";

export function SeoSection() {
  const { unifiedProduct } = useProductEditStore();
  const { register, formState: { errors }, control, setValue, watch } = useFormContext();
  const [newTag, setNewTag] = useState('');

  if (!unifiedProduct) return null;

  const currentTags: string[] = watch('keywords') || [];
  const baseHtmlUrl = unifiedProduct.htmlUrl || "";
  const currentSlug = watch('seoSlug') || "";

  const handleAddTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setValue('keywords', [...currentTags, newTag.trim()], { shouldDirty: true });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue('keywords', currentTags.filter(t => t !== tag), { shouldDirty: true });
  };

  const getDynamicHtmlUrl = () => {
    if (!baseHtmlUrl) return "";
    try {
      const urlObj = new URL(baseHtmlUrl);
      const pathname = urlObj.pathname;
      const pathParts = pathname.split('/').filter(Boolean);
      
      if (pathParts.length > 0) {
        pathParts[pathParts.length - 1] = currentSlug;
        urlObj.pathname = '/' + pathParts.join('/');
      }
      return urlObj.toString();
    } catch (e) {
      return baseHtmlUrl;
    }
  };

  const dynamicUrl = getDynamicHtmlUrl();

  return (
    <AccordionItem value="seo" className="border rounded-xl bg-card shadow-sm px-6">
      <AccordionTrigger className="hover:no-underline py-6">
        <div className="flex flex-col items-start gap-1 text-right">
          <h3 className="text-xl font-semibold tracking-tight">تحسينات السيو (SEO) والوسوم</h3>
          <p className="text-sm text-muted-foreground font-normal">عنوان محرك البحث، الوصف، ورابط الصفحة</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6 pt-2 pb-4 text-right">

          {/* ── عنوان الصفحة (العربية والانجليزية) ───────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عنوان السيو (العربية)</Label>
              <Input
                {...register('seoTitleAr')}
                placeholder="أدخل عنوان الصفحة لمحركات البحث..."
                className={errors.seoTitleAr ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <FormFieldError message={errors.seoTitleAr?.message as string} />
            </div>

            <div className="space-y-2">
              <Label>عنوان السيو (الإنجليزية)</Label>
              <Input
                {...register('seoTitleEn')}
                placeholder="Enter SEO title..."
                className={errors.seoTitleEn ? "text-left border-destructive focus-visible:ring-destructive" : "text-left"}
                dir="ltr"
              />
              <FormFieldError message={errors.seoTitleEn?.message as string} />
            </div>
          </div>

          {/* ── وصف الصفحة (العربية والانجليزية) ───────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>وصف السيو (العربية)</Label>
              <Textarea
                {...register('seoDescriptionAr')}
                placeholder="أدخل ملخص الصفحة ليظهر في نتائج البحث..."
                className={errors.seoDescriptionAr ? "min-h-[80px] border-destructive focus-visible:ring-destructive" : "min-h-[80px]"}
              />
              <FormFieldError message={errors.seoDescriptionAr?.message as string} />
            </div>

            <div className="space-y-2">
              <Label>وصف السيو (الإنجليزية)</Label>
              <Textarea
                {...register('seoDescriptionEn')}
                placeholder="Enter SEO description..."
                className={errors.seoDescriptionEn ? "min-h-[80px] text-left border-destructive focus-visible:ring-destructive" : "min-h-[80px] text-left"}
                dir="ltr"
              />
              <FormFieldError message={errors.seoDescriptionEn?.message as string} />
            </div>
          </div>

          {/* ── رابط Slug ────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>رابط المنتج الفرعي (Slug)</Label>
            <Controller
              name="seoSlug"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    onChange={(e) => {
                      // تنظيف الرابط تلقائياً
                      const cleaned = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9\u0600-\u06FF\s_-]/g, '')
                        .replace(/\s+/g, '-');
                      field.onChange(cleaned);
                    }}
                    placeholder="product-unique-slug"
                    dir="ltr"
                    className={errors.seoSlug ? "text-left pl-14 border-destructive focus-visible:ring-destructive" : "text-left pl-14"}
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono select-none">
                    URL/
                  </span>
                </div>
              )}
            />
            <FormFieldError message={errors.seoSlug?.message as string} />
            <p className="text-[10px] text-muted-foreground">
              يُفضل استخدام كلمات مفتاحية مفصولة بشُرطة (-). مثال: t-shirt-blue
            </p>
          </div>

          {/* ── الوسوم (Keywords / Tags) ── */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <Label>الوسوم والكلمات الدلالية</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="أدخل وسماً جديداً واضغط Enter أو إضافة..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              />
              <Button type="button" onClick={handleAddTag}>إضافة</Button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentTags.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">لا توجد وسوم مضافة</span>
              ) : (
                currentTags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-muted text-foreground px-2.5 py-1 rounded-full text-xs font-semibold">
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* ── رابط صفحة المنتج العامة (معاينة ديناميكية) ── */}
          {dynamicUrl && (
            <div className="pt-4 border-t border-border/50 space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-1.5 justify-end">
                <span>رابط صفحة المنتج العامة (معاينة ديناميكية)</span>
                <Link2 className="h-4 w-4 text-primary" />
              </Label>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/60">
                <a
                  href={dynamicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline break-all flex-1 text-left py-1"
                  dir="ltr"
                >
                  {dynamicUrl}
                </a>
                <div className="flex gap-1.5 shrink-0 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => {
                      navigator.clipboard.writeText(dynamicUrl);
                      toast.success("تم نسخ رابط المنتج بنجاح");
                    }}
                  >
                    نسخ الرابط
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground border border-border/50 bg-background"
                    onClick={() => window.open(dynamicUrl, "_blank")}
                  >
                    زيارة الصفحة
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
