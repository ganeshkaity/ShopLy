"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getDeletionRequests, resolveDeletionRequest, DeletionRequest } from "@/services/user.service";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminDeletionsPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push("/login");
        } else if (isAdmin) {
            fetchRequests();
        }
    }, [user, isAdmin, loading, router]);

    const fetchRequests = async () => {
        try {
            const data = await getDeletionRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            toast("Failed to load deletion requests", "error");
        } finally {
            setFetching(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await resolveDeletionRequest(id);
            toast("Request marked as processed. Ensure you actually deleted the user in Firebase Auth console.", "success");
            fetchRequests();
        } catch (error) {
            toast("Failed to update request", "error");
        }
    };

    if (loading || fetching) return <div className="p-8 flex justify-center"><Spinner /></div>;

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-serif text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" /> Account Deletion Requests
                </h1>
                <p className="text-muted-foreground">Manage user account deletion requests. Note: Deleting a user requires manual action in the Firebase Console.</p>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500">No pending deletion requests.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map(req => (
                        <Card key={req.id} className="border-none shadow-sm overflow-hidden border border-red-100">
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={req.status === "pending" ? "destructive" : "secondary"}>
                                            {req.status === "pending" ? "Pending" : "Processed"}
                                        </Badge>
                                        <h3 className="font-bold text-lg">Deletion Request</h3>
                                    </div>
                                    <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-100">
                                        <strong>Reason:</strong> {req.reason || "No reason provided"}
                                    </p>
                                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-4">
                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">UID: {req.uid}</span>
                                        <span>Email: {req.email || "N/A"}</span>
                                        <span>Date: {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : "Unknown"}</span>
                                    </div>
                                </div>
                                {req.status === "pending" && (
                                    <Button 
                                        variant="outline"
                                        onClick={() => handleResolve(req.id!)}
                                        className="rounded-xl whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Processed
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
