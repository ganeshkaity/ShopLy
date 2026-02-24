import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CartItem, Product } from "@/types";

/**
 * Gets the current cart for a user.
 */
export async function getCart(uid: string): Promise<CartItem[]> {
    const docRef = doc(db, "carts", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().items || [];
    }
    return [];
}

/**
 * Saves the entire cart to Firestore.
 */
export async function saveCart(uid: string, items: CartItem[]) {
    const docRef = doc(db, "carts", uid);
    await setDoc(docRef, { items, updatedAt: new Date().toISOString() });
}

/**
 * Adds an item to the cart or updates quantity if exists.
 */
export async function addToCartService(uid: string, product: Product, quantity: number) {
    const items = await getCart(uid);
    const existingItemIndex = items.findIndex(item => item.productId === product.id);

    if (existingItemIndex > -1) {
        items[existingItemIndex].quantity += quantity;
    } else {
        items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            quantity: quantity,
            category: product.category,
            type: product.type
        });
    }

    await saveCart(uid, items);
    return items;
}

/**
 * Updates item quantity in the cart.
 */
export async function updateCartQuantityService(uid: string, productId: string, quantity: number) {
    let items = await getCart(uid);
    items = items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0);

    await saveCart(uid, items);
    return items;
}

/**
 * Removes an item from the cart.
 */
export async function removeFromCartService(uid: string, productId: string) {
    let items = await getCart(uid);
    items = items.filter(item => item.productId !== productId);
    await saveCart(uid, items);
    return items;
}
