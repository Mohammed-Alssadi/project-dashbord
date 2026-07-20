// Zid Product Edit Page (Presentation Component with Options, Variants, Restrictions, Metafields, and Custom Fields)
import { useState, useRef, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useProductEditForm } from '../hooks/useProductEditForm';
import type { ZidProductDetails } from '../types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronRight, 
  AlertCircle, 
  Loader2, 
  Save, 
  RotateCcw, 
  ExternalLink,
  Package, 
  FileText, 
  Coins, 
  Warehouse, 
  Layers, 
  Sliders, 
  Tags,
  Globe,
  Settings,
  Sparkles,
  Trash2,
  Plus,
  Wand2,
  Calendar,
  Layers3,
  UserCheck
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}

function RichTextEditor({ value, onChange, placeholder, dir = 'rtl' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'visual' | 'html'>('visual');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, tab]);

  const handleBlur = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, val: string = '') => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm transition-all focus-within:border-purple-300">
      <div className="flex items-center justify-between bg-muted/30 p-2 border-b border-border/80 text-xs select-none">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab('visual')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              tab === 'visual' ? 'bg-white shadow-sm text-purple-600' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            المحرر المرئي (Visual)
          </button>
          <button
            type="button"
            onClick={() => setTab('html')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              tab === 'html' ? 'bg-white shadow-sm text-purple-600' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            أكواد HTML
          </button>
        </div>
        
        {tab === 'visual' && (
          <div className="flex items-center gap-1" dir="ltr">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="size-7 rounded bg-white border border-border/60 hover:bg-muted font-bold text-xs shadow-sm flex items-center justify-center cursor-pointer"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="size-7 rounded bg-white border border-border/60 hover:bg-muted italic text-xs shadow-sm flex items-center justify-center cursor-pointer"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="size-7 rounded bg-white border border-border/60 hover:bg-muted underline text-xs shadow-sm flex items-center justify-center cursor-pointer"
              title="Underline"
            >
              U
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="size-7 rounded bg-white border border-border/60 hover:bg-muted font-bold text-xs shadow-sm flex items-center justify-center cursor-pointer"
              title="Bullet List"
            >
              •
            </button>
          </div>
        )}
      </div>

      {tab === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          onBlur={handleBlur}
          className="p-3 min-h-[150px] max-h-[300px] overflow-y-auto text-sm focus:outline-none text-right prose prose-sm max-w-none leading-relaxed"
          data-placeholder={placeholder}
          dir={dir}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[150px] font-mono text-xs p-3 focus-visible:ring-0 border-0 rounded-none bg-muted/5 leading-relaxed text-left"
          dir="ltr"
          placeholder="<html>..."
        />
      )}
    </div>
  );
}

export function ProductEditPage() {
  const {
    platform,
    selectedProduct,
    loadingDetail,
    errorDetail,
    allCategories,
    saving,
    register,
    handleSubmit,
    control,
    isDirty,
    watchIsInfinite,
    watchRequiresShipping,
    watchVariants,
    watchCategories,
    watchIsPublished,
    watchImages,
    watchHasOptions,
    watchOptions,
    watchMetafields,
    watchCustomUserInputFields,
    handleCategoryToggle,
    handleRemoveImage,
    handleAddImageUrl,
    handleAddOption,
    handleRemoveOption,
    handleAddChoice,
    handleRemoveChoice,
    handleGenerateVariants,
    handleAddUserInputField,
    handleRemoveUserInputField,
    handleAddCustomOptionChoice,
    handleRemoveCustomOptionChoice,
    onSubmit,
    handleCancel
  } = useProductEditForm();

  // حالات محلية للمدخلات
  const [newUrlInput, setNewUrlInput] = useState('');
  const [newOptionAr, setNewOptionAr] = useState('');
  const [newOptionEn, setNewOptionEn] = useState('');
  const [newChoiceInputs, setNewChoiceInputs] = useState<Record<number, { ar: string; en: string }>>({});
  
  // خيارات المستخدم المخصصة
  const [newCustomChoiceInputs, setNewCustomChoiceInputs] = useState<Record<number, { ar: string; en: string; price: number }>>({});

  const zidProduct = selectedProduct as ZidProductDetails | null;

  const handleAddImageClick = () => {
    const url = newUrlInput.trim();
    if (url) {
      handleAddImageUrl(url);
      setNewUrlInput('');
    }
  };

  const handleAddOptionClick = () => {
    if (newOptionAr.trim()) {
      handleAddOption(newOptionAr, newOptionEn);
      setNewOptionAr('');
      setNewOptionEn('');
    }
  };

  const handleAddChoiceClick = (optIdx: number) => {
    const inputs = newChoiceInputs[optIdx];
    if (inputs?.ar.trim()) {
      handleAddChoice(optIdx, inputs.ar, inputs.en);
      setNewChoiceInputs(prev => ({
        ...prev,
        [optIdx]: { ar: '', en: '' }
      }));
    }
  };

  const handleChoiceInputChange = (optIdx: number, field: 'ar' | 'en', val: string) => {
    setNewChoiceInputs(prev => ({
      ...prev,
      [optIdx]: {
        ar: prev[optIdx]?.ar || '',
        en: prev[optIdx]?.en || '',
        [field]: val
      }
    }));
  };

  // إدارة إضافة خيارات कस्टम لخيارات المستخدم
  const handleAddCustomChoiceClick = (fieldIdx: number) => {
    const inputs = newCustomChoiceInputs[fieldIdx];
    if (inputs?.ar.trim()) {
      handleAddCustomOptionChoice(fieldIdx, inputs.ar, inputs.en, inputs.price);
      setNewCustomChoiceInputs(prev => ({
        ...prev,
        [fieldIdx]: { ar: '', en: '', price: 0 }
      }));
    }
  };

  const handleCustomChoiceInputChange = (fieldIdx: number, field: 'ar' | 'en' | 'price', val: any) => {
    setNewCustomChoiceInputs(prev => ({
      ...prev,
      [fieldIdx]: {
        ar: prev[fieldIdx]?.ar || '',
        en: prev[fieldIdx]?.en || '',
        price: prev[fieldIdx]?.price || 0,
        [field]: field === 'price' ? Number(val) : val
      }
    }));
  };

  if (platform !== 'zid') {
    return (
      <div className="flex flex-col gap-6 w-full p-6 text-right font-sans" dir="rtl">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleCancel} className="size-8 rounded-lg shrink-0">
            <ChevronRight className="size-4" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">تعديل المنتج</h2>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-warning/30 bg-warning/5 text-amber-600 text-sm mt-4">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold">المنصة الحالية غير مدعومة للتعديل</span>
            <span className="opacity-90 text-xs">ميزة التعديل تدعم منصة زد (Zid) حالياً بشكل صارم. سنقوم بإضافة الدعم الكامل لمنصة سلة قريباً!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <form id="product-edit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full animate-fade-in font-sans text-right pb-16" dir="rtl">
      
      {/* الترويسة العليا */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Button 
            type="button"
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
            className="size-8 rounded-lg shrink-0"
          >
            <ChevronRight className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">
                تعديل المنتج
              </h2>
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">منصة زد</Badge>
            </div>
            {selectedProduct && (
              <p className="text-xs text-muted-foreground mt-0.5 max-w-[300px] truncate">
                معرف المنتج: {selectedProduct.id}
              </p>
            )}
          </div>
        </div>

        {zidProduct?.html_url && (
          <a 
            href={zidProduct.html_url} 
            target="_blank" 
            rel="noreferrer"
            className="text-xs flex items-center gap-1 text-purple-600 hover:underline font-semibold"
          >
            <ExternalLink className="size-3.5" />
            معاينة في المتجر
          </a>
        )}
      </div>

      {errorDetail && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold">حدث خطأ أثناء الاتصال بالمنصة</span>
            <span className="opacity-90 text-xs">{errorDetail}</span>
          </div>
        </div>
      )}

      {loadingDetail && !selectedProduct ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-10 text-purple-600 animate-spin" />
          <span className="text-sm text-muted-foreground font-semibold">جاري تحميل بيانات المنتج الفنية...</span>
        </div>
      ) : selectedProduct ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* العمود الرئيسي الأيمن (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. القسم الأساسي */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <FileText className="size-5 text-purple-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">البيانات الأساسية</CardTitle>
                  <CardDescription className="text-xs">الاسم التعريفي، الأوصاف، والرابط الدائم للمنتج</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                
                {/* اسم المنتج */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">اسم المنتج بالعربية <span className="text-destructive">*</span></label>
                    <Input 
                      {...register('name.ar')}
                      className="rounded-lg h-9 border-input text-sm"
                      placeholder="أدخل الاسم بالعربية"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">اسم المنتج بالإنجليزية</label>
                    <Input 
                      {...register('name.en')}
                      className="rounded-lg h-9 border-input text-sm text-left"
                      dir="ltr"
                      placeholder="Enter English Name"
                    />
                  </div>
                </div>

                {/* الوصف القصير */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">الوصف القصير بالعربية</label>
                    <Textarea 
                      {...register('short_description.ar')}
                      className="rounded-lg min-h-[70px] border-input text-sm"
                      placeholder="نبذة سريعة تظهر في محرك البحث وقائمة المنتجات"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">الوصف القصير بالإنجليزية</label>
                    <Textarea 
                      {...register('short_description.en')}
                      className="rounded-lg min-h-[70px] border-input text-sm text-left"
                      dir="ltr"
                      placeholder="Short english summary"
                    />
                  </div>
                </div>

                {/* الوصف الكامل */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-foreground/80">الوصف الكامل بالعربية</label>
                  <Controller
                    name="description.ar"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor 
                        value={field.value || ''} 
                        onChange={field.onChange} 
                        placeholder="التفاصيل والميزات الفنية الكاملة للمنتج"
                        dir="rtl"
                      />
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-foreground/80">الوصف الكامل بالإنجليزية</label>
                  <Controller
                    name="description.en"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor 
                        value={field.value || ''} 
                        onChange={field.onChange} 
                        placeholder="Full product details and HTML features"
                        dir="ltr"
                      />
                    )}
                  />
                </div>

                {/* رابط Slug */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                    <Globe className="size-3.5 text-muted-foreground" />
                    رابط المنتج الدائم (Slug)
                  </label>
                  <Input 
                    {...register('slug')}
                    className="rounded-lg h-9 border-input text-sm text-left font-mono"
                    dir="ltr"
                    placeholder="product-unique-slug"
                  />
                  <p className="text-[10px] text-muted-foreground">الرابط الفريد لصفحة هذا المنتج بالمتجر (مثال: `/products/test-slug`)</p>
                </div>

              </CardContent>
            </Card>

            {/* 2. قسم التسعير */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Coins className="size-5 text-purple-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">التسعير والتكلفة</CardTitle>
                  <CardDescription className="text-xs">تعديل قيم السعر، سعر التخفيض، وإعدادات الضريبة</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">السعر الأساسي <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <Input 
                        type="number"
                        step="any"
                        {...register('price')}
                        className="rounded-lg h-9 border-input text-sm pl-12"
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">ر.س</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">سعر التخفيض (اختياري)</label>
                    <div className="relative">
                      <Input 
                        type="number"
                        step="any"
                        {...register('sale_price')}
                        className="rounded-lg h-9 border-input text-sm pl-12"
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">ر.س</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">سعر التكلفة (سري)</label>
                    <div className="relative">
                      <Input 
                        type="number"
                        step="any"
                        {...register('cost')}
                        className="rounded-lg h-9 border-input text-sm pl-12"
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">ر.س</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">لا يظهر للعملاء، يُستخدم لحساب الأرباح فقط</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">المنتج خاضع للضريبة</span>
                    <span className="text-[10px] text-muted-foreground">تطبيق ضريبة القيمة المضافة الافتراضية على السعر عند البيع</span>
                  </div>
                  <Controller
                    name="is_taxable"
                    control={control}
                    render={({ field }) => (
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 3. المخزون والشحن */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Warehouse className="size-5 text-purple-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">المخزون والشحن</CardTitle>
                  <CardDescription className="text-xs">إدارة رمز الـ SKU وتوفر المخزون والوزن للطلب</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">رمز المخزون (SKU)</label>
                    <Input 
                      {...register('sku')}
                      className="rounded-lg h-9 border-input text-sm font-mono text-left"
                      dir="ltr"
                      placeholder="SKU-XXXXX"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">الباركود (Barcode)</label>
                    <Input 
                      {...register('barcode')}
                      className="rounded-lg h-9 border-input text-sm font-mono text-left"
                      dir="ltr"
                      placeholder="EAN-13 Barcode"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground">كمية غير محدودة (لا نهائي)</span>
                      <span className="text-[10px] text-muted-foreground">بيع المنتج بدون تتبع عدد القطع</span>
                    </div>
                    <Controller
                      name="is_infinite"
                      control={control}
                      render={({ field }) => (
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 justify-center">
                    <label className="text-xs font-semibold text-foreground/80">الكمية المتوفرة</label>
                    <Input 
                      type="number"
                      disabled={watchIsInfinite}
                      {...register('quantity')}
                      className="rounded-lg h-9 border-input text-sm disabled:bg-muted"
                      placeholder={watchIsInfinite ? 'مخزون لا نهائي' : '0'}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">يتطلب هذا المنتج شحناً (منتج مادي)</span>
                    <span className="text-[10px] text-muted-foreground">حساب رسوم الشحن وإصدار بوليصة تسليم للمنتج</span>
                  </div>
                  <Controller
                    name="requires_shipping"
                    control={control}
                    render={({ field }) => (
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    )}
                  />
                </div>

                {watchRequiresShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-purple-100 bg-purple-50/20 mt-2 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-foreground/80">وزن الشحنة</label>
                      <Input 
                        type="number"
                        step="any"
                        {...register('weight.value')}
                        className="rounded-lg h-9 border-input text-sm bg-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-foreground/80">وحدة الوزن</label>
                      <Controller
                        name="weight.unit"
                        control={control}
                        render={({ field }) => (
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-9 rounded-lg bg-white border-input">
                              <SelectValue placeholder="الوحدة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">كيلو جرام (kg)</SelectItem>
                              <SelectItem value="g">جرام (g)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 4. قيود الشراء والفترات (Purchase Restrictions) */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Calendar className="size-5 text-purple-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">قيود الشراء وفترات التوفر</CardTitle>
                  <CardDescription className="text-xs">تحديد حدود الطلب للعميل، وتواريخ توفر المنتج بالثانية</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">أقل كمية للطلب بالسلة</label>
                    <Input 
                      type="number"
                      {...register('purchase_restrictions.min_quantity_per_cart')}
                      className="rounded-lg h-9 border-input text-sm"
                      placeholder="لا توجد قيود"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">أقصى كمية للطلب بالسلة</label>
                    <Input 
                      type="number"
                      {...register('purchase_restrictions.max_quantity_per_cart')}
                      className="rounded-lg h-9 border-input text-sm"
                      placeholder="لا توجد قيود"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">بداية فترة توفر المنتج</label>
                    <Input 
                      type="datetime-local"
                      {...register('purchase_restrictions.availability_period_start')}
                      className="rounded-lg h-9 border-input text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">نهاية فترة توفر المنتج</label>
                    <Input 
                      type="datetime-local"
                      {...register('purchase_restrictions.availability_period_end')}
                      className="rounded-lg h-9 border-input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">بداية فترة سعر التخفيض</label>
                    <Input 
                      type="datetime-local"
                      {...register('purchase_restrictions.sale_price_period_start')}
                      className="rounded-lg h-9 border-input text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80">نهاية فترة سعر التخفيض</label>
                    <Input 
                      type="datetime-local"
                      {...register('purchase_restrictions.sale_price_period_end')}
                      className="rounded-lg h-9 border-input text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. تفعيل الخيارات والمواصفات */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Sliders className="size-5 text-purple-500 shrink-0" />
                <div className="flex-1">
                  <CardTitle className="text-base font-bold">خيارات ومواصفات المنتج</CardTitle>
                  <CardDescription className="text-xs">تفعيل خصائص المنتج مثل اللون، المقاس لتوليد خيارات فرعية</CardDescription>
                </div>
                <Controller
                  name="has_options"
                  control={control}
                  render={({ field }) => (
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  )}
                />
              </CardHeader>
              
              {watchHasOptions && (
                <CardContent className="flex flex-col gap-4 pt-0">
                  <hr className="border-border/40 mb-2" />
                  
                  <div className="flex flex-col gap-4">
                    {watchOptions.map((opt, optIdx) => (
                      <div key={opt.id || optIdx} className="p-4 rounded-xl border border-border bg-muted/10 flex flex-col gap-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(optIdx)}
                          className="absolute left-3 top-3 text-muted-foreground hover:text-red-500 transition-colors"
                          title="حذف هذا الخيار"
                        >
                          <Trash2 className="size-4" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">الخاصية {optIdx + 1}:</span>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 font-bold text-[10px]">
                            {opt.name.ar} {opt.name.en ? `(${opt.name.en})` : ''}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1.5 py-1">
                          {opt.choices && opt.choices.length > 0 ? (
                            opt.choices.map((ch: any, chIdx: number) => (
                              <Badge 
                                key={ch.id || chIdx} 
                                variant="outline" 
                                className="pr-2 pl-1 py-0.5 rounded-lg flex items-center gap-1.5 bg-white text-xs border-border/80"
                              >
                                <span>{ch.name.ar}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChoice(optIdx, chIdx)}
                                  className="text-muted-foreground hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">لا توجد خيارات فرعية</span>
                          )}
                        </div>

                        <div className="flex gap-2 items-end mt-1 pt-2 border-t border-dashed border-border/60">
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">قيمة جديدة (عربي)</label>
                            <Input
                              type="text"
                              value={newChoiceInputs[optIdx]?.ar || ''}
                              onChange={(e) => handleChoiceInputChange(optIdx, 'ar', e.target.value)}
                              placeholder="أحمر، S..."
                              className="h-8 text-xs bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">قيمة جديدة (إنجليزي)</label>
                            <Input
                              type="text"
                              value={newChoiceInputs[optIdx]?.en || ''}
                              onChange={(e) => handleChoiceInputChange(optIdx, 'en', e.target.value)}
                              placeholder="Red, S..."
                              className="h-8 text-xs bg-white text-left font-mono"
                              dir="ltr"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleAddChoiceClick(optIdx)}
                            size="sm"
                            className="h-8 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                          >
                            إضافة
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="p-4 rounded-xl border border-dashed border-purple-200 bg-purple-50/5 flex gap-3 items-end">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-semibold text-foreground/80">اسم الخاصية بالعربية</label>
                        <Input
                          type="text"
                          value={newOptionAr}
                          onChange={(e) => setNewOptionAr(e.target.value)}
                          placeholder="اللون، المقاس..."
                          className="h-9 text-xs bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-semibold text-foreground/80">اسم الخاصية بالإنجليزي</label>
                        <Input
                          type="text"
                          value={newOptionEn}
                          onChange={(e) => setNewOptionEn(e.target.value)}
                          placeholder="Color, Size..."
                          className="h-9 text-xs bg-white text-left font-mono"
                          dir="ltr"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddOptionClick}
                        className="h-9 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1"
                      >
                        <Plus className="size-3.5" />
                        إضافة الخاصية
                      </Button>
                    </div>

                    {watchOptions.length > 0 && (
                      <Button
                        type="button"
                        onClick={handleGenerateVariants}
                        className="w-full h-9 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                      >
                        <Wand2 className="size-4" />
                        توليد وضبط المتغيرات تلقائياً (Cartesian Generation)
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 6. جدول المتغيرات والخيارات الفعلي */}
            {watchHasOptions && watchVariants.length > 0 && (
              <Card className="border border-border/80 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                  <Sliders className="size-5 text-purple-500 shrink-0" />
                  <div>
                    <CardTitle className="text-base font-bold">خيارات ومتغيرات المنتج الحالية</CardTitle>
                    <CardDescription className="text-xs">تعديل أسعار ومخزون المتغيرات الحالية للمنتج</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="text-right text-xs font-bold">المتغير</TableHead>
                          <TableHead className="text-right text-xs font-bold">رمز SKU</TableHead>
                          <TableHead className="text-right text-xs font-bold">السعر</TableHead>
                          <TableHead className="text-right text-xs font-bold">التخفيض</TableHead>
                          <TableHead className="text-right text-xs font-bold">الكمية</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {watchVariants.map((v, idx) => (
                          <TableRow key={v.id || idx}>
                            <TableCell className="font-semibold text-xs max-w-[150px] truncate">
                              {v.name ? (v.name.ar || v.name.en || '') : `متغير ${idx + 1}`}
                            </TableCell>
                            <TableCell className="w-[180px]">
                              <Input 
                                {...register(`variants.${idx}.sku`)}
                                className="h-8 rounded-lg text-xs font-mono text-left"
                                dir="ltr"
                              />
                            </TableCell>
                            <TableCell className="w-[120px]">
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  step="any"
                                  {...register(`variants.${idx}.price`)}
                                  className="h-8 rounded-lg text-xs pl-8"
                                />
                                <span className="absolute left-2 top-2 text-[9px] text-muted-foreground">ر.س</span>
                              </div>
                            </TableCell>
                            <TableCell className="w-[120px]">
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  step="any"
                                  {...register(`variants.${idx}.sale_price`)}
                                  className="h-8 rounded-lg text-xs pl-8"
                                  placeholder="لا يوجد"
                                />
                                <span className="absolute left-2 top-2 text-[9px] text-muted-foreground">ر.س</span>
                              </div>
                            </TableCell>
                            <TableCell className="w-[100px]">
                              <Input 
                                type="number" 
                                disabled={watchIsInfinite}
                                {...register(`variants.${idx}.quantity`)}
                                className="h-8 rounded-lg text-xs disabled:bg-muted"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 7. الوسائط والمعرض */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Layers className="size-5 text-purple-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">الوسائط ومعرض الصور</CardTitle>
                  <CardDescription className="text-xs">الصور والفيديوهات المرفوعة للمنتج حالياً</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-1">
                  {watchImages && watchImages.length > 0 ? (
                    watchImages.map((img: any, idx: number) => (
                      <div key={img.id || idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted/30">
                        <img 
                          src={img.url} 
                          alt="product" 
                          className="w-full h-full object-cover" 
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 right-1 bg-purple-600 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full shadow">
                            الرئيسية
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                          title="حذف الصورة"
                        >
                          <Trash2 className="size-5 text-white hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-muted/10 gap-2">
                      <Package className="size-8 text-muted-foreground opacity-60" />
                      <span className="text-xs text-muted-foreground">لا توجد صور متوفرة للمنتج حالياً</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-end mt-2 p-3 bg-muted/20 rounded-xl border border-border/50">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-semibold text-foreground/80">إضافة صورة برابط مباشر</label>
                    <Input
                      type="url"
                      value={newUrlInput}
                      onChange={(e) => setNewUrlInput(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="h-8 text-xs bg-white"
                      dir="ltr"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddImageClick}
                    size="sm"
                    className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="size-3.5" />
                    إضافة
                  </Button>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-foreground/80">روابط الفيديو (يوتيوب أو روابط مباشرة)</label>
                  <Input 
                    {...register('videos')}
                    className="rounded-lg h-9 border-input text-sm text-left font-mono"
                    dir="ltr"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

              </CardContent>
            </Card>

            {/* 8. الحقول الإضافية والميتافيلدز (Metafields Editor) */}
            {watchMetafields.length > 0 && (
              <Card className="border border-border/80 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                  <Layers3 className="size-5 text-purple-500 shrink-0" />
                  <div>
                    <CardTitle className="text-base font-bold">الحقول الإضافية والميتافيلدز (Metafields)</CardTitle>
                    <CardDescription className="text-xs">تعبئة قيم حقول المتجر المخصصة لهذا المنتج</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {watchMetafields.map((field, idx) => {
                    const label = field.name?.ar || field.name?.en || field.slug;
                    const type = field.data_type;

                    return (
                      <div key={field.id} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/80 flex items-center gap-2">
                          <span>{label}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{type}</Badge>
                        </label>
                        {type === 'number' ? (
                          <Input 
                            type="number"
                            {...register(`metafields.${idx}.value`)}
                            className="rounded-lg h-9 border-input text-sm bg-white"
                          />
                        ) : type === 'date' ? (
                          <Input 
                            type="date"
                            {...register(`metafields.${idx}.value`)}
                            className="rounded-lg h-9 border-input text-sm bg-white"
                          />
                        ) : type === 'rich_text' || type === 'json' || type === 'table' ? (
                          <Textarea 
                            {...register(`metafields.${idx}.value`)}
                            className="rounded-lg min-h-[60px] border-input text-sm bg-white"
                          />
                        ) : (
                          <Input 
                            type="text"
                            {...register(`metafields.${idx}.value`)}
                            className="rounded-lg h-9 border-input text-sm bg-white"
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <UserCheck className="size-5 text-purple-500 shrink-0" />
                <div className="flex-1">
                  <CardTitle className="text-base font-bold">حقول وخيارات العميل المخصصة</CardTitle>
                  <CardDescription className="text-xs">تمكين العميل من إدخال نصوص، رفع ملفات، أو الاختيار من منسدلات وقوائم مخصصة عند الشراء</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={handleAddUserInputField}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold border-purple-200 hover:bg-purple-50"
                >
                  <Plus className="size-3.5 mr-1" />
                  إضافة حقل / خيار
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {watchCustomUserInputFields.length > 0 ? (
                  watchCustomUserInputFields.map((field, idx) => {
                    const isListType = field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox';

                    return (
                      <div key={field.id || idx} className="p-4 rounded-xl border border-border bg-muted/10 relative flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveUserInputField(idx)}
                          className="absolute left-3 top-3 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-foreground">اسم الحقل بالعربية</label>
                            <Input 
                              {...register(`custom_user_input_fields.${idx}.label.ar`)}
                              className="h-8 text-xs bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-foreground">نوع الحقل</label>
                            <Controller
                              name={`custom_user_input_fields.${idx}.type`}
                              control={control}
                              render={({ field: selectField }) => (
                                <Select value={selectField.value} onValueChange={selectField.onChange}>
                                  <SelectTrigger className="h-8 text-xs bg-white border-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">نص قصير (Text)</SelectItem>
                                    <SelectItem value="textarea">نص طويل (Textarea)</SelectItem>
                                    <SelectItem value="file">رفع ملف وصورة (File)</SelectItem>
                                    <SelectItem value="dropdown">قائمة منسدلة (Dropdown)</SelectItem>
                                    <SelectItem value="radio">أزرار اختيار راديو (Radio)</SelectItem>
                                    <SelectItem value="checkbox">مربعات اختيار متعددة (Checkbox)</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-foreground">السعر الإضافي</label>
                            <Input 
                              type="number"
                              {...register(`custom_user_input_fields.${idx}.price`)}
                              className="h-8 text-xs bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-foreground">الترتيب</label>
                            <Input 
                              type="number"
                              {...register(`custom_user_input_fields.${idx}.display_order`)}
                              className="h-8 text-xs bg-white"
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-white mt-3">
                            <span className="text-[10px] font-bold">مطلوب للشراء؟</span>
                            <Controller
                              name={`custom_user_input_fields.${idx}.is_required`}
                              control={control}
                              render={({ field: switchField }) => (
                                <Switch checked={switchField.value} onCheckedChange={switchField.onChange} />
                              )}
                            />
                          </div>
                        </div>

                        {/* قائمة القيم للخيارات المخصصة (تظهر فقط إذا كان النوع قائمة/منسدلة/اختيار) */}
                        {isListType && (
                          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-dashed border-border/50">
                            <span className="text-[10px] font-bold text-foreground">القيم والخيارات المتاحة بالقائمة:</span>
                            <div className="flex flex-wrap gap-2">
                              {field.choices && field.choices.length > 0 ? (
                                field.choices.map((ch: any, chIdx: number) => (
                                  <Badge key={ch.id || chIdx} variant="secondary" className="px-2.5 py-1 rounded-lg bg-white border border-border flex items-center gap-1.5 text-xs text-foreground">
                                    <span>{ch.name.ar}</span>
                                    {ch.price > 0 && <span className="text-purple-600 font-bold text-[10px]">(+{ch.price} ر.س)</span>}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCustomOptionChoice(idx, chIdx)}
                                      className="text-muted-foreground hover:text-red-500 text-xs ml-1 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">لم تضف خيارات للقائمة بعد</span>
                              )}
                            </div>

                            {/* إدخال خيار مخصص فرعي */}
                            <div className="flex gap-2 items-end mt-1 pt-2 border-t border-dashed border-border/50">
                              <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[9px] font-semibold text-muted-foreground">اسم الخيار</label>
                                <Input
                                  type="text"
                                  value={newCustomChoiceInputs[idx]?.ar || ''}
                                  onChange={(e) => handleCustomChoiceInputChange(idx, 'ar', e.target.value)}
                                  placeholder="أزرق، مقاس كبير..."
                                  className="h-8 text-xs bg-white"
                                />
                              </div>
                              <div className="flex flex-col gap-1 w-[80px]">
                                <label className="text-[9px] font-semibold text-muted-foreground">سعر إضافي</label>
                                <Input
                                  type="number"
                                  value={newCustomChoiceInputs[idx]?.price || ''}
                                  onChange={(e) => handleCustomChoiceInputChange(idx, 'price', e.target.value)}
                                  placeholder="0"
                                  className="h-8 text-xs bg-white"
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={() => handleAddCustomChoiceClick(idx)}
                                size="sm"
                                className="h-8 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                              >
                                إضافة قيمة
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center border border-dashed rounded-xl bg-muted/10 text-xs text-muted-foreground">
                    لم تقم بإضافة أي حقول أو خيارات مخصصة للعميل بعد
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* العمود الأيسر - جانبي (1/3) */}
          <div className="flex flex-col gap-6">
            
            {/* 1. حالة النشر والتوفر */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Settings className="size-5 text-purple-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">تنظيم وحالة النشر</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between p-2 rounded-xl border border-border bg-muted/20">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">الحالة في المتجر</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`size-2 rounded-full ${watchIsPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-semibold">
                        {watchIsPublished ? 'منشور (نشط)' : 'مسودة (مخفي)'}
                      </span>
                    </div>
                  </div>
                  <Controller
                    name="is_published"
                    control={control}
                    render={({ field }) => (
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    )}
                  />
                </div>

                <hr className="border-border/40" />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                    <Tags className="size-3.5 text-muted-foreground" />
                    الوسوم والكلمات الدلالية
                  </label>
                  <Textarea 
                    {...register('keywords')}
                    className="rounded-lg min-h-[60px] border-input text-sm leading-relaxed"
                    placeholder="حقيبة, فراولة"
                  />
                </div>

              </CardContent>
            </Card>

            {/* 2. الأقسام والتصنيفات */}
            <Card className="border border-border/80 shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Tags className="size-5 text-purple-500 shrink-0" />
                <div>
                  <CardTitle className="text-base font-bold">تصنيفات المنتج</CardTitle>
                  <CardDescription className="text-xs">اختر الأقسام المناسبة لربط المنتج بها في متجرك</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {allCategories && allCategories.length > 0 ? (
                  allCategories.map((cat: any) => {
                    const catId = String(cat.id || cat.category_id || cat);
                    const catName = cat.name ? (cat.name.ar || cat.name.en || cat.name) : 'قسم غير مسمى';
                    const isChecked = watchCategories.map(String).includes(catId);
                    
                    return (
                      <div 
                        key={catId} 
                        onClick={() => handleCategoryToggle(catId)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:bg-muted/30 ${
                          isChecked 
                            ? 'border-purple-200 bg-purple-50/10' 
                            : 'border-border/60 bg-transparent'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-purple-600 rounded size-3.5 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-foreground/80">{catName}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center gap-1.5 text-muted-foreground text-center">
                    <Loader2 className="size-5 animate-spin text-purple-600" />
                    <span className="text-xs">جاري تحميل أقسام المتجر الحية...</span>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle className="size-10 text-destructive" />
          <span className="text-sm font-semibold text-muted-foreground">لم يتم العثور على المنتج المطلوب.</span>
        </div>
      )}

    </form>

    {/* 6. شريط الحفظ العائم السفلي (Floating Save Bar) */}
    {isDirty && selectedProduct && (
      <div className="fixed bottom-6 inset-x-0 mx-auto z-50 w-[90%] md:w-[600px] flex items-center justify-between gap-4 p-4 rounded-2xl border border-purple-200 bg-white/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-purple-500 animate-pulse" />
          <span className="text-xs font-bold text-foreground">لديك تعديلات غير محفوظة على هذا المنتج</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/50 text-foreground"
          >
            <RotateCcw className="size-3.5 mr-1" />
            تجاهل
          </Button>
          <Button
            type="submit"
            form="product-edit-form"
            disabled={saving}
            className="h-9 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 mr-1 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="size-3.5 mr-1" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>
    )}
    </>
  );
}
