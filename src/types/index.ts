export interface UserType {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: "USER" | "VENDOR" | "ADMIN";
  createdAt: string;
}

export interface ShopType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  isFeatured: boolean;
  isBlocked: boolean;
  rating: number;
  totalSales: number;
  userId: string;
  subscriptionPlan: string;
  subscriptionEnd: string | null;
  _count?: { products: number };
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string | null;
  images: string[];
  video: string | null;
  features: string[];
  deliveryInfo: string | null;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  shopId: string;
  categoryId: string;
  category?: CategoryType;
  shop?: ShopType;
  createdAt: string;
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  order: number;
  parentId: string | null;
  children?: CategoryType[];
  _count?: { products: number };
}

export interface OrderType {
  id: string;
  orderNumber: string;
  status: string;
  trackingNumber: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  note: string | null;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  region: string | null;
  zipCode: string | null;
  paidAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  userId: string;
  shopId: string;
  items: OrderItemType[];
  shop?: ShopType;
}

export interface OrderItemType {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: ProductType;
}

export interface ReviewType {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: string;
  user: { id: string; fullName: string; avatar: string | null };
  productId: string;
}

export interface ConversationType {
  id: string;
  userId: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  user: UserType;
  shop: ShopType;
  messages: MessageType[];
  _count?: { messages: number };
}

export interface MessageType {
  id: string;
  content: string | null;
  image: string | null;
  file: string | null;
  isRead: boolean;
  createdAt: string;
  senderId: string;
  conversationId: string;
}

export interface CouponType {
  id: string;
  code: string;
  discount: number;
  type: string;
  minAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  productId: string | null;
}

export interface AddressType {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  region: string | null;
  zipCode: string | null;
  isDefault: boolean;
  userId: string;
}
