"use client";

import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    UserCircleIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
    return (
        <DashboardPage className="max-w-4xl">
            <DashboardHeader
                title="Settings"
                subtitle="Manage your account preferences and security settings."
            />

            <div className="px-4 md:px-6 lg:px-10 space-y-6">
                {/* Profile */}
                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className={cn("text-base flex items-center gap-2", sansFont)}>
                            <UserCircleIcon className="w-5 h-5" /> Profile
                        </CardTitle>
                        <CardDescription>Your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">First name</label>
                                <Input defaultValue="Dylan" className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Last name</label>
                                <Input defaultValue="J." className="rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Email</label>
                            <Input defaultValue="dylan@example.com" type="email" className="rounded-xl" />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button className="rounded-full px-6">Save changes</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className={cn("text-base flex items-center gap-2", sansFont)}>
                            <ShieldCheckIcon className="w-5 h-5" /> Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Password</p>
                                <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                            </div>
                            <Button variant="outline" className="text-sm rounded-full px-5">Change</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/20 bg-destructive/5 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-destructive">Delete account</p>
                            <p className="text-xs text-muted-foreground">Once deleted, your data cannot be recovered.</p>
                        </div>
                        <Button variant="destructive" className="text-sm rounded-full px-5">Delete</Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
}
