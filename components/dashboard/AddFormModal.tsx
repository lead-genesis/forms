"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { sansFont } from "@/lib/design-system";
import { TagIcon, DocumentTextIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getBrands } from "@/app/actions/brands";
import { createForm } from "@/app/actions/forms";
import { toast } from "sonner";

interface Brand {
    id: string;
    name: string;
    logo_url?: string | null;
    banner_url?: string | null;
    verticals?: string[];
}

interface AddFormModalProps {
    trigger: React.ReactNode;
    onCreated?: () => void;
}

type Step = "brand" | "name";

export function AddFormModal({ trigger, onCreated }: AddFormModalProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("brand");
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [formName, setFormName] = useState("New Lead Form");
    const [isCreating, setIsCreating] = useState(false);

    // Fetch brands when modal opens
    useEffect(() => {
        if (open) {
            setLoadingBrands(true);
            getBrands().then(({ data }) => {
                setBrands(data as Brand[]);
                setLoadingBrands(false);
            });
        }
    }, [open]);

    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        if (!val) {
            // Reset on close
            setStep("brand");
            setSelectedBrand(null);
            setFormName("New Lead Form");
        }
    };

    const handleCreate = async () => {
        if (!selectedBrand) return;
        setIsCreating(true);
        try {
            const { data, error } = await createForm({
                name: formName.trim() || "New Lead Form",
                brand_id: selectedBrand.id,
            });
            if (error || !data) {
                toast.error(error ?? "Failed to create form");
                return;
            }
            // Open builder in a new tab
            window.open(`/builder?formId=${data.id}`, "_blank");
            setOpen(false);
            onCreated?.();
            toast.success("Form created!");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-zinc-100 sm:rounded-[24px] rounded-xl gap-0 shadow-2xl shadow-black/10 bg-white">
                {/* A11y */}
                <div className="sr-only">
                    <DialogHeader>
                        <DialogTitle>Add New Form</DialogTitle>
                        <DialogDescription>Create a new lead capture form.</DialogDescription>
                    </DialogHeader>
                </div>

                {/* ── Header ─────────────────────────────── */}
                <div className="px-7 pt-7 pb-5 border-b border-zinc-50">
                    <div className="flex items-center gap-2.5 mb-1">
                        {/* Step indicator */}
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                                step === "brand" ? "bg-zinc-900 text-white" : "bg-emerald-500 text-white"
                            )}>
                                {step === "brand" ? "1" : <CheckIcon className="w-3.5 h-3.5" />}
                            </div>
                            <span className={cn("text-[12px] font-medium transition-colors", step === "brand" ? "text-zinc-700" : "text-zinc-400")}>
                                Select brand
                            </span>
                        </div>
                        <div className="w-8 h-px bg-zinc-100" />
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                                step === "name" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                            )}>
                                2
                            </div>
                            <span className={cn("text-[12px] font-medium transition-colors", step === "name" ? "text-zinc-700" : "text-zinc-400")}>
                                Name form
                            </span>
                        </div>
                    </div>
                    <h2 className={cn("text-xl font-bold tracking-tight text-zinc-900 mt-3", sansFont)}>
                        {step === "brand" ? "Choose a brand" : "Name your form"}
                    </h2>
                    <p className="text-[13px] text-zinc-400 mt-0.5">
                        {step === "brand"
                            ? "Select the brand this form belongs to."
                            : `Creating a form for ${selectedBrand?.name}.`}
                    </p>
                </div>

                {/* ── Body ───────────────────────────────── */}
                <div className="px-7 py-5 min-h-[240px]">
                    <AnimatePresence mode="wait">
                        {step === "brand" ? (
                            <motion.div
                                key="brand"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.2 }}
                            >
                                {loadingBrands ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-[72px] rounded-2xl bg-zinc-50 animate-pulse" />
                                        ))}
                                    </div>
                                ) : brands.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-3">
                                            <TagIcon className="w-5 h-5 text-zinc-300" />
                                        </div>
                                        <p className="text-[13px] text-zinc-400 font-medium">No brands yet</p>
                                        <p className="text-[12px] text-zinc-300 mt-1">Create a brand first from the Brands page.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto overflow-x-visible pr-0.5">
                                        {brands.map((brand) => {
                                            const isSelected = selectedBrand?.id === brand.id;
                                            return (
                                                <button
                                                    key={brand.id}
                                                    type="button"
                                                    onClick={() => setSelectedBrand(brand)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                                                        isSelected
                                                            ? "border-zinc-900 bg-zinc-50 shadow-sm"
                                                            : "border-zinc-100 hover:border-zinc-200 bg-white"
                                                    )}
                                                >
                                                    {/* Logo */}
                                                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {brand.logo_url ? (
                                                            <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <TagIcon className="w-4 h-4 text-zinc-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={cn("text-[13px] font-semibold text-zinc-800 truncate", sansFont)}>
                                                            {brand.name}
                                                        </p>
                                                        {brand.verticals && brand.verticals.length > 0 && (
                                                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                                                {brand.verticals[0]}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center">
                                                            <CheckIcon className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="name"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-4"
                            >
                                {/* Selected brand preview */}
                                {selectedBrand && (
                                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                                        <div className="w-7 h-7 rounded-lg bg-white border border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                                            {selectedBrand.logo_url ? (
                                                <img src={selectedBrand.logo_url} alt={selectedBrand.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <TagIcon className="w-3.5 h-3.5 text-zinc-400" />
                                            )}
                                        </div>
                                        <span className={cn("text-[13px] font-medium text-zinc-700", sansFont)}>{selectedBrand.name}</span>
                                    </div>
                                )}

                                {/* Form name input */}
                                <div>
                                    <label className="text-[11px] font-semibold text-zinc-400 tracking-wide uppercase mb-2 block">
                                        Form Name
                                    </label>
                                    <div className="flex items-center gap-2.5 border border-zinc-200 rounded-xl px-4 py-3 focus-within:border-zinc-400 transition-colors bg-white">
                                        <DocumentTextIcon className="w-4 h-4 text-zinc-300 shrink-0" />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && !isCreating && handleCreate()}
                                            placeholder="e.g. Free Quote Request"
                                            className="flex-1 bg-transparent text-[14px] text-zinc-800 placeholder:text-zinc-300 focus:outline-none font-medium"
                                        />
                                    </div>
                                    <p className="text-[11px] text-zinc-300 mt-2">
                                        You can always rename this later in the builder.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Footer ─────────────────────────────── */}
                <div className="flex items-center justify-between px-7 pb-7">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === "name") {
                                setStep("brand");
                            } else {
                                handleOpenChange(false);
                            }
                        }}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all"
                    >
                        {step === "name" ? "Back" : "Cancel"}
                    </button>

                    {step === "brand" ? (
                        <motion.button
                            type="button"
                            onClick={() => selectedBrand && setStep("name")}
                            disabled={!selectedBrand}
                            whileHover={selectedBrand ? { scale: 1.02 } : {}}
                            whileTap={selectedBrand ? { scale: 0.97 } : {}}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                                selectedBrand
                                    ? "bg-zinc-900 text-white hover:bg-zinc-700 shadow-sm"
                                    : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                            )}
                        >
                            Continue
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </motion.button>
                    ) : (
                        <motion.button
                            type="button"
                            onClick={handleCreate}
                            disabled={isCreating || !formName.trim()}
                            whileHover={!isCreating ? { scale: 1.02 } : {}}
                            whileTap={!isCreating ? { scale: 0.97 } : {}}
                            className="flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                        >
                            {isCreating ? "Creating…" : "Create & Open"}
                            {!isCreating && <ArrowRightIcon className="w-3.5 h-3.5" />}
                        </motion.button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
