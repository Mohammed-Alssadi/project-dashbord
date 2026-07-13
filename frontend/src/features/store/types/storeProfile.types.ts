export interface StoreLicenses {
  taxNumber?: string;
  commercialNumber?: string;
  freelanceNumber?: string;
}

export interface StoreSocialLinks {
  whatsapp?: string;
  twitter?: string;
  instagram?: string;
  snapchat?: string;
  telegram?: string;
  youtube?: string;
  maroof?: string;
  facebook?: string;
  tiktok?: string;
}

// ─── أنواع بيانات الهوية البصرية (Zid Branding) ─────────────────────────────
export interface StoreBrandingColors {
  btnDefaultBackground?: string | null;
  btnDefaultText?: string | null;
  btnDefaultBorder?: string | null;
  btnHoverBackground?: string | null;
  btnPressedBackground?: string | null;
  btnPressedText?: string | null;
  btnPressedBorder?: string | null;
}

export interface StoreBrandingTheme {
  id: number;
  name: string;
  mainImage: string | null;
  images: string[];
}

export interface StoreBranding {
  theme: StoreBrandingTheme | null;
  logo: string | null;
  icon: string | null;
  cover: string | null;
  colors: StoreBrandingColors | null;
}

// ─── أنواع بيانات اللغة والعملة (Zid Localization) ──────────────────────────
export interface StoreCurrency {
  name: string;
  code: string;
  symbol: string;
  flag: string | null;
  countryName: string | null;
  countryCode: string | null;
}

export interface StoreLanguage {
  name: string;
  code: string;
  direction: 'rtl' | 'ltr';
}

export interface StoreLocalization {
  language: StoreLanguage | null;
  languages: StoreLanguage[];
  currency: StoreCurrency | null;
  currencies: StoreCurrency[];
}

// ─── أنواع بيانات النشاط التجاري (Zid Business) ─────────────────────────────
export interface StoreBusiness {
  businessType: string | null;
  corporateName: string | null;
  commercialName: string | null;
  maroofNumber: number | null;
  civilId: number | null;
  hasBranches: boolean;
  branchCount: number | null;
  employeeCount: number | null;
  email: string | null;
  isMaroofChecked: boolean;
  isFreelanceChecked: boolean;
  commercialRegisterCertificate: string | null;
  maroofCertificate: string | null;
  civilIdImage: string | null;
  commercialRegistrationNumber: string | null;
}

// ─── الملف الشخصي الكامل للمتجر ──────────────────────────────────────────────
export interface StoreProfile {
  id: string | number | null;
  name: string;
  domain: string;
  avatar: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
  plan: string | null;
  status: string | null;
  description: string;
  currency: string;
  verified: boolean;
  licenses: StoreLicenses;
  social: StoreSocialLinks;
  // حقول زد الإضافية — غير موجودة في سلة (undefined)
  branding?: StoreBranding | null;
  localization?: StoreLocalization | null;
  business?: StoreBusiness | null;
}

export interface StoreProfileResponse {
  success: boolean;
  source?: 'cache' | 'api';
  data: StoreProfile;
}

