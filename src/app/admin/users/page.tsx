"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { Users, ShieldCheck, ShieldOff, Search } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snap = await getDocs(collection(db, "users"));
                setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as UserProfile[]);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchUsers();
    }, []);

    const toggleBlock = async (uid: string, isBlocked: boolean) => {
        try {
            await updateDoc(doc(db, "users", uid), { isBlocked: !isBlocked });
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBlocked: !isBlocked } : u));
            toast(`User ${!isBlocked ? "blocked" : "unblocked"}`, "success");
        } catch (error) { toast("Failed to update user", "error"); }
    };

    const filtered = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-3xl font-bold">Users ({users.length})</h1>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search users..." className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground"><Users className="h-16 w-16 mx-auto mb-4 opacity-20" /><p>No users found.</p></div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filtered.map((user) => (
                        <Card key={user.uid}>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium truncate">{user.displayName || "No Name"}</p>
                                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-[10px]">{user.role}</Badge>
                                        {user.isBlocked && <Badge variant="destructive" className="text-[10px]">Blocked</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleBlock(user.uid, user.isBlocked)}
                                    className={user.isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}
                                >
                                    {user.isBlocked ? <><ShieldCheck className="h-3 w-3 mr-1" /> Unblock</> : <><ShieldOff className="h-3 w-3 mr-1" /> Block</>}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
