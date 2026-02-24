"use client";

import { useAuth as useAuthContext } from "@/context/AuthContext";
import { loginUser, signUpUser, logoutUser } from "@/services/auth.service";

/**
 * Custom hook to simplify auth actions.
 */
export function useAuth() {
    const context = useAuthContext();

    return {
        ...context,
        login: loginUser,
        signUp: signUpUser,
        logout: logoutUser,
    };
}
