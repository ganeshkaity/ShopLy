import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";

const ORDERS_COLLECTION = "orders";

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...orderData,
        statusHistory: [{
            status: 'Order Placed',
            timestamp: new Date().toISOString()
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getOrdersByUser(uid: string): Promise<Order[]> {
    const q = query(
        collection(db, ORDERS_COLLECTION),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
        updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || d.data().updatedAt,
    })) as Order[];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as Order;
}

export async function getAllOrders(): Promise<Order[]> {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
        updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || d.data().updatedAt,
    })) as Order[];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
        status,
        statusHistory: arrayUnion({
            status,
            timestamp: new Date().toISOString()
        }),
        updatedAt: serverTimestamp(),
    });
}

export async function getOrderByRazorpayId(razorpayOrderId: string): Promise<Order | null> {
    const q = query(
        collection(db, ORDERS_COLLECTION),
        where("razorpayOrderId", "==", razorpayOrderId),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    const data = d.data();
    return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as Order;
}

export async function updateOrderPaymentInfo(orderId: string, data: Partial<Order>) {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}
