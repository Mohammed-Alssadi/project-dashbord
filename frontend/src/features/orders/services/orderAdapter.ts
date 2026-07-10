export interface UnifiedOrder {
  id: string | number;
  referenceNo: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  statusSlug: string;
  statusText: string;
  date: string;
  paymentMethod: string;
  platform: 'salla' | 'zid';
  canCancel: boolean;
  canReorder: boolean;
  isPendingPayment: boolean;
  hasSuspiciousAlert: boolean;
  rawItems?: any[];
}

export interface UnifiedOrderItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  thumbnail: string | null;
  sku: string | null;
}

export interface UnifiedOrderDetails extends UnifiedOrder {
  customer: {
    id: string | number | null;
    firstName: string;
    lastName: string;
    fullName: string;
    mobile: string;
    email: string;
    city: string;
    country: string;
  };
  receiver: {
    name: string;
    phone: string;
    email: string;
  } | null;
  amounts: {
    subTotal: number;
    shippingCost: number;
    taxAmount: number;
    taxPercent: string | number;
    discountAmount: number;
    total: number;
  };
  shipping: {
    courier: string | null;
    trackingNumber: string | null;
    weight: string | null;
  };
  items: UnifiedOrderItem[];
  urls: {
    admin: string | null;
    customer: string | null;
  };
  sourceDetails: {
    device: string | null;
    browser: string | null;
    ip: string | null;
  };
  paymentDetails?: {
    method: string;
    receiptImage?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
}

// ============================================================================
// Salla Adapters
// ============================================================================

export function adaptSallaOrder(sallaOrder: any): UnifiedOrder {
  // Salla customer might be missing in basic list if not included, we will try to extract if exist
  const customerName = sallaOrder.customer?.first_name 
    ? `${sallaOrder.customer.first_name} ${sallaOrder.customer.last_name || ''}`.trim()
    : '—';

  return {
    id: sallaOrder.id,
    referenceNo: String(sallaOrder.reference_id || sallaOrder.id),
    customerName: customerName,
    totalAmount: sallaOrder.total?.amount || 0,
    currency: sallaOrder.total?.currency || 'SAR',
    statusSlug: sallaOrder.status?.slug || 'unknown',
    statusText: sallaOrder.status?.customized?.name || sallaOrder.status?.name || '—',
    date: sallaOrder.date?.date || new Date().toISOString(),
    paymentMethod: sallaOrder.payment_method || '—',
    platform: 'salla',
    canCancel: !!sallaOrder.can_cancel,
    canReorder: !!sallaOrder.can_reorder,
    isPendingPayment: !!sallaOrder.is_pending_payment,
    hasSuspiciousAlert: !!sallaOrder.features?.has_suspicious_alert,
    rawItems: sallaOrder.items || [],
  };
}

export function adaptSallaOrderDetails(sallaDetails: any): UnifiedOrderDetails {
  const baseOrder = adaptSallaOrder(sallaDetails);

  return {
    ...baseOrder,
    customer: {
      id: sallaDetails.customer?.id || null,
      firstName: sallaDetails.customer?.first_name || '',
      lastName: sallaDetails.customer?.last_name || '',
      fullName: sallaDetails.customer?.first_name 
        ? `${sallaDetails.customer.first_name} ${sallaDetails.customer.last_name || ''}`.trim()
        : '—',
      mobile: `${sallaDetails.customer?.mobile_code || ''}${sallaDetails.customer?.mobile || ''}`.trim() || '—',
      email: sallaDetails.customer?.email || '—',
      city: sallaDetails.customer?.city || '—',
      country: sallaDetails.customer?.country || '—',
    },
    receiver: sallaDetails.receiver ? {
      name: sallaDetails.receiver.name || '',
      phone: sallaDetails.receiver.phone || '',
      email: sallaDetails.receiver.email || '',
    } : null,
    amounts: {
      subTotal: sallaDetails.amounts?.sub_total?.amount || 0,
      shippingCost: sallaDetails.amounts?.shipping_cost?.amount || 0,
      taxAmount: sallaDetails.amounts?.tax?.amount?.amount || 0,
      taxPercent: sallaDetails.amounts?.tax?.percent || 0,
      // Calculate total discount from array if needed
      discountAmount: sallaDetails.amounts?.discounts?.reduce((acc: number, d: any) => acc + (parseFloat(d.discount) || 0), 0) || 0,
      total: sallaDetails.amounts?.total?.amount || sallaDetails.total?.amount || 0,
    },
    shipping: {
      courier: sallaDetails.shipment?.courier_name || null,
      trackingNumber: sallaDetails.shipment?.tracking_number || null,
      weight: sallaDetails.total_weight || null,
    },
    items: (sallaDetails.items || []).map((item: any) => ({
      id: item.id || Math.random(),
      name: item.name || '',
      quantity: item.quantity || 1,
      price: item.amounts?.price_without_tax?.amount || item.price?.amount || 0,
      total: item.amounts?.total?.amount || item.total?.amount || 0,
      thumbnail: item.thumbnail || null,
      sku: item.sku || null,
    })),
    urls: {
      admin: sallaDetails.urls?.admin || null,
      customer: sallaDetails.urls?.customer || null,
    },
    sourceDetails: {
      device: sallaDetails.source_details?.device || null,
      browser: sallaDetails.source_details?.['user-agent'] ? sallaDetails.source_details['user-agent'].split(' ')[0] : null,
      ip: sallaDetails.source_details?.ip || null,
    },
    paymentDetails: {
      method: sallaDetails.payment_method || '',
      receiptImage: sallaDetails.receipt_image || undefined,
      bankName: sallaDetails.bank?.bank_name || undefined,
      accountName: sallaDetails.bank?.account_name || undefined,
      accountNumber: sallaDetails.bank?.account_number || undefined,
    }
  };
}

// ============================================================================
// Zid Adapters
// ============================================================================

export function adaptZidOrder(zidOrder: any): UnifiedOrder {
  return {
    id: zidOrder.id,
    referenceNo: String(zidOrder.order_number || zidOrder.id),
    customerName: zidOrder.customer?.name || '—',
    totalAmount: zidOrder.order_total || 0,
    currency: zidOrder.currency_code || 'SAR',
    statusSlug: zidOrder.order_status?.code || 'unknown',
    statusText: zidOrder.order_status?.name?.ar || '—',
    date: zidOrder.created_at || new Date().toISOString(),
    paymentMethod: zidOrder.payment?.method?.name?.ar || '—',
    platform: 'zid',
    canCancel: zidOrder.order_status?.code === 'new', // Basic assumption for Zid
    canReorder: false, 
    isPendingPayment: zidOrder.order_status?.code === 'pending_payment',
    hasSuspiciousAlert: false,
    rawItems: zidOrder.products || zidOrder.items || [],
  };
}

export function adaptZidOrderDetails(zidDetails: any): UnifiedOrderDetails {
  const baseOrder = adaptZidOrder(zidDetails);

  return {
    ...baseOrder,
    customer: {
      id: zidDetails.customer?.id || null,
      firstName: zidDetails.customer?.name ? zidDetails.customer.name.split(' ')[0] : '',
      lastName: zidDetails.customer?.name ? zidDetails.customer.name.split(' ').slice(1).join(' ') : '',
      fullName: zidDetails.customer?.name || '—',
      mobile: zidDetails.customer?.mobile || '—',
      email: zidDetails.customer?.email || '—',
      city: zidDetails.shipping?.address?.city?.name?.ar || '—',
      country: zidDetails.shipping?.address?.country?.name?.ar || '—',
    },
    receiver: null, // Zid usually uses one shipping address
    amounts: {
      subTotal: zidDetails.totals?.subtotal || 0,
      shippingCost: zidDetails.totals?.shipping || 0,
      taxAmount: zidDetails.totals?.tax || 0,
      taxPercent: 15, // Usually handled dynamically but this is a fallback
      discountAmount: zidDetails.totals?.discount || 0,
      total: zidDetails.totals?.total || zidDetails.order_total || 0,
    },
    shipping: {
      courier: zidDetails.shipping?.method?.name?.ar || null,
      trackingNumber: zidDetails.shipping?.tracking_number || null,
      weight: null, // Often requires separate API call in Zid
    },
    items: (zidDetails.products || []).map((item: any) => ({
      id: item.id || Math.random(),
      name: item.name?.ar || item.name || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      total: item.total || 0,
      thumbnail: item.images?.[0]?.url || item.image_url || null,
      sku: item.sku || null,
    })),
    urls: {
      admin: null,
      customer: null,
    },
    sourceDetails: {
      device: zidDetails.source || null,
      browser: null,
      ip: null,
    }
  };
}
