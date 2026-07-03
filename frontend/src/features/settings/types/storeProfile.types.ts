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
}

export interface StoreProfile {
  id: string | number;
  name: string;
  domain: string;
  avatar: string;
  plan: string;
  status: string;
  description: string;
  currency: string;
  verified: boolean;
  licenses: StoreLicenses;
  social: StoreSocialLinks;
}

export interface StoreProfileResponse {
  success: boolean;
  source?: 'cache' | 'api';
  data: StoreProfile;
}
