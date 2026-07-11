// ==========================================
// SALLA CUSTOMER TYPES
// ==========================================

export interface SallaCustomerItem {
  id: number;
  first_name: string;
  last_name: string;
  mobile: number;
  mobile_code: string;
  email: string;
  urls: {
    customer: string;
    admin: string;
  };
  avatar: string;
  gender: string;
  city: string;
  country: string;
  country_code?: string;
  location: string;
  updated_at: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  groups: number[];
}

export type SallaCustomerDetails = SallaCustomerItem;


// ==========================================
// ZID CUSTOMER TYPES
// ==========================================

export interface ZidCity {
  name: string;
  id: number;
  national_id: number;
  priority: number;
  country_id: number;
  country_name: string;
  country_code: string;
  ar_name: string;
  en_name: string;
}

export interface ZidCustomerItem {
  id: number;
  name: string;
  email: string;
  mobile: string;
  gender: string | null;
  birth_date: string | null;
  verified: boolean;
  is_active: boolean;
  is_cod_enabled: boolean;
  type: string;
  business_name: string | null;
  tax_number: string | null;
  commercial_registration: string | null;
  source: string;
  points: number;
  order_total_payments: string;
  last_order_date: string | null;
  created_at: string;
  updated_at: string;
  city: ZidCity | null;
  nickname: string | null;
  pivotEmail: string | null;
  pivotMobile: string | null;
  order_counts: number;
}

export type ZidCustomerDetails = ZidCustomerItem;

// ==========================================
// GENERIC TYPE
// ==========================================
export type PlatformCustomer = SallaCustomerItem | ZidCustomerItem;
