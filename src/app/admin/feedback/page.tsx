"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getTickets, resolveTicket, SupportTicket } from "@/services/user.service";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

export default function AdminFeedbackPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push("/login");
        } else if (isAdmin) {
            fetchTickets();
        }
    }, [user, isAdmin, loading, router]);

    const fetchTickets = async () => {
        try {
            const data = await getTickets();
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
            toast("Failed to load feedback tickets", "error");
        } finally {
            setFetching(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await resolveTicket(id);
            toast("Ticket marked as resolved", "success");
            fetchTickets();
        } catch (error) {
            toast("Failed to resolve ticket", "error");
        }
    };

    if (loading || fetching) return <div className="p-8 flex justify-center"><Spinner /></div>;

    const filteredTickets = tickets
        .filter(t => {
            if (statusFilter !== "all" && t.status !== statusFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    t.subject.toLowerCase().includes(query) ||
                    t.message.toLowerCase().includes(query) ||
                    t.email?.toLowerCase().includes(query) ||
                    t.uid.toLowerCase().includes(query)
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
                <h1 className="text-2xl font-bold font-serif">User Feedback & Issues</h1>
                <p className="text-muted-foreground">Manage and resolve user submitted support tickets.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Input
                        placeholder="Search by subject, email, or message..."
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
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
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

            {filteredTickets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500">No tickets found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTickets.map(ticket => (
                        <Card key={ticket.id} className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={ticket.status === "open" ? "destructive" : "secondary"}>
                                            {ticket.status === "open" ? "Open" : "Resolved"}
                                        </Badge>
                                        <h3 className="font-bold text-lg">{ticket.subject}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{ticket.message}</p>
                                    <div className="text-xs text-gray-400 flex items-center gap-4">
                                        <span>User ID: {ticket.uid}</span>
                                        <span>Email: {ticket.email || "N/A"}</span>
                                        <span>Date: {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : "Unknown"}</span>
                                    </div>
                                </div>
                                {ticket.status === "open" && (
                                    <Button 
                                        onClick={() => handleResolve(ticket.id!)}
                                        className="rounded-xl whitespace-nowrap"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
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
