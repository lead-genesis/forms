"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/app/actions/user";
import { toast } from "sonner";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                setProfile({
                    first_name: profileData?.first_name || "",
                    last_name: profileData?.last_name || "",
                    email: user.email || "",
                });
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateProfile({
            first_name: profile.first_name,
            last_name: profile.last_name,
        });

        if (result.success) {
            toast.success("Profile updated successfully!");
        } else {
            toast.error(result.error || "Failed to update profile.");
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <DashboardPage className="max-w-4xl">
                <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
            </DashboardPage>
        );
    }

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
                                <Input
                                    value={profile.first_name}
                                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Last name</label>
                                <Input
                                    value={profile.last_name}
                                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                value={profile.email}
                                disabled
                                type="email"
                                className="rounded-xl bg-secondary/30"
                            />
                            <p className="text-[10px] text-muted-foreground pl-1">Email cannot be changed here.</p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-full px-6"
                            >
                                {isSaving ? "Saving..." : "Save changes"}
                            </Button>
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
                                <p className="text-xs text-muted-foreground">Manage your account security</p>
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
