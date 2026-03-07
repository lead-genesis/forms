import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import {
    EnvelopeIcon as MailIcon,
    CalendarIcon,
    ShieldCheckIcon,
    IdentificationIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/app/actions/user";
import { toast } from "sonner";

interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email?: string;
    role?: string;
    status?: string;
    updated_at?: string;
}

interface UserDetailsSheetProps {
    user: Profile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserDetailsSheet({ user, open, onOpenChange }: UserDetailsSheetProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setIsEditing(false);
        }
    }, [user, open]);

    if (!user) return null;

    const userDisplayName = user.first_name ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : (user.email?.split('@')[0] || "User");
    const userInitials = user.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}` : (user.email?.[0]?.toUpperCase() || "U");

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateUserProfile(user.id, {
                first_name: firstName,
                last_name: lastName
            });

            if (result.success) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                // The page will revalidate and update the user data
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setIsEditing(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
                <div className="flex-1 overflow-y-auto pt-12 px-6">
                    <SheetHeader className="pb-6 border-b border-border/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-foreground ring-2 ring-border shrink-0">
                                {userInitials}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <SheetTitle className={cn("text-2xl font-bold truncate", sansFont)}>{userDisplayName}</SheetTitle>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 mt-1 uppercase text-[10px] font-bold tracking-wider">
                                    {user.status || 'Active'}
                                </Badge>
                            </div>
                        </div>
                        <SheetDescription className="text-left">
                            User account details and system permissions.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-8 space-y-10">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Information</h3>
                            <div className="grid gap-4">
                                {isEditing ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">First Name</label>
                                            <Input
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="First Name"
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">Last Name</label>
                                            <Input
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Last Name"
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <DetailRow icon={<IdentificationIcon className="w-4 h-4" />} label="First Name" value={user.first_name || "Not set"} />
                                        <DetailRow icon={<IdentificationIcon className="w-4 h-4" />} label="Last Name" value={user.last_name || "Not set"} />
                                    </>
                                )}
                                <DetailRow icon={<MailIcon className="w-4 h-4" />} label="Email Address" value={user.email || "No email available"} isEmail />
                                <DetailRow icon={<ShieldCheckIcon className="w-4 h-4" />} label="System Role" value={user.role || "Administrator"} />
                            </div>
                        </div>

                        {/* Activity & Stats */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activity</h3>
                            <div className="grid gap-4">
                                <DetailRow
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                    label="Last Updated"
                                    value={user.updated_at ? format(new Date(user.updated_at), "MMMM d, yyyy 'at' h:mm a") : "Unknown"}
                                />
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="pt-4 pb-12 space-y-4 border-t border-border/50">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Metadata</h3>
                            <div className="grid gap-3 opacity-60">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">User ID</span>
                                    <span className="font-mono">{user.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-sm shrink-0">
                    {!isEditing ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-11 px-4 w-full justify-center font-semibold text-muted-foreground hover:text-foreground"
                            onClick={() => setIsEditing(true)}
                        >
                            <PencilSquareIcon className="w-4 h-4 mr-2" />
                            Edit Team Member
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                className="rounded-xl h-11 flex-1 font-semibold"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                <CheckIcon className="w-4 h-4 mr-2" />
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl h-11 px-6 text-muted-foreground hover:bg-secondary/50"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function DetailRow({ icon, label, value, isEmail }: { icon: React.ReactNode, label: string, value: string, isEmail?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-secondary/50 text-muted-foreground">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
                <p className={cn("text-sm font-semibold truncate", isEmail && "text-primary")}>{value}</p>
            </div>
        </div>
    );
}
