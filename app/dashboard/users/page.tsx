"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import {
    sansFont,
    tableBase,
    tableHead,
    tableHeadCell,
    tableRow,
    tableCell,
    tableCellMuted
} from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    MagnifyingGlassIcon,
    UserPlusIcon,
    EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { inviteUser, getTeamMembers, resendInvite } from "@/app/actions/user";
import { InviteUserModal } from "@/components/dashboard/InviteUserModal";
import { UserDetailsSheet } from "@/components/dashboard/UserDetailsSheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email?: string; // This would come from auth.users normally, or we could duplicate it in profiles
    role?: string;
    status?: string;
}

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isResending, setIsResending] = useState<string | null>(null);

    const supabase = createClient();

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await getTeamMembers();

        if (error) {
            console.error("Error fetching users:", error);
            toast.error(error || "Failed to fetch team members");
            setUsers([]);
        } else {
            setUsers(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleResendInvite = async (e: React.MouseEvent, email: string) => {
        e.stopPropagation();
        if (!email) return;

        setIsResending(email);
        try {
            const result = await resendInvite(email);
            if (result.success) {
                toast.success("Invitation resent successfully!");
            } else {
                toast.error(result.error || "Failed to resend invitation.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsResending(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    return (
        <DashboardPage>
        <div className="flex flex-col gap-4 w-full max-w-[70%] mx-auto">
            {/* Local header */}
            <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-semibold tracking-tight", sansFont)}>Users</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search by name..."
                            className="pl-8 h-9 w-36 sm:w-48 rounded-full text-sm border-border/50 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        className="rounded-full px-6 gap-2 shrink-0"
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        <UserPlusIcon className="w-4 h-4" />
                        Invite User
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell}>User</th>
                            <th className={tableHeadCell + " px-4"}>Role</th>
                            <th className={tableHeadCell + " px-4"}>Status</th>
                            <th className={tableHeadCell + " px-4 hidden sm:table-cell text-right"}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="h-16 px-6 bg-secondary/5 border-b border-border/50"></td>
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="h-32 text-center text-muted-foreground text-sm">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className={cn(tableRow, "cursor-pointer transition-colors active:bg-secondary/20")}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsSheetOpen(true);
                                    }}
                                >
                                    <td className={tableCell}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-foreground ring-1 ring-border/50 shrink-0">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={cn("font-semibold text-sm truncate", sansFont)}>
                                                    {user.first_name || user.last_name
                                                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                        : (user.status === 'Invited' ? 'Pending Onboarding' : 'User')}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={tableCell + " px-4"}>
                                        <span className="text-xs font-medium text-foreground/80">{user.role || 'Admin'}</span>
                                    </td>
                                    <td className={tableCell + " px-4"}>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "rounded-full px-2 py-0 text-[10px] uppercase tracking-wider font-bold border-0",
                                                user.status === 'Active'
                                                    ? "bg-emerald-500/10 text-emerald-600"
                                                    : "bg-orange-500/10 text-orange-600"
                                            )}
                                        >
                                            {user.status || 'Active'}
                                        </Badge>
                                    </td>
                                    <td className={tableCell + " text-right"}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-muted-foreground">
                                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-xl p-1.5 min-w-[140px]">
                                                {user.status === 'Invited' && (
                                                    <DropdownMenuItem
                                                        className="rounded-lg cursor-pointer text-sm font-medium focus:bg-primary/5 focus:text-primary transition-colors h-10 px-3"
                                                        onClick={(e) => handleResendInvite(e as any, user.email || '')}
                                                        disabled={isResending === user.email}
                                                    >
                                                        {isResending === user.email ? "Sending..." : "Resend invite"}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="rounded-lg cursor-pointer text-sm font-medium focus:bg-primary/5 transition-colors h-10 px-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(user);
                                                        setIsSheetOpen(true);
                                                    }}
                                                >
                                                    View details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={fetchUsers}
            />

            <UserDetailsSheet
                user={selectedUser}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </DashboardPage>
    );
}
