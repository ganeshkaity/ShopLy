"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { resendVerificationEmail } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { auth } from "@/lib/firebase";

export default function VerificationPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (!loading && user && auth.currentUser?.emailVerified) {
            router.push("/account");
        }
    }, [user, loading, router]);

    const handleResend = async () => {
        setIsResending(true);
        try {
            await resendVerificationEmail();
            toast("Verification email sent! Please check your inbox.", "success");
        } catch (error: any) {
            toast(error.message || "Failed to resend email.", "error");
        } finally {
            setIsResending(false);
        }
    };

    const handleCheckVerification = async () => {
        setIsChecking(true);
        try {
            // Force token refresh to get updated emailVerified status
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    toast("Email verified successfully!", "success");
                    router.push("/account");
                } else {
                    toast("Email not verified yet. Please check your inbox.", "error");
                }
            }
        } catch (error: any) {
            toast("Failed to check verification status.", "error");
        } finally {
            setIsChecking(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-primary/10 p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-primary animate-pulse" />
                </div>
                
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                    Verify your email
                </h1>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                    We've sent a verification email to <br/>
                    <span className="font-bold text-gray-900">{user.email}</span>.<br/>
                    Please check your inbox and click the link to verify your account.
                </p>
                
                <div className="space-y-4">
                    <Button 
                        onClick={handleCheckVerification} 
                        className="w-full h-12 text-lg font-bold flex items-center justify-center gap-2"
                        disabled={isChecking}
                    >
                        {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : "I've verified my email"}
                        {!isChecking && <ArrowRight className="w-5 h-5" />}
                    </Button>
                    
                    <Button 
                        variant="outline"
                        onClick={handleResend} 
                        className="w-full h-12 text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2"
                        disabled={isResending}
                    >
                        {isResending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {isResending ? "Resending..." : "Resend verification email"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
