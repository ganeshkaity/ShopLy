import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WishlistItem, Product } from "@/types";

/**
 * Gets the wishlist for a user.
 */
export async function getWishlist(uid: string): Promise<WishlistItem[]> {
    const docRef = doc(db, "wishlists", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().items || [];
    }
    return [];
}

/**
 * Toggles a product in the wishlist.
 */
export async function toggleWishlistService(uid: string, product: Product) {
    let items = await getWishlist(uid);
    const exists = items.some(item => item.productId === product.id);

    if (exists) {
        items = items.filter(item => item.productId !== product.id);
    } else {
        items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            addedAt: new Date().toISOString()
        });
    }

    const docRef = doc(db, "wishlists", uid);
    await setDoc(docRef, { items, updatedAt: new Date().toISOString() });
    return items;
}
