"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { createVertical } from "@/app/actions/verticals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AddVerticalModalProps {
    trigger: React.ReactNode;
    onCreated?: () => void;
}

export function AddVerticalModal({ trigger, onCreated }: AddVerticalModalProps) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setName("");
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Vertical name is required");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await createVertical({
                name: name.trim(),
            });

            if (error) {
                toast.error(error);
            } else {
                toast.success("Vertical created!");
                handleOpenChange(false);
                router.refresh();
                onCreated?.();
            }
        } catch (err) {
            console.error("Vertical creation error:", err);
            toast.error("Failed to create vertical. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-border sm:rounded-2xl rounded-xl gap-0 shadow-xl bg-background">
                <div className="sr-only">
                    <DialogHeader>
                        <DialogTitle>Add New Vertical</DialogTitle>
                        <DialogDescription>Create a new industry vertical.</DialogDescription>
                    </DialogHeader>
                </div>

                {/* Header */}
                <div className="px-6 pt-6 pb-0 border-b border-border/50">
                    <h2 className={cn("text-base font-bold text-foreground mb-4", sansFont)}>New Vertical</h2>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-5">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Vertical name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            className={cn(
                                "w-full bg-transparent focus:outline-none text-xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/40 border-b border-border/50 hover:border-border focus:border-primary/40 pb-1.5 transition-colors",
                                sansFont
                            )}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-secondary/10">
                    <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wide">
                        Press <kbd className="font-mono text-[10px] px-1 py-0.5 bg-secondary rounded border border-border/50">ESC</kbd> to cancel
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenChange(false)}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {isLoading ? "Creating…" : "Create Vertical"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
