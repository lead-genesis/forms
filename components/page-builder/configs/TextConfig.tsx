"use client";

import React from "react";
import { AlignLeft, AlignRight, Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextConfigProps {
    data: any;
    onDataChange: (key: string, value: any) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function TextConfig({ data, onDataChange, onFileUpload, isUploading, fileInputRef }: TextConfigProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Title</label>
                <input
                    type="text"
                    value={data?.title || ""}
                    onChange={(e) => onDataChange('title', e.target.value)}
                    placeholder="Block Title"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Content</label>
                <textarea
                    value={data?.content || ""}
                    onChange={(e) => onDataChange('content', e.target.value)}
                    rows={8}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none"
                />
            </div>

            <div className="h-px bg-zinc-100 my-4" />

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Image</label>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={data?.imageUrl || ""}
                            onChange={(e) => onDataChange('imageUrl', e.target.value)}
                            placeholder="Paste image URL..."
                            className={cn(
                                "flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all",
                                data?.imageUrl && !data.imageUrl.startsWith('http') && !data.imageUrl.startsWith('/') && "border-red-200 bg-red-50/30"
                            )}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileUpload}
                            className="hidden"
                            accept="image/*"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </button>
                    </div>

                    {data?.imageUrl && (
                        <div className="aspect-video w-full rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden relative">
                            <img src={data.imageUrl} alt="preview" className="w-full h-full object-cover" />
                            <button
                                onClick={() => onDataChange('imageUrl', '')}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Layout Orientation</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'left', icon: AlignLeft, label: 'Left' },
                        { id: 'right', icon: AlignRight, label: 'Right' },
                        { id: 'background', icon: ImageIcon, label: 'Back' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => onDataChange('orientation', opt.id)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                                (data?.orientation || 'left') === opt.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-200"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                            )}
                        >
                            <opt.icon className="w-4 h-4" />
                            <span className="text-[9px] font-bold uppercase tracking-tight">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
