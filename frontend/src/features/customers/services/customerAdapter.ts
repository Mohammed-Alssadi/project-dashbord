export interface UnifiedCustomer {
  id: string | number;
  name: string;
  email: string | null;
  mobile: string | null;
  mobileCode: string | null;
  city: string | null;
  avatar: string | null;
  gender: string | null;
  birthday: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  type: 'business' | 'individual';
  // Platform-specific extensions
  location: string | null; // Salla specific
  points: number | null;   // Zid specific
  orderCounts: number | null; // Zid specific
  rawDetails: any;
}

export const adaptCustomer = (raw: any): UnifiedCustomer => {
  if (!raw) return {} as UnifiedCustomer;

  const name = raw.full_name || raw.name || 'عميل غير مسمى';
  const avatar = raw.avatar || null;
  const email = raw.email || null;
  const mobile = raw.mobile || null;
  const mobileCode = raw.mobile_code || null;
  const city = raw.city?.ar_name || raw.city?.name || raw.city || null;
  const type = raw.type === 'business' ? 'business' : 'individual';

  // Salla/Zid specific
  const location = raw.location || null;
  const points = raw.points !== undefined && raw.points !== null ? Number(raw.points) : null;
  const orderCounts = raw.order_counts !== undefined && raw.order_counts !== null ? Number(raw.order_counts) : null;

  const birthday = raw.birthday?.date || raw.birth_date || null;
  const createdAt = raw.created_at?.date || raw.registration_date || raw.created_at || null;
  const updatedAt = raw.updated_at?.date || raw.updated_at || null;

  return {
    id: raw.id,
    name,
    email,
    mobile,
    mobileCode,
    city,
    avatar,
    gender: raw.gender || null,
    birthday,
    createdAt,
    updatedAt,
    type,
    location,
    points,
    orderCounts,
    rawDetails: raw
  };
};

export const adaptCustomersList = (response: any): UnifiedCustomer[] => {
  const list = response?.results || response?.data || response || [];
  if (!Array.isArray(list)) return [];
  return list.map(adaptCustomer);
};
