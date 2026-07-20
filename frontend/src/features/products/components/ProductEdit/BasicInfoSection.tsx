import { useFormContext } from "react-hook-form";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { FormFieldError } from "../../../../components/ui/FormFieldError";
import { ImageIcon, ChevronDown, Trash2, Star, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { useProductBasicInfo } from "../../hooks/useProductBasicInfo";

export function BasicInfoSection() {
  const { register, formState: { errors } } = useFormContext();
  const {
    safeImages,
    selectedCategories,
    selectedCategoryIds,
    categoriesList,
    isUploading,
    fileInputRef,
    handleImageUpload,
    handleDeleteImage,
    handleSetMainImage,
    handleCategoryToggle,
    platform,
  } = useProductBasicInfo();


  return (
    <AccordionItem value="basic-info" className="border rounded-xl bg-card shadow-sm px-6">
      <AccordionTrigger className="hover:no-underline py-6">
        <div className="flex flex-col items-start gap-1 text-right">
          <h3 className="text-xl font-semibold tracking-tight">المعلومات الأساسية</h3>
          <p className="text-sm text-muted-foreground font-normal">اسم المنتج، الصور، التصنيفات، والمعلومات الأساسية</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6 pt-2 pb-4">

          {/* ── صور المنتج ─────────────────────────────────────────────── */}
          <div className="space-y-3 text-right">
            <Label>صور المنتج</Label>
            <div className="flex flex-wrap gap-2.5">
              
              {/* مدخل ملف مخفي */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* زر رفع صورة جديدة */}
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="border border-dashed rounded-xl flex flex-col items-center justify-center p-2 text-center text-muted-foreground bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer w-24 h-24 shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 mb-1 animate-spin text-primary" />
                ) : (
                  <ImageIcon className="h-5 w-5 mb-1 opacity-40" />
                )}
                <p className="text-[10px] font-semibold">{isUploading ? 'جاري الرفع...' : 'إضافة صورة'}</p>
              </div>

              {/* الصور الحقيقية */}
              {safeImages.length === 0 ? (
                <div className="border rounded-xl flex items-center justify-center bg-muted/10 w-24 h-24 shrink-0">
                  <span className="text-[10px] text-muted-foreground">لا توجد صور</span>
                </div>
              ) : (
                safeImages.map((img, i) => {
                  const src = img.url;
                  const isMain = img.isMain;
                  return (
                    <div key={img.id ?? i} className="relative border rounded-xl overflow-hidden group w-24 h-24 shrink-0 bg-muted/5">
                      {isMain && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-md z-10 font-bold shadow-sm">
                          رئيسية
                        </div>
                      )}
                      
                      {src ? (
                        <img
                          src={src}
                          alt="صورة المنتج"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted/20">
                          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}

                      {/* شريط الإجراءات عند تمرير الفأرة */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {!isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(img.id)}
                            className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors"
                            title="تعيين كرئيسية"
                          >
                            <Star className="h-3.5 w-3.5 fill-white" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-1 rounded bg-destructive/80 hover:bg-destructive text-white transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── اسم المنتج ────────────────────────────────────────────── */}
          <div className={`grid grid-cols-1 ${platform !== 'salla' ? 'md:grid-cols-2' : ''} gap-4`}>
            <div className="space-y-2">
              <Label>اسم المنتج (العربية)</Label>
              <Input
                {...register('nameAr')}
                placeholder="اسم المنتج بالعربية"
                className={errors.nameAr ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <FormFieldError message={errors.nameAr?.message as string} />
            </div>
            {platform !== 'salla' && (
              <div className="space-y-2">
                <Label>اسم المنتج (الإنجليزية)</Label>
                <Input
                  {...register('nameEn')}
                  placeholder="Product name in English"
                  dir="ltr"
                  className={errors.nameEn ? "text-left border-destructive focus-visible:ring-destructive" : "text-left"}
                />
                <FormFieldError message={errors.nameEn?.message as string} />
              </div>
            )}
          </div>

          {/* ── التصنيفات ───────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>التصنيفات</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex h-11 w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none transition-colors cursor-pointer ${
                    errors.categories ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                  }`}
                >
                  <span className="truncate">
                    {selectedCategories.length > 0
                      ? selectedCategories.map(c => c.name).join('، ')
                      : 'اختر التصنيفات...'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px] rtl max-h-60 overflow-y-auto" align="center">
                <DropdownMenuLabel>اختر قسماً أو أكثر</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categoriesList.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    لا توجد تصنيفات متاحة
                  </div>
                ) : (
                  categoriesList.map(cat => (
                    <DropdownMenuItem
                      key={cat.id}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleCategoryToggle(cat.id);
                      }}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${selectedCategoryIds.includes(cat.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}
                      >
                        {selectedCategoryIds.includes(cat.id) && (
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
                            <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <FormFieldError message={errors.categories?.message as string} />
          </div>

          {/* ── SKU والوزن ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رمز المنتج (SKU)</Label>
              <Input
                {...register('sku')}
                placeholder="SKU"
                dir="ltr"
                className={errors.sku ? "text-left border-destructive focus-visible:ring-destructive" : "text-left"}
              />
              <FormFieldError message={errors.sku?.message as string} />
            </div>
            <div className="space-y-2">
              <Label>وزن المنتج</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  {...register('weight')}
                  className={errors.weight ? "pl-14 border-destructive focus-visible:ring-destructive" : "pl-14"}
                  placeholder="0"
                />
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">كجم</span>
              </div>
              <FormFieldError message={errors.weight?.message as string} />
            </div>
          </div>

        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
