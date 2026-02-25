import {
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { supabase, POPUPS_BUCKET } from "@/lib/supabase";
import { PromoPopup } from "@/types";

const POPUPS_COLLECTION = "popups";

/**
 * Fetches all popups from Firestore.
 */
export async function getPopups(): Promise<PromoPopup[]> {
    const q = query(collection(db, POPUPS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    })) as PromoPopup[];
}

/**
 * Adds a new popup.
 */
export async function createPopup(data: Omit<PromoPopup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, POPUPS_COLLECTION), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Updates an existing popup.
 */
export async function updatePopup(id: string, data: Partial<PromoPopup>) {
    const docRef = doc(db, POPUPS_COLLECTION, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Deletes a popup.
 */
export async function deletePopup(id: string) {
    const docRef = doc(db, POPUPS_COLLECTION, id);
    await deleteDoc(docRef);
}

/**
 * Uploads a popup image to Supabase Storage.
 */
export async function uploadPopupImage(file: File, path: string): Promise<string> {
    try {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const { data, error } = await supabase.storage
            .from(POPUPS_BUCKET)
            .upload(cleanPath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw new Error(`Upload failed: ${error.message}`);

        const { data: urlData } = supabase.storage
            .from(POPUPS_BUCKET)
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error: any) {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
}
