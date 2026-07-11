// ==========================================
// SALLA CATEGORY TYPES
// ==========================================

export interface SallaCategoryItem {
  id: number | string;
  name: string | { ar?: string; en?: string };
  image_url?: string | null;
  image?: string | null;
  status?: string;
  sort_order?: number;
  products_count?: number;
  sub_categories?: any[];
  urls?: {
    customer?: string;
    admin?: string;
  };
  html_url?: string;
  [key: string]: any;
}

export type SallaCategoryDetails = SallaCategoryItem;

// ==========================================
// ZID CATEGORY TYPES
// ==========================================

export interface ZidCategoryItem {
  id: number | string;
  uuid?: string;
  name: string;
  slug?: string;
  SEO_category_title?: string;
  SEO_category_description?: string;
  names?: {
    en?: string;
    ar?: string;
  };
  description?: string | null;
  url?: string;
  image?: string | null;
  image_full_size?: string | null;
  img_alt_text?: string;
  products_count?: number;
  sub_categories?: ZidCategoryItem[];
  parent_id?: number | null;
  flat_name?: string;
  is_published?: boolean;
  metafields?: any[];
  [key: string]: any;
}

export type ZidCategoryDetails = ZidCategoryItem;

// ==========================================
// UNIFIED PLATFORM TYPE
// ==========================================

export type PlatformCategory = SallaCategoryItem | ZidCategoryItem;
