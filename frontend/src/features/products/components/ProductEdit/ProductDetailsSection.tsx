import { useFormContext, Controller } from "react-hook-form";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2 } from "lucide-react";
import { useProductEditStore } from "../../store/productEditStore";
import { useState, useRef, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { FormFieldError } from "../../../../components/ui/FormFieldError";

export function ProductDetailsSection() {
  const { unifiedProduct, platform } = useProductEditStore();
  const { register, formState: { errors }, control } = useFormContext();

  if (!unifiedProduct) return null;

  const descEn = unifiedProduct.descriptionEn;
  const shortDescAr = unifiedProduct.shortDescriptionAr;
  const shortDescEn = unifiedProduct.shortDescriptionEn;

  // محرر نصوص منسقة تفاعلي حقيقي مبني على contentEditable مع دعم عرض كود HTML والتبديل الديناميكي
  const RichEditor = ({ value, onChange, dir = 'rtl', placeholder, hasError }: { value: string; onChange: (val: string) => void; dir?: 'rtl' | 'ltr'; placeholder?: string; hasError?: boolean }) => {
    const [isCodeView, setIsCodeView] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const isInitializedRef = useRef(false);

    // مزامنة محتوى محرر contentEditable عند تغير القيمة الخارجية للمرة الأولى فقط أو عند اختلاف القيمة لمنع قفز المؤشر
    useEffect(() => {
      if (editorRef.current && !isCodeView) {
        if (!isInitializedRef.current || editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || '';
          isInitializedRef.current = true;
        }
      }
    }, [value, isCodeView]);

    const handleCommand = (command: string, arg?: string) => {
      document.execCommand(command, false, arg);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      onChange(e.currentTarget.innerHTML);
    };

    return (
      <div className={`border rounded-xl overflow-hidden bg-background shadow-sm transition-colors ${hasError ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive' : 'border-border'}`}>
        {/* شريط الأدوات المفعل برمجياً */}
        <div className="bg-muted/30 px-3 py-2 border-b flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {!isCodeView && (
              <>
                <div className="flex items-center gap-1 rtl:space-x-reverse border-l rtl:border-r rtl:border-l-0 pr-2 rtl:pr-0 rtl:pl-2 border-border">
                  <button
                    type="button"
                    onClick={() => handleCommand('bold')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="خط عريض"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommand('italic')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="خط مائل"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommand('underline')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="خط مسطر"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1 rtl:space-x-reverse border-l rtl:border-r rtl:border-l-0 px-2 border-border">
                  <button
                    type="button"
                    onClick={() => handleCommand('justifyRight')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="محاذاة لليمين"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommand('justifyCenter')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="توسيط"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommand('justifyLeft')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="محاذاة لليسار"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1 rtl:space-x-reverse px-2 border-border">
                  <button
                    type="button"
                    onClick={() => handleCommand('insertUnorderedList')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="قائمة نقطية"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommand('insertOrderedList')}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="قائمة رقمية"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('أدخل رابط التشعب:');
                      if (url) handleCommand('createLink', url);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="رابط"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsCodeView(!isCodeView);
              isInitializedRef.current = false;
            }}
            className="h-8 rounded-lg text-xs font-semibold px-3 border-border/80"
          >
            {isCodeView ? 'العرض المرئي ✨' : 'عرض كود HTML 🌐'}
          </Button>
        </div>

        {/* منطقة الكتابة */}
        {isCodeView ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            dir="ltr"
            placeholder="اكتب كود HTML هنا..."
            className="w-full min-h-[150px] p-4 text-sm font-mono leading-relaxed outline-none border-0 focus:ring-0 bg-slate-950 text-slate-100 resize-y block text-left"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            data-placeholder={placeholder}
            onInput={handleInput}
            onBlur={(e) => onChange(e.currentTarget.innerHTML)}
            className={`min-h-[150px] p-4 text-sm leading-relaxed outline-none bg-background ${dir === 'ltr' ? 'text-left' : 'text-right'}`}
            dir={dir}
          />
        )}
      </div>
    );
  };

  return (
    <AccordionItem value="details" className="border rounded-xl bg-card shadow-sm px-6">
      <AccordionTrigger className="hover:no-underline py-6">
        <div className="flex flex-col items-start gap-1 text-right">
          <h3 className="text-xl font-semibold tracking-tight">معلومات متقدمة وتفاصيل</h3>
          <p className="text-sm text-muted-foreground font-normal">الوصف، الباركود، وضوابط الطلبات</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8 pt-2 pb-4">

          {/* ── الوصف المختصر (يعرض فقط إذا كان مدعوماً) ──────────────────── */}
          {shortDescAr !== undefined && shortDescEn !== undefined && (
            <div className="space-y-3">
              <Label className="font-semibold text-base">الوصف المختصر</Label>
              <Tabs defaultValue="ar" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 max-w-[200px] mb-3">
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="ar" className="mt-0 outline-none">
                  <Controller
                    name="shortDescriptionAr"
                    control={control}
                    render={({ field }) => (
                      <RichEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="الوصف المختصر بالعربية..."
                        hasError={!!errors.shortDescriptionAr}
                      />
                    )}
                  />
                  <FormFieldError message={errors.shortDescriptionAr?.message as string} />
                </TabsContent>
                <TabsContent value="en" className="mt-0 outline-none">
                  <Controller
                    name="shortDescriptionEn"
                    control={control}
                    render={({ field }) => (
                      <RichEditor
                        value={field.value}
                        onChange={field.onChange}
                        dir="ltr"
                        placeholder="Short description in English..."
                        hasError={!!errors.shortDescriptionEn}
                      />
                    )}
                  />
                  <FormFieldError message={errors.shortDescriptionEn?.message as string} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* ── الوصف التفصيلي ───────────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="font-semibold text-base">الوصف التفصيلي</Label>
            {descEn === undefined ? (
              // سلة: يدعم لغة واحدة فقط
              <Controller
                name="descriptionAr"
                control={control}
                render={({ field }) => (
                  <RichEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="وصف تفصيلي كامل..."
                    hasError={!!errors.descriptionAr}
                  />
                )}
              />
            ) : (
              // زد: يدعم لغتين عربي وإنجليزي
              <Tabs defaultValue="ar" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 max-w-[200px] mb-3">
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="ar" className="mt-0 outline-none">
                  <Controller
                    name="descriptionAr"
                    control={control}
                    render={({ field }) => (
                      <RichEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="وصف تفصيلي كامل..."
                        hasError={!!errors.descriptionAr}
                      />
                    )}
                  />
                </TabsContent>
                <TabsContent value="en" className="mt-0 outline-none">
                  <Controller
                    name="descriptionEn"
                    control={control}
                    render={({ field }) => (
                      <RichEditor
                        value={field.value}
                        onChange={field.onChange}
                        dir="ltr"
                        placeholder="Detailed description in English..."
                        hasError={!!errors.descriptionEn}
                      />
                    )}
                  />
                  <FormFieldError message={errors.descriptionEn?.message as string} />
                </TabsContent>
              </Tabs>
            )}
            <FormFieldError message={errors.descriptionAr?.message as string} />
          </div>

          {/* ── الباركود + حدود الطلبات ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            {platform !== 'salla' ? (
              <div className="space-y-2 md:col-span-2">
                <Label className="font-semibold">الباركود</Label>
                <Input
                  {...register('barcode')}
                  placeholder="أدخل الباركود"
                  dir="ltr"
                  className={errors.barcode ? "h-11 bg-muted/20 focus-visible:bg-background text-left border-destructive focus-visible:ring-destructive" : "h-11 bg-muted/20 focus-visible:bg-background text-left"}
                />
                <FormFieldError message={errors.barcode?.message as string} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="font-semibold">رقم الجزء للمصنع (MPN)</Label>
                  <Input
                    {...register('mpn')}
                    placeholder="أدخل رقم MPN"
                    dir="ltr"
                    className={errors.mpn ? "h-11 bg-muted/20 focus-visible:bg-background text-left border-destructive focus-visible:ring-destructive" : "h-11 bg-muted/20 focus-visible:bg-background text-left"}
                  />
                  <FormFieldError message={errors.mpn?.message as string} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">رقم التجارة العالمي (GTIN)</Label>
                  <Input
                    {...register('gtin')}
                    placeholder="أدخل رقم GTIN"
                    dir="ltr"
                    className={errors.gtin ? "h-11 bg-muted/20 focus-visible:bg-background text-left border-destructive focus-visible:ring-destructive" : "h-11 bg-muted/20 focus-visible:bg-background text-left"}
                  />
                  <FormFieldError message={errors.gtin?.message as string} />
                </div>
              </>
            )}

            {platform !== 'salla' ? (
              <>
                <div className="space-y-2">
                  <Label className="font-semibold text-muted-foreground">
                    الحد الأدنى للكمية لكل طلب
                    <span className="font-normal mr-1">(اختياري)</span>
                  </Label>
                  <Input
                    type="number"
                    {...register('minOrderQuantity')}
                    className={errors.minOrderQuantity ? "h-11 bg-muted/20 focus-visible:bg-background border-destructive focus-visible:ring-destructive" : "h-11 bg-muted/20 focus-visible:bg-background"}
                  />
                  <FormFieldError message={errors.minOrderQuantity?.message as string} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-muted-foreground">
                    الحد الأقصى للكمية لكل طلب
                    <span className="font-normal mr-1">(اختياري)</span>
                  </Label>
                  <Input
                    type="number"
                    {...register('maxOrderQuantity')}
                    className={errors.maxOrderQuantity ? "h-11 bg-muted/20 focus-visible:bg-background border-destructive focus-visible:ring-destructive" : "h-11 bg-muted/20 focus-visible:bg-background"}
                  />
                  <FormFieldError message={errors.maxOrderQuantity?.message as string} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="font-semibold text-muted-foreground">
                    أقصى كمية مسموح بشرائها لكل طلب
                    <span className="font-normal mr-1">(اختياري)</span>
                  </Label>
                  <Input
                    type="number"
                    {...register('maxOrderQuantity')}
                    className={errors.maxOrderQuantity ? "h-11 bg-muted/20 focus-visible:bg-background border-destructive focus-visible:ring-destructive" : "h-11 bg-muted/20 focus-visible:bg-background"}
                  />
                  <FormFieldError message={errors.maxOrderQuantity?.message as string} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-muted-foreground">
                    أقصى كمية مسموح بشرائها لكل عميل
                    <span className="font-normal mr-1">(اختياري)</span>
                  </Label>
                  <Input
                    type="number"
                    {...register('maxItemsPerUser')}
                    className={errors.maxItemsPerUser ? "h-11 bg-muted/20 focus-visible:bg-background border-destructive focus-visible:ring-destructive" : "h-11 bg-muted/20 focus-visible:bg-background"}
                  />
                  <FormFieldError message={errors.maxItemsPerUser?.message as string} />
                </div>
              </>
            )}
          </div>

        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
