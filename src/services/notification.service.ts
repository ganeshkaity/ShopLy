import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

export type NotificationTag = "Important" | "Update" | "Info" | "Offer" | "Sale";

export interface GlobalNotification {
    id?: string;
    title: string;
    message: string;
    tag: NotificationTag;
    createdAt?: any;
}

const NOTIFICATIONS_COLLECTION = "notifications";

/**
 * Creates a global notification (Admin only)
 */
export async function createNotification(data: Omit<GlobalNotification, "id" | "createdAt">) {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Fetches all global notifications, ordered by creation date descending
 */
export async function getNotifications(): Promise<GlobalNotification[]> {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as GlobalNotification[];
}

/**
 * Deletes a global notification (Admin only)
 */
export async function deleteNotification(id: string) {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
    await deleteDoc(docRef);
}
