import { useEffect, useState, useRef } from 'react';
// import { useCategoryStore } from '../store/categoryStore';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface CategoryFiltersBarProps {
  platform: 'salla' | 'zid';
}

export function CategoryFiltersBar({ platform }: CategoryFiltersBarProps) {
  // الطريقة القديمة
  // const { filters, setFilter, resetFilters } = useCategoryStore();
  const [searchParams, setSearchParams] = useSearchParams();
  // const pageParam = searchParams.get("page") || "1";

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentIsPublished = searchParams.get("is_published") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  const handleFilterChange = (key: string, value: string) => {
    // الطريقة القديمة
    // setFilter(key as keyof typeof filters, value);
    // if (pageParam !== "1") setSearchParams({ page: "1" });

    // الطريقة الجديدة
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleFilterChange('search', val);
    }, 800); // بناءً على طلبك تغييرها إلى 800 مثل المنتجات
  };

  const hasActiveFilters = Boolean(currentSearch || currentStatus || currentIsPublished);

  const handleReset = () => {
    // الطريقة القديمة
    // resetFilters();
    // setLocalSearch('');

    // الطريقة الجديدة
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
        <span className="text-xs font-medium">بحث وتصفية</span>
      </div>

      {/* فاصل عمودي */}
      <div className="h-5 w-px bg-border/60 shrink-0" />

      {/* 1. حقل البحث */}
      <div className="relative w-[220px] shrink-0">
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="بحث بالاسم أو المعرف..."
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

      {/* 2. فلتر سلة: الحالة */}
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
              <SelectItem value="active">active</SelectItem>
              <SelectItem value="hidden">hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 3. فلتر زد: حالة النشر */}
      {platform === 'zid' && (
        <div className="w-[130px] shrink-0">
          <Select
            value={currentIsPublished || 'all'}
            onValueChange={(val) => handleFilterChange('is_published', val === 'all' ? '' : val)}
          >
            <SelectTrigger className="rounded-lg border-border/70 h-8 text-xs text-right bg-background">
              <SelectValue placeholder="حالة النشر" />
            </SelectTrigger>
            <SelectContent className="text-right" dir="rtl">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="true">منشور</SelectItem>
              <SelectItem value="false">غير منشور</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* زر إعادة التعيين لو كان هناك أي فلتر نشط */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors mr-2 font-medium"
        >
          إعادة تعيين
        </button>
      )}
    </div>
  );
}
