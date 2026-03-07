"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, Loader2, Paintbrush } from "lucide-react";
import { updateFormBanner } from "@/app/actions/forms";
import { toast } from "sonner";

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    formId: string;
    currentBanner: string | null;
    onBannerChange: (url: string | null) => void;
}

export function BannerModal({
    isOpen,
    onClose,
    formId,
    currentBanner,
    onBannerChange,
}: BannerModalProps) {
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !formId) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            try {
                const res = await updateFormBanner(formId, dataUrl);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    onBannerChange(res.data?.banner ?? null);
                    toast.success("Banner updated!");
                    onClose();
                }
            } catch (err: any) {
                toast.error("Upload failed");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-border/50 bg-background shadow-2xl rounded-2xl">
                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <Paintbrush className="w-4 h-4 text-primary" />
                            <DialogTitle className="text-xl font-bold">Update Form Banner</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Upload a high-quality image to display at the top of your form.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="relative group rounded-2xl overflow-hidden border border-border/50 aspect-[3/1] bg-secondary/10 shadow-inner">
                            {currentBanner ? (
                                <img src={currentBanner} alt="Banner Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <ImageIcon className="w-10 h-10 opacity-20" />
                                    <span className="text-xs opacity-40">No banner selected</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="gap-2 text-xs h-9 bg-white/90 hover:bg-white text-zinc-900 border-none shadow-2xl scale-95 group-hover:scale-100 transition-transform"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Upload className="w-3.5 h-3.5" />
                                    )}
                                    {uploading ? "Uploading..." : "Click to Upload"}
                                </Button>
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleBannerUpload}
                        />

                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                <strong className="text-foreground/80">Design Tip:</strong> Banners look best at a 3:1 aspect ratio (e.g., 1200x400px). This image will span the full width of the form canvas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-secondary/20 border-t border-border/50 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-9">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
