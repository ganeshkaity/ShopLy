"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { APP_NAME } from "@/constants";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthPage() {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const [isLogin, setIsLogin] = useState(mode !== "signup");
    
    useEffect(() => {
        if (mode === "signup") {
            setIsLogin(false);
        } else if (mode === "login") {
            setIsLogin(true);
        }
    }, [mode]);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, signUp, loginWithGoogle, resetPassword } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleForgotPassword = async () => {
        if (!email) {
            toast("Please enter your email address first.", "error");
            return;
        }
        try {
            await resetPassword(email);
            toast("Password reset email sent! Check your inbox.", "success");
        } catch (error: any) {
            console.error(error);
            toast(error.message || "Failed to send reset email.", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const user = await login(email, password);
                if (!user.emailVerified) {
                    toast("Please verify your email to continue.", "info");
                    router.push("/verification");
                    return;
                }
                toast("Welcome back!", "success");
                router.push("/");
            } else {
                await signUp(email, password, name);
                toast("Account created successfully! Please verify your email.", "success");
                router.push("/verification");
            }
        } catch (error: any) {
            console.error(error);
            toast(error.message || `Failed to ${isLogin ? "log in" : "create account"}.`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            toast("Successfully logged in with Google!", "success");
            router.push("/");
        } catch (error: any) {
            console.error(error);
            toast(error.message || "Failed to log in with Google.", "error");
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
            
            {/* Top Toggle Switch */}
            <div className="relative flex w-64 bg-gray-200/50 p-1.5 rounded-full shadow-inner mb-8">
                <div 
                    className={cn(
                        "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-primary shadow-sm transition-all duration-300 ease-spring",
                        isLogin ? "left-1.5" : "left-[calc(50%+1.5px)]"
                    )} 
                />
                <button 
                    type="button"
                    onClick={() => setIsLogin(true)} 
                    className={cn(
                        "relative flex-1 py-2.5 text-sm font-bold z-10 transition-colors duration-300 rounded-full",
                        isLogin ? "text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                >
                    Log In
                </button>
                <button 
                    type="button"
                    onClick={() => setIsLogin(false)} 
                    className={cn(
                        "relative flex-1 py-2.5 text-sm font-bold z-10 transition-colors duration-300 rounded-full",
                        !isLogin ? "text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                >
                    Sign Up
                </button>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isLogin ? `Log in to ${APP_NAME} to continue.` : `Join ${APP_NAME} today.`}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative overflow-visible">
                            <div className={cn(
                                "transition-all duration-500 ease-in-out transform origin-top",
                                isLogin ? "max-h-0 opacity-0 -translate-y-4 scale-y-95 pointer-events-none mb-0" : "max-h-24 opacity-100 translate-y-0 scale-y-100 mb-4"
                            )}>
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    icon={<User className="h-4 w-4" />}
                                    required={!isLogin}
                                />
                            </div>
                            
                            <div className={cn(
                                "space-y-4 transition-transform duration-500 ease-in-out",
                                isLogin ? "-translate-y-2" : "translate-y-0"
                            )}>
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={<Mail className="h-4 w-4" />}
                                    required
                                />
                                
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={isLogin ? "Password" : "Password (Min. 6 chars)"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        icon={<Lock className="h-4 w-4" />}
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={cn(
                            "flex justify-end pt-1 transition-all duration-500 ease-in-out overflow-hidden",
                            isLogin ? "max-h-8 opacity-100" : "max-h-0 opacity-0"
                        )}>
                            <button 
                                type="button" 
                                onClick={handleForgotPassword}
                                className="text-xs font-semibold text-primary hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <div className={cn(
                            "transition-transform duration-500 ease-in-out",
                            isLogin ? "-translate-y-2" : "translate-y-0 mt-6"
                        )}>
                            <Button type="submit" className="w-full py-6 text-base rounded-xl" isLoading={isLoading}>
                                {isLogin ? "Log In" : "Sign Up"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-semibold">
                            <span className="bg-white px-3 text-gray-400">OR CONTINUE WITH</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
