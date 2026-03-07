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
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            const result = await inviteUser(email);
            if (result.success) {
                toast.success("Invitation sent successfully!");
                setEmail("");
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
                            autoFocus
                        />
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
                            disabled={isSubmitting || !email}
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
