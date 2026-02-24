import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CURRENCY_SYMBOL, FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '@/constants';

/**
 * Merge Tailwind CSS classes without conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format a number as INR currency.
 */
export function formatCurrency(amount: number): string {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Format a date string for display.
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format a date with time.
 */
export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Calculate shipping charge.
 */
export function calculateShipping(subtotal: number): number {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
}

/**
 * Generate a random order ID.
 */
export function generateOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PP-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Truncate text to a given length.
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Validate Indian pincode.
 */
export function isValidPincode(pincode: string): boolean {
    return /^[1-9][0-9]{5}$/.test(pincode);
}

/**
 * Validate Indian phone number.
 */
export function isValidPhone(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone);
}

/**
 * Validate email address.
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Debounce function for search inputs.
 */
export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
