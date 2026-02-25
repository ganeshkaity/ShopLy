// Types for Paper Petals Ecommerce Platform

export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    photoURL?: string;
    phone?: string;
    address?: ShippingAddress;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ShippingAddress {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
}

export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: string;
    tags?: string[];
    type: ProductType;
    stock: number;
    weight?: number;
    digitalFileUrl?: string;
    productDetails?: string;
    minOrderQty?: number;
    freeShipping?: boolean;
    returnAvailable?: boolean;
    returnDays?: number;
    codAvailable?: boolean;
    securePayment?: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;
    type: ProductType;
    slug?: string;
    stock?: number;
}

export interface WishlistItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    slug?: string;
    addedAt: string;
}

export type OrderStatus =
    | 'Order Placed'
    | 'Order Accepted'
    | 'CONFIRMED'
    | 'Packed'
    | 'Couriered'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered';

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    type?: ProductType;
    slug?: string;
}

export interface Order {
    id?: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    totalAmount: number;
    shippingCharge?: number;
    subtotal?: number;
    discount?: number;
    couponCode?: string;
    status: OrderStatus;
    statusHistory?: StatusUpdate[];
    paymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StatusUpdate {
    status: OrderStatus;
    timestamp: string;
    note?: string;
}

export interface Coupon {
    id?: string;
    code: string;
    discountPercent: number;
    maxDiscount: number;
    minOrderAmount: number;
    usageLimit?: number;
    usedCount?: number;
    isActive: boolean;
    validUntil?: string;
    expiresAt?: string;
    createdAt?: string;
}

export interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalUsers: number;
    lowStockProducts: Product[];
}

export interface ChartData {
    label: string;
    value: number;
}

export interface SalesData {
    date: string;
    revenue: number;
    orders: number;
}

export interface RazorpayOrderResponse {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
}

export interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}
export interface HomeBanner {
    id: string;
    imageUrl: string;
    link: string;
}

export interface AppSettings {
    appName: string;
    supportEmail: string;
    supportPhone: string;
    currency: string;
    currencySymbol: string;
    freeShippingThreshold: number;
    whatsapp: string;
    facebook: string;
    instagram: string;
    address: string;
    heroTitlePrefix: string;
    heroTitleHighlight1: string;
    heroTitleHighlight2: string;
    heroTitleSuffix: string;
    heroSubtitle: string;
    banners?: HomeBanner[];
    updatedAt?: string;
}

export interface PromoPopup {
    id: string;
    type: 'DEFAULT' | 'IMAGE_ONLY' | 'HTML' | 'IN_SCREEN';
    title?: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    buttonText?: string;
    htmlContent?: string;
    isActive: boolean;
    showDelay: number; // in seconds
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    backgroundImage: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
