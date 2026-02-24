import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    User as FirebaseUser
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types";

/**
 * Creates a new user in Firebase Auth and a corresponding profile in Firestore.
 */
export async function signUpUser(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const profile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role: 'USER', // Default role
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return profile;
}

/**
 * Logs in a user with email and password.
 */
export async function loginUser(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

/**
 * Logs out the current user.
 */
export async function logoutUser() {
    await signOut(auth);
}

/**
 * Fetches the user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as UserProfile;
    }

    return null;
}

/**
 * Updates the user profile in Firestore.
 */
export async function updateLocalProfile(uid: string, data: Partial<UserProfile>) {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}
