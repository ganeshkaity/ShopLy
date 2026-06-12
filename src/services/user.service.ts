import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    getDocs,
    deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const USERS_COLLECTION = "users";
const TICKETS_COLLECTION = "support_tickets";
const DELETIONS_COLLECTION = "deletion_requests";

export type AddressLabel = "Home" | "Office" | "Work" | "Other";

export interface Address {
    id: string; // generate unique id client-side
    label: AddressLabel;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    avatarBase64?: string | null;
    phone?: string | null;
    addresses?: Address[];
    createdAt?: any;
    updatedAt?: any;
}

export interface SupportTicket {
    id?: string;
    uid: string;
    email: string | null;
    subject: string;
    message: string;
    status: "open" | "resolved";
    createdAt: any;
}

export interface DeletionRequest {
    id?: string;
    uid: string;
    email: string | null;
    reason: string;
    status: "pending" | "processed";
    createdAt: any;
}

/**
 * Get or create a custom user document in Firestore.
 */
export async function getUserData(uid: string): Promise<UserData | null> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserData;
    }
    return null;
}

/**
 * Update user data including Base64 avatar and phone number.
 */
export async function updateUserData(uid: string, data: Partial<UserData>) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    
    // First check if it exists, if not create it
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        await setDoc(docRef, {
            ...data,
            uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } else {
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    }
}

/**
 * Manage User Addresses (Add/Edit/Delete)
 * Since addresses are small, we can just replace the entire array inside UserData.
 */
export async function saveUserAddresses(uid: string, addresses: Address[]) {
    // Ensure only one default address
    let defaultCount = 0;
    const validatedAddresses = addresses.map(addr => {
        if (addr.isDefault) {
            defaultCount++;
            if (defaultCount > 1) {
                return { ...addr, isDefault: false }; // Only keep first as default if multiple
            }
        }
        return addr;
    });

    if (validatedAddresses.length > 0 && defaultCount === 0) {
        validatedAddresses[0].isDefault = true; // Auto-default first
    }

    await updateUserData(uid, { addresses: validatedAddresses });
}

/**
 * Compress image file to base64 string
 */
export async function compressImageToBase64(file: File, maxWidth = 300, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const base64 = canvas.toDataURL("image/jpeg", quality);
                    resolve(base64);
                } else {
                    reject(new Error("Failed to get canvas context"));
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * Raise a support ticket / issue
 */
export async function createSupportTicket(data: Omit<SupportTicket, "id" | "status" | "createdAt">) {
    const docRef = await addDoc(collection(db, TICKETS_COLLECTION), {
        ...data,
        status: "open",
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Request account deletion
 */
export async function createDeletionRequest(data: Omit<DeletionRequest, "id" | "status" | "createdAt">) {
    const docRef = await addDoc(collection(db, DELETIONS_COLLECTION), {
        ...data,
        status: "pending",
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

// === ADMIN FUNCTIONS ===

export async function getTickets() {
    const q = query(collection(db, TICKETS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
}

export async function resolveTicket(id: string) {
    const docRef = doc(db, TICKETS_COLLECTION, id);
    await updateDoc(docRef, { status: "resolved", updatedAt: serverTimestamp() });
}

export async function getDeletionRequests() {
    const q = query(collection(db, DELETIONS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeletionRequest));
}

export async function resolveDeletionRequest(id: string) {
    const docRef = doc(db, DELETIONS_COLLECTION, id);
    await updateDoc(docRef, { status: "processed", updatedAt: serverTimestamp() });
}

export async function updateUserRole(uid: string, role: "USER" | "ADMIN") {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, { role, updatedAt: serverTimestamp() });
}
