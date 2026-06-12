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

export default function AdminFeedbackPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [fetching, setFetching] = useState(true);

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

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-serif">User Feedback & Issues</h1>
                <p className="text-muted-foreground">Manage and resolve user submitted support tickets.</p>
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500">No tickets found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tickets.map(ticket => (
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
