import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductReview } from "@/types";

const REVIEWS_COLLECTION = "product_reviews";

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
    const q = query(
        collection(db, REVIEWS_COLLECTION),
        where("productId", "==", productId)
    );
    
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
        } as ProductReview;
    });

    // Sort descending by createdAt
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addProductReview(reviewData: Omit<ProductReview, "id" | "createdAt">) {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
        ...reviewData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}
