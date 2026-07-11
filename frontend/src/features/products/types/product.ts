export interface LocalizedString {
  ar?: string;
  en?: string;
}

// ==========================================
// SALLA PRODUCT TYPES
// ==========================================

export interface SallaProductItem {
  id: number;
  sku: string;
  thumbnail: string;
  mpn: string;
  gtin: string;
  type: string;
  name: string;
  short_link_code: string;
  urls: { customer: string; admin: string };
  price: { amount: number; currency: string };
  taxed_price: { amount: number; currency: string };
  pre_tax_price: { amount: number; currency: string };
  tax: { amount: number; currency: string };
  description: string;
  quantity: string | number;
  status: string;
  is_available: boolean;
  views: number;
  sale_price: { amount: number; currency: string } | null;
  sale_end: string | any;
  require_shipping: boolean;
  cost_price: string;
  weight: number;
  weight_type: string;
  with_tax: boolean;
  url: string;
  main_image: string;
  images: Array<{ id: number; url: string; main: boolean; type: string; sort: number; alt: string; video_url: string; three_d_image_url: string }>;
  sold_quantity: number | string;
  rating: { total: number; count: number; rate: number };
  regular_price: { amount: number; currency: string };
  max_items_per_user: number;
  maximum_quantity_per_order: number | string;
  show_in_app: boolean;
  notify_quantity: string;
  hide_quantity: boolean;
  unlimited_quantity: boolean;
  managed_by_branches: boolean;
  services_blocks: any;
  calories: string | number;
  customized_sku_quantity: boolean;
  channels: string[];
  metadata: { title: string; description: string; url: string };
  allow_attachments: boolean;
  is_pinned: boolean;
  pinned_date: string;
  sort: number;
  enable_upload_image: boolean;
  updated_at: string;
  options: any[];
  skus: Array<{
    id: number;
    sku: string | null;
    barcode: string | null;
    price: { amount: number; currency: string } | null;
    sale_price: { amount: number; currency: string } | null;
    regular_price: { amount: number; currency: string } | null;
    cost_price: { amount: number; currency: string } | null;
    stock_quantity: number;
    unlimited_quantity: boolean;
    weight: number | null;
    weight_type: string | null;
    weight_label: string | null;
    branches_quantities?: Array<{ id?: number; name?: string; branch?: { name: string }; quantity: number }>;
  }>;
  categories: any[];
  tags: any[];
  brand?: any;
  promotion?: { title: string; sub_title: string };
  scoped_prices?: any[];
  branches_quantities?: Array<{
    id?: number;
    name?: string;
    branch?: { name: string };
    quantity: number;
  }>;
}

export type SallaProductDetails = SallaProductItem;

// ==========================================
// ZID PRODUCT TYPES
// ==========================================

export interface ZidProductItem {
  id: string;
  product_class: string | null;
  sku: string;
  barcode: string;
  parent_id: string | null;
  name: LocalizedString;
  slug: string;
  price: number;
  short_description: LocalizedString;
  sale_price: number | null;
  formatted_price: string;
  formatted_sale_price: string | null;
  currency: string;
  currency_symbol: string;
  attributes: any[];
  categories: Array<{ id: string; name: LocalizedString; slug: string; description: LocalizedString }>;
  display_order: number;
  has_options: boolean;
  has_fields: boolean;
  images: any[];
  videos: any[];
  is_draft: boolean;
  quantity: number;
  is_infinite: boolean;
  html_url: string;
  weight: { value: number | null; unit: string };
  keywords: string[];
  requires_shipping: boolean;
  is_taxable: boolean;
  structure: string;
  seo: { title: LocalizedString; description: LocalizedString } | null;
  rating: { average: number; total_count: number };
  store_id: number;
  purchase_restrictions: any;
  metafields: any[];
  meta: any;
  related_products_settings: string;
  related_products_title: LocalizedString;
  badge: any;
  cost: number | null;
  is_published: boolean;
  waiting_customers_count: number | null;
  group_products: any;
  stocks: Array<{ id: string; location: { id: string; name: LocalizedString; type: string; full_address: string }; available_quantity: number; is_infinite: boolean }>;
  vouchers_count?: number;
  sold_products_count: number | null;
  created_at: string;
  updated_at: string;
  custom_option_fields?: any[];
  custom_user_input_fields?: any[];
  description?: LocalizedString;
  variants?: any[];
  options?: any[];
  related_products?: any[];
}

export type ZidProductDetails = ZidProductItem;

// ==========================================
// GENERIC TYPE
// ==========================================
export type PlatformProduct = SallaProductItem | ZidProductItem;
