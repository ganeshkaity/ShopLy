import { OrderStatus } from '@/types';

export const APP_NAME = 'Paper Petals';
export const APP_DESCRIPTION = 'Your destination for beautiful gifts, stationery, and handcrafted paper products.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
    'Order Placed',
    'Order Accepted',
    'Packed',
    'Couriered',
    'Shipped',
    'Out for Delivery',
    'Delivered',
];

/**
 * @deprecated Use getCategories() from category.service instead
 */
// export const PRODUCT_CATEGORIES = [
//     'Greeting Cards',
//     'Gift Wrapping',
//     'Notebooks & Journals',
//     'Planners & Organizers',
//     'Art Prints',
//     'Stickers & Labels',
//     'Envelopes & Letter Sets',
//     'Bookmarks',
//     'Gift Boxes',
//     'Digital Downloads',
//     'Wedding Stationery',
//     'Party Supplies',
//     'Calligraphy Supplies',
//     'Craft Kits',
//     'Other',
// ];

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const SHIPPING_CHARGE = 49;
export const FREE_SHIPPING_THRESHOLD = 499;

export const LOW_STOCK_THRESHOLD = 5;

export const PRODUCTS_PER_PAGE = 12;

export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

export const STATUS_COLORS: Record<OrderStatus, string> = {
    'Order Placed': 'bg-blue-100 text-blue-800',
    'Order Accepted': 'bg-indigo-100 text-indigo-800',
    'CONFIRMED': 'bg-green-100 text-green-800',
    'Packed': 'bg-yellow-100 text-yellow-800',
    'Couriered': 'bg-orange-100 text-orange-800',
    'Shipped': 'bg-purple-100 text-purple-800',
    'Out for Delivery': 'bg-cyan-100 text-cyan-800',
    'Delivered': 'bg-green-100 text-green-800',
};

// Alias for easier import across codebase
export const ORDER_STATUS_COLORS = STATUS_COLORS;

export const SHIPPING_CHARGES = {
    BASE_SHIPPING: SHIPPING_CHARGE,
    MIN_ORDER_FOR_FREE_SHIPPING: FREE_SHIPPING_THRESHOLD,
};

