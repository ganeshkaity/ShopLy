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

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast("Successfully logged in!", "success");
            router.push("/");
        } catch (error: any) {
            console.error(error);
            toast(error.message || "Failed to log in. Please check your credentials.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-custom flex h-[calc(100vh-64px)] items-center justify-center">
            <Card className="w-full max-w-md border-border/50 shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-serif font-bold text-primary">{APP_NAME}</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
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
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Login
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary hover:underline font-semibold">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
