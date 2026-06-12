"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getNotifications, createNotification, deleteNotification, GlobalNotification, NotificationTag } from "@/services/notification.service";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, BellRing, PlusCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const TAG_OPTIONS: { value: NotificationTag, color: string }[] = [
    { value: "Important", color: "bg-red-100 text-red-700 border-red-200" },
    { value: "Update", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "Info", color: "bg-gray-100 text-gray-700 border-gray-200" },
    { value: "Offer", color: "bg-green-100 text-green-700 border-green-200" },
    { value: "Sale", color: "bg-purple-100 text-purple-700 border-purple-200" },
];

export default function AdminNotificationsPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [tagFilter, setTagFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [tag, setTag] = useState<NotificationTag>("Info");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push("/login");
        } else if (isAdmin) {
            fetchNotifications();
        }
    }, [user, isAdmin, loading, router]);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            toast("Failed to load notifications", "error");
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createNotification({ title, message, tag });
            toast("Notification broadcasted successfully", "success");
            setTitle("");
            setMessage("");
            setTag("Info");
            setIsCreating(false);
            fetchNotifications();
        } catch (error) {
            toast("Failed to create notification", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;
        try {
            await deleteNotification(id);
            toast("Notification deleted", "success");
            fetchNotifications();
        } catch (error) {
            toast("Failed to delete notification", "error");
        }
    };

    if (loading || fetching) return <div className="p-8 flex justify-center"><Spinner /></div>;

    const filteredNotifications = notifications
        .filter(n => {
            if (tagFilter !== "all" && n.tag !== tagFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    n.title.toLowerCase().includes(query) ||
                    n.message.toLowerCase().includes(query)
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
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif flex items-center gap-2">
                        <BellRing className="w-6 h-6 text-primary" /> Global Notifications
                    </h1>
                    <p className="text-muted-foreground">Broadcast messages to all users.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="rounded-xl">
                    <PlusCircle className="w-4 h-4 mr-2" /> 
                    {isCreating ? "Cancel" : "New Notification"}
                </Button>
            </div>

            {isCreating && (
                <Card className="border-primary/20 shadow-lg animate-in slide-in-from-top-4">
                    <CardContent className="p-6">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Create Broadcast</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    label="Title" 
                                    placeholder="e.g. End of Season Sale!" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required 
                                />
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Tag</label>
                                    <select 
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-transparent text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={tag}
                                        onChange={e => setTag(e.target.value as NotificationTag)}
                                    >
                                        {TAG_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.value}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Message</label>
                                <textarea
                                    className="w-full rounded-xl border border-input bg-transparent p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                                    placeholder="Notification details..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8">
                                    {isSubmitting ? "Broadcasting..." : "Broadcast Now"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                    <Input
                        placeholder="Search by title or message..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Tags</option>
                        {TAG_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.value}</option>
                        ))}
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

            <div className="grid grid-cols-1 gap-4">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500">No active notifications.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => {
                        const tagStyle = TAG_OPTIONS.find(t => t.value === notif.tag)?.color || "bg-gray-100";
                        return (
                            <Card key={notif.id} className="border-none shadow-sm overflow-hidden group">
                                <CardContent className="p-5 flex justify-between items-center gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", tagStyle)}>
                                                {notif.tag}
                                            </span>
                                            <h3 className="font-bold">{notif.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : "Just now"}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(notif.id!)}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
