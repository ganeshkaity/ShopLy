"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/services/auth.service";
import { UserProfile } from "@/types";

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid: string) => {
        try {
            const profile = await getUserProfile(uid);
            if (profile) {
                if (profile.isBlocked) {
                    // If blocked, we could force sign out or show restricted UI
                    setUser(profile);
                } else {
                    setUser(profile);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await fetchProfile(firebaseUser.uid);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (user) {
            setLoading(true);
            await fetchProfile(user.uid);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
