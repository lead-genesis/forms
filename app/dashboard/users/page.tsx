"use client";

import { useState } from "react";
import { DashboardPage, DashboardHeader, DashboardControls } from "@/components/dashboard/DashboardPage";
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

const users = [
    { id: "1", name: "Alice Thompson", email: "alice@example.com", role: "Admin", status: "Active", lastActive: "2 mins ago" },
    { id: "2", name: "Bob Richards", email: "bob@example.com", role: "Editor", status: "Active", lastActive: "1 hour ago" },
    { id: "3", name: "Charlie Davis", email: "charlie@example.com", role: "Viewer", status: "Inactive", lastActive: "2 days ago" },
    { id: "4", name: "Diana Prince", email: "diana@example.com", role: "Editor", status: "Active", lastActive: "5 mins ago" },
    { id: "5", name: "Edward Norton", email: "edward@example.com", role: "Viewer", status: "Active", lastActive: "12 hours ago" },
];

export default function UsersPage() {
    const [search, setSearch] = useState("");

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardPage>
            <DashboardHeader
                title="Users"
                subtitle="Manage your team members and their account permissions."
            >
                <Button className="rounded-full px-6 shrink-0">
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Invite User
                </Button>
            </DashboardHeader>

            <DashboardControls>
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9 rounded-xl border-border/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </DashboardControls>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>User</th>
                            <th className={tableHeadCell + " px-4"}>Role</th>
                            <th className={tableHeadCell + " px-4"}>Status</th>
                            <th className={tableHeadCell + " px-4 hidden sm:table-cell"}>Last Active</th>
                            <th className={tableHeadCell + " pl-4 pr-4 md:pr-6 lg:pr-10 text-right"}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className={tableRow}>
                                <td className={tableCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-foreground ring-1 ring-border/50 shrink-0">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("font-semibold text-sm truncate", sansFont)}>{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className={tableCell + " px-4"}>
                                    <span className="text-xs font-medium text-foreground/80">{user.role}</span>
                                </td>
                                <td className={tableCell + " px-4"}>
                                    <Badge
                                        variant={user.status === "Active" ? "secondary" : "outline"}
                                        className={cn(
                                            "rounded-full px-2 py-0 text-[10px] uppercase tracking-wider font-bold",
                                            user.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-0" : "text-muted-foreground"
                                        )}
                                    >
                                        {user.status}
                                    </Badge>
                                </td>
                                <td className={tableCellMuted + " px-4 hidden sm:table-cell"}>
                                    {user.lastActive}
                                </td>
                                <td className={tableCell + " pl-4 pr-4 md:pr-6 lg:pr-10 text-right"}>
                                    <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-muted-foreground">
                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardPage>
    );
}
