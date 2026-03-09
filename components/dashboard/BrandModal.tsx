"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sansFont } from "@/lib/design-system";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
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

// Shared input style: subtle underline, no harsh focus ring
const inputBase = "w-full bg-transparent focus:ring-0 focus:outline-none transition-colors placeholder:text-zinc-300";
const underlineInput = cn(inputBase, "border-b border-zinc-100 hover:border-zinc-200 focus:border-zinc-300 px-1 py-1.5");

export function BrandModal({ trigger, onCreated }: BrandModalProps) {
    const router = useRouter();
    const [verticals, setVerticals] = useState<string[]>([]);
    const [verticalInput, setVerticalInput] = useState("");
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Support max 5MB as per Server Action limit
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image too large. Max size is 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setter(reader.result as string);
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
            setBannerImage(null);
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
                bannerFile: bannerImage,
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

            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border border-zinc-100 sm:rounded-[24px] rounded-xl gap-0 shadow-2xl shadow-black/10 bg-white">
                <div className="sr-only">
                    <DialogHeader>
                        <DialogTitle>Add New Brand</DialogTitle>
                        <DialogDescription>Create a new brand profile.</DialogDescription>
                    </DialogHeader>
                </div>

                {/* ─── Banner ─────────────────────────────────────── */}
                <div className="relative h-48 w-full bg-zinc-50 overflow-hidden">
                    {bannerImage && (
                        <Image
                            src={bannerImage}
                            alt="Banner Preview"
                            fill
                            className="object-cover"
                        />
                    )}

                    <div className="absolute top-3.5 left-4 z-20">
                        <motion.button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-colors",
                                bannerImage
                                    ? "bg-black/30 text-white backdrop-blur-md hover:bg-black/50 border border-white/10"
                                    : "bg-white/80 text-zinc-600 backdrop-blur-sm border border-zinc-200 shadow-sm hover:bg-white"
                            )}
                        >
                            <PhotoIcon className="w-3.5 h-3.5" />
                            {bannerImage ? "Change banner" : "Upload banner"}
                        </motion.button>
                    </div>

                    <input
                        type="file"
                        ref={bannerInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => handleImageUpload(e, setBannerImage)}
                    />
                </div>

                {/* ─── Content ────────────────────────────────────── */}
                <div className="px-7 pb-7 pt-0 relative z-10">
                    <motion.div
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.08, duration: 0.35, ease: "easeOut" }}
                        className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.04] p-5 -mt-14 w-full"
                    >
                        <div className="flex flex-col sm:flex-row items-start gap-5">
                            {/* ── Logo uploader ─────────────────── */}
                            <div className="relative group shrink-0 mt-1">
                                <motion.button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                        "w-[72px] h-[72px] rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200 bg-white relative",
                                        logoImage
                                            ? "shadow-sm border border-zinc-100"
                                            : "border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100"
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
                                        <PhotoIcon className="w-6 h-6 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                                    )}
                                </motion.button>

                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-zinc-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {logoImage ? "Change logo" : "Logo"}
                                </div>

                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={(e) => handleImageUpload(e, setLogoImage)}
                                />
                            </div>

                            {/* ── Text inputs ───────────────────── */}
                            <div className="flex-1 space-y-3 w-full min-w-0">
                                <input
                                    type="text"
                                    placeholder="Brand name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={cn(
                                        underlineInput,
                                        "text-[22px] font-semibold tracking-tight text-zinc-800 border-b-2 hover:border-b-zinc-200 focus:border-b-zinc-300",
                                        sansFont
                                    )}
                                />

                                <div className="flex flex-wrap items-center gap-1.5 min-h-[34px] border-b border-zinc-100 hover:border-zinc-200 focus-within:border-zinc-300 px-1 py-1 transition-colors">
                                    <AnimatePresence>
                                        {verticals.map((v, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ scale: 0.85, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.85, opacity: 0 }}
                                                transition={{ duration: 0.12 }}
                                                className="flex items-center gap-1 bg-zinc-100 text-zinc-600 text-[12px] font-medium px-2.5 py-0.5 rounded-full"
                                            >
                                                {v}
                                                <button
                                                    type="button"
                                                    onClick={() => removeVertical(i)}
                                                    className="text-zinc-400 hover:text-zinc-700 transition-colors ml-0.5"
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
                                        placeholder={verticals.length === 0 ? "Industry vertical (press Enter)" : "Add another…"}
                                        className="flex-1 min-w-[140px] bg-transparent text-[13px] text-zinc-600 placeholder:text-zinc-300 focus:outline-none focus:ring-0 py-0.5"
                                    />
                                </div>

                                <textarea
                                    placeholder="Short description…"
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-transparent text-[13px] text-zinc-500 placeholder:text-zinc-300 focus:outline-none focus:ring-0 resize-none leading-relaxed px-1 py-1 rounded-lg hover:bg-zinc-50 focus:bg-zinc-50 transition-colors"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* ─── Footer ──────────────────────────────── */}
                    <div className="flex items-center justify-between mt-6 px-1">
                        <p className="text-[11px] text-zinc-300 font-medium tracking-wide">
                            Press <kbd className="font-mono">ESC</kbd> to cancel
                        </p>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
                            >
                                {isLoading ? "Creating…" : "Create Brand"}
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
