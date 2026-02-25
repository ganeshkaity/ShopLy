import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { supabase, POPUPS_BUCKET } from "@/lib/supabase";
import { Category } from "@/types";
import { generateSlug } from "@/lib/utils";

const CATEGORIES_COLLECTION = "categories";
const CATEGORIES_BUCKET = POPUPS_BUCKET; // Reusing the same bucket for images if appropriate, or could specify a new one

/**
 * Fetches all categories from Firestore.
 */
export async function getCategories(onlyActive = false): Promise<Category[]> {
    let q = query(collection(db, CATEGORIES_COLLECTION), orderBy("createdAt", "asc"));

    if (onlyActive) {
        q = query(collection(db, CATEGORIES_COLLECTION), where("isActive", "==", true), orderBy("createdAt", "asc"));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    })) as Category[];
}

/**
 * Adds a new category.
 */
export async function createCategory(data: Omit<Category, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const slug = generateSlug(data.name);
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
        ...data,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Updates an existing category.
 */
export async function updateCategory(id: string, data: Partial<Category>) {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    if (data.name) {
        updateData.slug = generateSlug(data.name);
    }

    await updateDoc(docRef, updateData);
}

/**
 * Deletes a category.
 */
export async function deleteCategory(id: string) {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
}

/**
 * Uploads a category background image to Storage.
 */
export async function uploadCategoryImage(file: File, path: string): Promise<string> {
    try {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const { data, error } = await supabase.storage
            .from(CATEGORIES_BUCKET)
            .upload(cleanPath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw new Error(`Upload failed: ${error.message}`);

        const { data: urlData } = supabase.storage
            .from(CATEGORIES_BUCKET)
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error: any) {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
}
