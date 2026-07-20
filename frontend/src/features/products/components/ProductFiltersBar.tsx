import { useEffect, useState, useRef } from 'react';
// import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '@/features/categories/store/categoryStore';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { PlatformCategory } from '@/features/categories/types/category';
import { useSearchParams } from 'react-router-dom';

interface ProductFiltersBarProps {
  platform: 'salla' | 'zid';
}

export function ProductFiltersBar({ platform }: ProductFiltersBarProps) {
  // الطريقة القديمة:
  // const { filters, setFilter, resetFilters } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [searchParams, setSearchParams] = useSearchParams();
  // const pageParam = searchParams.get("page") || "1";

  // استخراج الفلاتر الحالية من الرابط (الطريقة الجديدة)
  const currentSearch = searchParams.get("search") || "";
  const currentCategoryId = searchParams.get("category_id") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentProductClass = searchParams.get("product_class") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories(platform, 1);
    }
  }, [categories.length, fetchCategories, platform]);

  const handleFilterChange = (key: string, value: string) => {
    // الطريقة القديمة (Zustand)
    // setFilter(key as keyof typeof filters, value);
    // if (pageParam !== "1") setSearchParams({ page: "1" });

    // الطريقة الجديدة (URL Params)
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page"); // حذف رقم الصفحة للرجوع للصفحة الأولى ضمناً
    setSearchParams(newParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleFilterChange('search', val);
    }, 800);
  };

  const getCategoryName = (category: PlatformCategory) => {
    if (typeof category.name === 'string') return category.name;
    if (typeof category.name === 'object' && category.name !== null) {
      return category.name.ar || category.name.en || 'قسم بدون اسم';
    }
    return 'قسم بدون اسم';
  };

  const hasActiveFilters = Boolean(currentSearch || currentCategoryId || currentStatus || currentProductClass);

  const handleReset = () => {
    // الطريقة القديمة
    // resetFilters();
    // setLocalSearch('');
    // if (pageParam !== "1") setSearchParams({ page: "1" });

    // الطريقة الجديدة (تصفير كل شيء)
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/10"
      dir="rtl"
    >
      {/* أيقونة الفلتر */}
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 ml-1">
        <SlidersHorizontal className="size-3.5" />
        <span className="text-xs font-medium">فلترة</span>
      </div>

      {/* فاصل عمودي */}
      <div className="h-5 w-px bg-border/60 shrink-0" />

      {/* 1. حقل البحث */}
      <div className="relative w-[220px] shrink-0">
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="بحث بالاسم أو SKU..."
          className="pr-8 rounded-lg border-border/70 h-8 text-xs focus-visible:ring-1 text-right bg-background"
        />
        {localSearch && (
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setLocalSearch(''); handleFilterChange('search', ''); }}
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* 2. تصفية القسم */}
      <div className="w-[160px] shrink-0">
        <Select
          value={currentCategoryId || 'all'}
          onValueChange={(val) => handleFilterChange('category_id', val === 'all' ? '' : val)}
        >
          <SelectTrigger className="rounded-lg border-border/70 h-8 text-xs text-right bg-background">
            <SelectValue placeholder="كل الأقسام" />
          </SelectTrigger>
          <SelectContent className="text-right" dir="rtl">
            <SelectItem value="all">كل الأقسام</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {getCategoryName(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. فلتر سلة: الحالة */}
      {platform === 'salla' && (
        <div className="w-[130px] shrink-0">
          <Select
            value={currentStatus || 'all'}
            onValueChange={(val) => handleFilterChange('status', val === 'all' ? '' : val)}
          >
            <SelectTrigger className="rounded-lg border-border/70 h-8 text-xs text-right bg-background">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent dir="ltr">
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="sale">sale</SelectItem>
              <SelectItem value="hidden">hidden</SelectItem>
              <SelectItem value="out_of_stock">out_of_stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 4. فلتر زد: نوع المنتج */}
      {platform === 'zid' && (
        <div className="w-[140px] shrink-0">
          <Select
            value={currentProductClass || 'all'}
            onValueChange={(val) => handleFilterChange('product_class', val === 'all' ? '' : val)}
          >
            <SelectTrigger className="rounded-lg border-border/70 h-8 text-xs text-right bg-background">
              <SelectValue placeholder="نوع المنتج" />
            </SelectTrigger>
            <SelectContent className="text-right" dir="rtl">
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="voucher">قسيمة</SelectItem>
              <SelectItem value="grouped_product">مجمع</SelectItem>
              <SelectItem value="downloadable">قابل للتنزيل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 5. زر مسح */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive border border-dashed border-border/60 hover:border-destructive/40 rounded-lg transition-colors shrink-0"
        >
          <X className="size-3" />
          مسح
        </button>
      )}
    </div>
  );
}
