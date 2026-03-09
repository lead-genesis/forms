"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sansFont } from "@/lib/design-system";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrand } from "@/app/actions/brands";
import type { CreateBrandInput } from "@/lib/schemas/brands";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BrandModalProps {
    trigger: React.ReactNode;
    onCreated?: () => void;
}

export function BrandModal({ trigger, onCreated }: BrandModalProps) {
    const router = useRouter();
    const [verticals, setVerticals] = useState<string[]>([]);
    const [verticalInput, setVerticalInput] = useState("");
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image too large. Max size is 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setLogoImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleVerticalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = verticalInput.trim();
            if (value && !verticals.includes(value)) {
                setVerticals([...verticals, value]);
                setVerticalInput("");
            }
        } else if (e.key === "Backspace" && !verticalInput && verticals.length > 0) {
            setVerticals(verticals.slice(0, -1));
        }
    };

    const removeVertical = (i: number) => setVerticals(verticals.filter((_, idx) => idx !== i));

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setVerticals([]);
            setVerticalInput("");
            setLogoImage(null);
            setName("");
            setDescription("");
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Brand name is required");
            return;
        }

        setIsLoading(true);
        try {
            const input: CreateBrandInput = {
                name: name.trim(),
                description: description.trim() || undefined,
                verticals,
                logoFile: logoImage,
            };

            const { error } = await createBrand(input);

            if (error) {
                toast.error(error);
            } else {
                toast.success("Brand created!");
                handleOpenChange(false);
                router.refresh();
                onCreated?.();
            }
        } catch (err) {
            console.error("Brand creation error:", err);
            toast.error("Failed to create brand. Please try again.");
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
                        <DialogTitle>Add New Brand</DialogTitle>
                        <DialogDescription>Create a new brand profile.</DialogDescription>
                    </DialogHeader>
                </div>

                {/* Header */}
                <div className="px-6 pt-6 pb-0 border-b border-border/50">
                    <h2 className={cn("text-base font-bold text-foreground mb-4", sansFont)}>New Brand</h2>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-5">
                    {/* Logo + Name row */}
                    <div className="flex items-start gap-4">
                        {/* Logo uploader */}
                        <div className="relative group shrink-0">
                            <motion.button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200 relative border-2",
                                    logoImage
                                        ? "border-border/50 bg-secondary/10"
                                        : "border-dashed border-border hover:border-primary/40 bg-secondary/20 hover:bg-secondary/30"
                                )}
                            >
                                {logoImage ? (
                                    <Image
                                        src={logoImage}
                                        alt="Logo Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <Upload className="w-5 h-5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                                )}
                            </motion.button>

                            {logoImage && (
                                <button
                                    type="button"
                                    onClick={() => setLogoImage(null)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-background border border-border/50 rounded-full flex items-center justify-center shadow-sm text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {logoImage ? "Change" : "Logo"}
                            </span>

                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Name + description */}
                        <div className="flex-1 space-y-3 mt-1">
                            <input
                                type="text"
                                placeholder="Brand name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                className={cn(
                                    "w-full bg-transparent focus:outline-none text-xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/40 border-b border-border/50 hover:border-border focus:border-primary/40 pb-1.5 transition-colors",
                                    sansFont
                                )}
                                autoFocus
                            />
                            <textarea
                                placeholder="Short description…"
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed hover:text-foreground focus:text-foreground transition-colors"
                            />
                        </div>
                    </div>

                    {/* Industry verticals */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">Industry Verticals</label>
                        <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] bg-secondary/20 border border-border/50 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <AnimatePresence>
                                {verticals.map((v, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ scale: 0.85, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.85, opacity: 0 }}
                                        transition={{ duration: 0.12 }}
                                        className="flex items-center gap-1 bg-primary/10 text-primary text-[12px] font-medium px-2.5 py-0.5 rounded-full"
                                    >
                                        {v}
                                        <button
                                            type="button"
                                            onClick={() => removeVertical(i)}
                                            className="text-primary/60 hover:text-primary transition-colors ml-0.5"
                                        >
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                            <input
                                type="text"
                                value={verticalInput}
                                onChange={(e) => setVerticalInput(e.target.value)}
                                onKeyDown={handleVerticalKeyDown}
                                placeholder={verticals.length === 0 ? "e.g. SaaS, Healthcare… (press Enter)" : "Add another…"}
                                className="flex-1 min-w-[140px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none py-0.5"
                            />
                        </div>
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
                            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {isLoading ? "Creating…" : "Create Brand"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
