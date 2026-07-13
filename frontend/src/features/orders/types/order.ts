// ==========================================
// SALLA ORDER TYPES
// ==========================================

export interface SallaOrder {
  id: number | string;
  reference_id: number | string;
  customer?: {
    id: number | string;
    first_name: string;
    last_name: string;
    mobile_code?: string;
    mobile?: string;
    email?: string;
    city?: string;
    country?: string;
  };
  total?: {
    amount: number;
    currency: string;
  };
  status?: {
    slug: string;
    name: string;
    customized?: {
      name: string;
    };
  };
  date?: {
    date: string;
  };
  payment_method?: string;
  can_cancel?: boolean;
  can_reorder?: boolean;
  is_pending_payment?: boolean;
  features?: {
    has_suspicious_alert?: boolean;
  };
  items?: Array<{
    id: number | string;
    name: string;
    quantity: number;
    amounts?: {
      price_without_tax?: { amount: number };
      total?: { amount: number };
    };
    price?: { amount: number };
    total?: { amount: number };
    thumbnail?: string;
    sku?: string;
  }>;
  receiver?: {
    name: string;
    phone: string;
    email: string;
  } | null;
  amounts?: {
    sub_total?: { amount: number };
    shipping_cost?: { amount: number };
    tax?: {
      amount?: { amount: number };
      percent?: number;
    };
    discounts?: Array<{
      discount: string | number;
    }>;
    total?: { amount: number };
  };
  shipment?: {
    courier_name?: string | null;
    tracking_number?: string | null;
  };
  total_weight?: string | number | null;
  urls?: {
    admin?: string | null;
    customer?: string | null;
  };
  source_details?: {
    device?: string | null;
    ip?: string | null;
    'user-agent'?: string | null;
  };
  receipt_image?: string;
  bank?: {
    bank_name?: string;
    account_name?: string;
    account_number?: string;
  };
}

export type SallaOrderDetails = SallaOrder;

// ==========================================
// ZID ORDER TYPES
// ==========================================

export interface ZidOrder {
  id: number;
  invoice_number: number;
  code: string;
  store_id: number;
  order_url: string;
  store_name: string;
  shipping_method_code: string;
  store_url_1?: string; // fallback if needed
  currency_code: string;
  order_status: {
    name: string;
    code: string;
  };
  display_status: {
    id: number;
    code: string;
    color: string;
    name: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    note?: string;
    verified?: number;
    type?: string | null;
    business_name?: string | null;
    tax_number?: string | null;
    commercial_registration?: string | null;
  };
  has_different_consignee?: number;
  is_guest_customer?: number;
  is_gift_order?: number;
  gift_card_details?: any;
  is_quick_checkout_order?: boolean;
  order_total: string;
  order_total_string: string;
  has_different_transaction_currency?: boolean;
  transaction_reference?: string | null;
  transaction_amount?: number;
  transaction_amount_string?: string;
  issue_date: string;
  payment_status: string;
  is_potential_fraud?: boolean;
  source: string;
  source_code: string;
  is_reseller_transaction?: boolean;
  created_at: string;
  updated_at: string;
  is_on_demand?: boolean;
  import_id?: string | null;
  store_logo?: string;
  store_uuid?: string;
  tags?: Array<{
    id?: string;
    name?: string;
    store_id?: string;
    user_id?: string;
    orders?: string[];
  }>;
  requires_shipping: boolean;
  should_merchant_set_shipping_method?: boolean;
  shipping?: {
    method?: {
      id: number;
      name: string;
      code: string;
      estimated_delivery_time?: string | null;
      icon?: string | null;
      is_system_option?: boolean;
      waybill?: string | null;
      had_errors_while_fetching_waybill?: boolean;
      waybill_tracking_id?: string | null;
      has_waybill_and_packing_list?: boolean;
      tracking?: {
        number: string | null;
        status: string | null;
        url: string | null;
      };
      order_shipping_status?: string | null;
      inventory_address?: any;
      courier?: {
        name: {
          ar: string;
          en: string;
        };
        code: string;
        logo: string;
        identifier: string;
      } | null;
      return_shipment?: any;
      packages_count?: number | null;
    };
    address?: {
      formatted_address: string;
      street?: string;
      district?: string;
      lat?: number;
      lng?: number;
      short_address?: string;
      meta?: {
        building_number?: string;
        postcode?: string;
        additional_number?: string;
        city_name?: string;
      };
      city?: {
        id: number;
        name: string;
      };
      country?: {
        id: number;
        name: string;
      };
    };
  };
  payment?: {
    method?: {
      name: string;
      code: string;
      type: string;
      cart_payment_request_token?: string;
      transaction_status?: string;
      transaction_status_name?: string;
      transaction_bank?: string;
      transaction_slip?: string;
      transaction_sender_name?: string;
      updated_at?: string;
    };
    split_payments?: Array<{
      name?: string;
      code?: string;
      amount?: number;
      amount_string?: string;
      near_pay_transaction_uuid?: string;
      near_pay_transaction_details?: string;
    }>;
    invoice?: Array<{
      code: string;
      value: string | number;
      value_string: string;
      title: string;
    }>;
  };
  cod_confirmed?: boolean;
  reverse_order_label_request?: any;
  reverse_order_label_requests?: any[];
  customer_note?: string;
  gift_message?: string | null;
  payment_link?: string | null;
  weight?: number;
  weight_cost_details?: any[];
  currency?: {
    order_currency?: {
      id?: number;
      code?: string;
      exchange_rate?: number;
    };
    order_store_currency?: {
      id?: number;
      code?: string;
      exchange_rate?: number;
    };
  };
  coupon?: {
    code?: string;
    name?: string;
    id?: number;
    discount?: string | number;
    discount_string?: string;
  };
  products?: Array<{
    id: string;
    order_product_id?: number;
    parent_id?: string | null;
    parent_name?: string | null;
    product_class?: string | null;
    name: string;
    short_description?: {
      ar?: string;
      en?: string;
    };
    sku?: string;
    barcode?: string | null;
    custom_fields?: any[];
    quantity: number;
    weight?: number | null;
    is_taxable?: boolean;
    is_discounted?: boolean;
    meta?: any;
    is_external_product?: boolean;
    discounts?: {
      coupon?: {
        amount: number;
        percentage: number;
        unit_amount: number;
      };
    };
    net_price_with_additions?: number;
    net_price_with_additions_string?: string;
    price_with_additions?: number;
    price_with_additions_string?: string;
    net_price?: number;
    net_price_string?: string;
    net_sale_price?: string | number;
    net_sale_price_string?: string;
    net_additions_price?: number;
    net_additions_price_string?: string | null;
    gross_price?: number;
    gross_price_string?: string;
    gross_sale_price?: string | number;
    gross_sale_price_string?: string;
    price_before?: number;
    price_before_string?: string;
    total_before?: number;
    total_before_string?: string;
    gross_additions_price?: number;
    gross_additions_price_string?: string | null;
    discount_percentage?: number;
    tax_percentage?: number;
    tax_amount?: string | number;
    tax_amount_string?: string;
    tax_amount_string_per_item?: string;
    discounted_tax_amount?: number;
    discounted_tax_amount_string?: string;
    discounted_tax_amount_string_per_item?: string;
    price: number;
    price_string?: string;
    additions_price?: number;
    additions_price_string?: string;
    total: number;
    total_string?: string;
    discounted_total?: number;
    discounted_total_string?: string;
    images?: Array<{
      id?: string;
      origin?: string;
      thumbs?: {
        fullSize?: string;
        thumbnail?: string;
        small?: string;
        medium?: string;
        large?: string;
      };
    }>;
    options?: any[];
    inventory_allocations?: any[];
  }>;
  products_count?: number;
  products_sum_total_string?: string;
  is_preorder?: boolean;
  is_preorder_allocated?: boolean;
  language?: string;
  histories?: Array<{
    order_status_id?: number;
    order_status_name?: string;
    changed_by_id?: number;
    changed_by_type?: string;
    changed_by_details?: {
      action?: string;
      by?: string;
      comment?: string;
    };
    comment?: string;
    created_at?: string;
    humanized_created_at?: string;
  }>;
  is_reactivated?: boolean;
  return_policy?: string;
  packages_count?: number;
  inventory_address?: {
    id?: string;
    name?: string;
    city?: {
      id?: number;
      national_id?: number;
      name?: string;
      priority?: number;
      country_id?: number;
      country_name?: string;
      country_code?: string;
      ar_name?: string;
      en_name?: string;
    };
    full_address?: string;
    street?: string;
    short_address?: string | null;
    postal_code?: string | null;
    coordinates?: {
      lat?: number;
      lon?: number;
    };
    cop_enabled?: boolean;
    is_pickup_option?: boolean;
    is_zidship_default?: boolean;
    working_hours?: any[];
  };
  expected_shipping_method_type?: string | null;
  reseller_meta?: any;
  zidship_ticket_number?: string | null;
  edits_count?: number;
  can_request_order_due_payment?: boolean;
  payments?: Array<{
    name?: string;
    code?: string;
    type?: string;
    status?: string;
    amount?: number;
    amount_string?: string;
    transaction_reference?: string | null;
    payment_link?: string | null;
    created_at?: string;
  }>;
  payment_summary?: {
    is_multi_payment?: boolean;
    total?: number;
    total_string?: string;
    paid_amount?: number;
    paid_amount_string?: string;
    remaining_amount?: number;
    remaining_amount_string?: string;
  };
  delivered_at?: string | null;
  is_marketplace_order?: boolean;
  invoice_link?: string;
  payment_network?: string | null;
  preorder_campaign?: any;
  previous_order?: number | null;
  next_order?: number | null;
  invoice_settings?: {
    is_order_notifications_enabled?: boolean;
    is_zid_invoice_generation_enabled?: boolean;
  };
}

export type ZidOrderDetails = ZidOrder;

// ==========================================
// UNIFIED PLATFORM ORDER TYPE
// ==========================================
export type PlatformOrder = SallaOrder | ZidOrder;
