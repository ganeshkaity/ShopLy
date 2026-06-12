import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface TShirtColor {
    id: string;
    name: string;
    hex: string;
    isActive: boolean;
}

export interface TShirtSize {
    id: string;
    label: string; // e.g., "S", "M", "L", "XL", "XXL"
    isActive: boolean;
}

export interface TShirtQuality {
    id: string;
    name: string;       // e.g., "Standard", "Premium", "Super Premium"
    description: string;
    price: number;
    imageUrl?: string;  // Admin-uploaded sample image
    isActive: boolean;
}

export interface TShirtConfig {
    colors: TShirtColor[];
    sizes: TShirtSize[];
    qualities: TShirtQuality[];
    isServiceActive: boolean;
    temporaryStopMessage: string;
    isOrderStopped: boolean;
}

export interface TShirtOrder {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    phone: string;
    designImageBase64: string;
    color: TShirtColor;
    size: TShirtSize;
    quality: TShirtQuality;
    quantity: number;
    totalPrice: number;
    shippingAddress: {
        fullName: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    };
    status: 'Pending' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
}

const CONFIG_DOC_ID = "tshirt_config";
const CONFIG_COLLECTION = "app_config";
const ORDERS_COLLECTION = "tshirt_orders";

const DEFAULT_CONFIG: TShirtConfig = {
    isServiceActive: true,
    isOrderStopped: true,
    temporaryStopMessage: "T-Shirt print orders are temporarily paused. We will be back soon!",
    colors: [
        { id: "white", name: "White", hex: "#FFFFFF", isActive: true },
        { id: "black", name: "Black", hex: "#1a1a1a", isActive: true },
        { id: "navy", name: "Navy Blue", hex: "#1B3A6B", isActive: true },
        { id: "red", name: "Red", hex: "#D72828", isActive: true },
        { id: "forest", name: "Forest Green", hex: "#2D6A4F", isActive: true },
        { id: "maroon", name: "Maroon", hex: "#800000", isActive: true },
        { id: "grey", name: "Light Grey", hex: "#CCCCCC", isActive: true },
        { id: "yellow", name: "Yellow", hex: "#F5C542", isActive: true },
    ],
    sizes: [
        { id: "xs", label: "XS", isActive: true },
        { id: "s", label: "S", isActive: true },
        { id: "m", label: "M", isActive: true },
        { id: "l", label: "L", isActive: true },
        { id: "xl", label: "XL", isActive: true },
        { id: "xxl", label: "XXL", isActive: true },
        { id: "3xl", label: "3XL", isActive: true },
    ],
    qualities: [
        {
            id: "standard",
            name: "Standard",
            description: "180 GSM cotton blend. Great for casual everyday wear.",
            price: 299,
            isActive: true,
        },
        {
            id: "premium",
            name: "Premium",
            description: "220 GSM 100% cotton. Softer feel, better print retention.",
            price: 499,
            isActive: true,
        },
        {
            id: "super_premium",
            name: "Super Premium",
            description: "260 GSM combed cotton. Professional grade, ultra-soft finish.",
            price: 799,
            isActive: true,
        },
    ],
};

export async function getTShirtConfig(): Promise<TShirtConfig> {
    try {
        const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return snap.data() as TShirtConfig;
        }
        // Initialize with defaults if not found
        await setDoc(docRef, DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error("Error fetching T-shirt config:", error);
        return DEFAULT_CONFIG;
    }
}

export async function updateTShirtConfig(config: Partial<TShirtConfig>): Promise<void> {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    await setDoc(docRef, config, { merge: true });
}

export async function createTShirtOrder(order: Omit<TShirtOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(ref, {
        ...order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function getTShirtOrders(): Promise<TShirtOrder[]> {
    const ref = collection(db, ORDERS_COLLECTION);
    const q = query(ref, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TShirtOrder));
}

export async function updateTShirtOrderStatus(orderId: string, status: TShirtOrder['status']): Promise<void> {
    const ref = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
}
