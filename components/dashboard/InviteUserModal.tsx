"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { inviteUser } from "@/app/actions/user";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("Member");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !firstName || !lastName) return;

        setIsSubmitting(true);
        try {
            const result = await inviteUser(email, firstName, lastName, role);
            if (result.success) {
                toast.success("Invitation sent successfully!");
                setEmail("");
                setFirstName("");
                setLastName("");
                onSuccess?.();
                onClose();
            } else {
                toast.error(result.error || "Failed to send invitation.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-border/50">
                <DialogHeader className="space-y-3">
                    <DialogTitle className={cn("text-2xl font-bold tracking-tight", sansFont)}>
                        Invite User
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Enter the email address of the person you'd like to invite to your team.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-semibold pl-1">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                placeholder="Jane"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-background transition-all"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-semibold pl-1">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-background transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold pl-1 transition-all">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="jane@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-semibold pl-1">
                            System Role
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role" className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-background transition-all">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="Member">Member</SelectItem>
                                <SelectItem value="Administrator">Administrator</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-full px-6 text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !email || !firstName || !lastName}
                            className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? "Sending..." : "Send invite"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
