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
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

export default function AdminDeletionsPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

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

    const filteredRequests = requests
        .filter(r => {
            if (statusFilter !== "all" && r.status !== statusFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    (r.reason && r.reason.toLowerCase().includes(query)) ||
                    r.email?.toLowerCase().includes(query) ||
                    r.uid.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return sortBy === "newest" ? timeB - timeA : timeA - timeB;
        });

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-serif text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" /> Account Deletion Requests
                </h1>
                <p className="text-muted-foreground">Manage user account deletion requests. Note: Deleting a user requires manual action in the Firebase Console.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Input
                        placeholder="Search by reason, email, or UID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processed">Processed</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500">No requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map(req => (
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
