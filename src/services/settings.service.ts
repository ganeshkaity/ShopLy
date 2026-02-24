import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppSettings } from "@/types";

const SETTINGS_COLLECTION = "settings";
const GLOBAL_SETTINGS_ID = "global";

export const DEFAULT_SETTINGS: AppSettings = {
    appName: "ShopLy",
    supportEmail: "support@shoply.com",
    supportPhone: "+91 98765 43210",
    currency: "INR",
    currencySymbol: "₹",
    freeShippingThreshold: 499,
    whatsapp: "+91 98765 43210",
    facebook: "https://facebook.com/shoply",
    instagram: "https://instagram.com/shoply",
    address: "123, Luxury Lane, Mumbai, India",
    heroTitlePrefix: "Beautiful",
    heroTitleHighlight1: "Paper",
    heroTitleHighlight2: "Petals",
    heroTitleSuffix: "for Every Occasion",
    heroSubtitle: "Discover our curated collection of artisanal stationery, unique gift wraps, and handcrafted greeting cards designed to make every moment memorable."
};

/**
 * Fetches global app settings from Firestore.
 */
export async function getSettings(): Promise<AppSettings> {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...DEFAULT_SETTINGS,
            ...data,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as AppSettings;
    }

    return DEFAULT_SETTINGS;
}

/**
 * Updates global app settings in Firestore.
 */
export async function updateSettings(data: Partial<AppSettings>) {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, updateData, { merge: true });
}
