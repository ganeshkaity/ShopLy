"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { APP_NAME } from "@/constants";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { signUp } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast("Passwords do not match!", "error");
        }

        setIsLoading(true);

        try {
            await signUp(email, password, name);
            toast("Account created successfully!", "success");
            router.push("/");
        } catch (error: any) {
            console.error(error);
            toast(error.message || "Failed to create account.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-custom flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
            <Card className="w-full max-w-md border-border/50 shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-serif font-bold text-primary">{APP_NAME}</CardTitle>
                    <CardDescription>Create an account to start shopping</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Your Name"
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            helperText="Minimum 6 characters"
                        />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Create Account
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-semibold">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
