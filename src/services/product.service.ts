import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    QueryConstraint
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { generateSlug } from "@/lib/utils";

const PRODUCTS_COLLECTION = "products";

/**
 * Fetches products from Firestore with filtering and pagination.
 */
export async function getProducts(options: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    sortBy?: 'newest' | 'priceLowToHigh' | 'priceHighToLow' | 'popular';
    pageLimit?: number;
    lastDoc?: any;
}) {
    const { category, minPrice, maxPrice, searchQuery, sortBy, pageLimit = 12, lastDoc } = options;

    let constraints: QueryConstraint[] = [where("isActive", "==", true)];

    if (category && category !== 'All') {
        constraints.push(where("category", "==", category));
    }

    if (minPrice !== undefined) {
        constraints.push(where("price", ">=", minPrice));
    }

    if (maxPrice !== undefined) {
        constraints.push(where("price", "<=", maxPrice));
    }

    // Sorting
    switch (sortBy) {
        case 'priceLowToHigh':
            constraints.push(orderBy("price", "asc"));
            break;
        case 'priceHighToLow':
            constraints.push(orderBy("price", "desc"));
            break;
        case 'newest':
        default:
            constraints.push(orderBy("createdAt", "desc"));
            break;
    }

    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageLimit));

    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    })) as Product[];

    // Client-side search filter (Firestore doesn't support full-text search directly without indices)
    const filteredProducts = searchQuery
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : products;

    return {
        products: filteredProducts,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
}

/**
 * Fetches a single product by its slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    const q = query(collection(db, PRODUCTS_COLLECTION), where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const docData = querySnapshot.docs[0].data();
    return {
        id: querySnapshot.docs[0].id,
        ...docData,
        createdAt: docData.createdAt?.toDate?.()?.toISOString() || docData.createdAt,
        updatedAt: docData.updatedAt?.toDate?.()?.toISOString() || docData.updatedAt,
    } as Product;
}

/**
 * Fetches a single product by its ID.
 */
export async function getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Product;
    }

    return null;
}

/**
 * Add a new product (Admin).
 */
export async function createProduct(data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) {
    const slug = generateSlug(data.name);
    const productData = {
        ...data,
        slug,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return { id: docRef.id, ...productData };
}

/**
 * Update a product (Admin).
 */
export async function updateProduct(id: string, data: Partial<Product>) {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    // If name changed, update slug
    if (data.name) {
        (updateData as any).slug = generateSlug(data.name);
    }

    await updateDoc(docRef, updateData);
}

/**
 * Delete a product (Admin).
 */
export async function deleteProduct(id: string) {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}

/**
 * Sync stock after order.
 */
export async function updateStock(productId: string, quantity: number) {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const product = await getProductById(productId);
    if (product) {
        await updateDoc(docRef, {
            stock: Math.max(0, product.stock - quantity),
            updatedAt: serverTimestamp(),
        });
    }
}
