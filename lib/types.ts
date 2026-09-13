export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_override: number | null;
  stock: number;
  sku: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  product_type: string | null;
  tags: string[];
  images: string[];
  price: number;
  compare_at_price: number | null;
  stock: number;
  collection_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  collection?: Collection | null;
  variants?: ProductVariant[];
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  total: number;
  currency: string;
  contact_email: string;
  contact_phone: string | null;
  shipping_address: ShippingAddress;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  discount_code: string | null;
  discount_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  title: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  image_url: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface HeroContent {
  heading: string;
  subheading: string;
  image_url: string;
  cta_label: string;
  cta_href: string;
}

export interface CartLine {
  productId: string;
  variantId: string | null;
  title: string;
  variantName: string | null;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}
