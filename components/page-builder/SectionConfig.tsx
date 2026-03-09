import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrandPage, BrandSection, uploadPageImage } from "@/app/actions/pages";
import { cn } from "@/lib/utils";
import { X, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";

// Modular Configs
import { HeroConfig } from "./configs/HeroConfig";
import { TextConfig } from "./configs/TextConfig";
import { FeaturesConfig } from "./configs/FeaturesConfig";
import { HeaderConfig } from "./configs/HeaderConfig";

interface SectionConfigProps {
    section: BrandSection;
    brandPages?: BrandPage[];
    onChange: (updates: Partial<BrandSection>) => void;
    onDelete: () => void;
    onClose: () => void;
}

export function SectionConfig({ section, brandPages, onChange, onDelete, onClose }: SectionConfigProps) {
    const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
    const [localData, setLocalData] = useState(section.data || {});
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync local data when section changes (e.g. selecting a different section)
    useEffect(() => {
        setLocalData(section.data || {});
    }, [section.id]);

    const debouncedOnChange = useCallback((updates: any) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onChange({ data: updates });
        }, 400); // 400ms debounce
    }, [onChange]);

    const handleDataChange = (key: string, value: any) => {
        const newData = { ...localData, [key]: value };
        setLocalData(newData);
        debouncedOnChange(newData);
    };

    const handleFullDataUpdate = (newData: any) => {
        setLocalData(newData);
        debouncedOnChange(newData);
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Section Settings</span>
                    <h2 className="text-sm font-bold text-zinc-900 capitalize">{section.type.replace('_', ' ')}</h2>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                        title="Delete Section"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="px-6 py-2 border-b border-zinc-100 flex items-center gap-6 shrink-0 bg-zinc-50/50">
                <button
                    onClick={() => setActiveTab('content')}
                    className={cn(
                        "pb-2 pt-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                        activeTab === 'content' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    Content
                    {activeTab === 'content' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('style')}
                    className={cn(
                        "pb-2 pt-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                        activeTab === 'style' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    Style
                    {activeTab === 'style' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {activeTab === 'content' ? (
                    <SectionTypeConfig
                        section={section}
                        data={localData}
                        brandPages={brandPages}
                        onDataChange={handleDataChange}
                        onFullDataUpdate={handleFullDataUpdate}
                    />
                ) : (
                    <SectionStylingConfig data={localData} onDataChange={handleDataChange} />
                )}
            </div>

            <div className="p-6 border-t border-zinc-50 bg-zinc-50/30">
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                    Changes are saved automatically as you type.
                </p>
            </div>
        </div>
    );
}

function SectionTypeConfig({
    section,
    data,
    brandPages,
    onDataChange,
    onFullDataUpdate
}: {
    section: BrandSection;
    data: any;
    brandPages?: BrandPage[];
    onDataChange: (key: string, value: any) => void;
    onFullDataUpdate: (newData: any) => void;
}) {
    const { type } = section;
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const { url, error } = await uploadPageImage(section.page_id, base64);

            if (error) {
                toast.error(error);
            } else if (url) {
                onDataChange('imageUrl', url);
                toast.success("Image uploaded!");
            }
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    switch (type) {
        case 'hero':
            return (
                <HeroConfig
                    data={data}
                    onDataChange={onDataChange}
                    onFileUpload={handleFileUpload}
                    isUploading={isUploading}
                    fileInputRef={fileInputRef}
                />
            );
        case 'text':
            return (
                <TextConfig
                    data={data}
                    onDataChange={onDataChange}
                    onFileUpload={handleFileUpload}
                    isUploading={isUploading}
                    fileInputRef={fileInputRef}
                />
            );
        case 'features':
            return (
                <FeaturesConfig
                    data={data}
                    onDataChange={(key, value) => {
                        if (key === 'items') {
                            onFullDataUpdate({ ...data, items: value });
                        } else {
                            onDataChange(key, value);
                        }
                    }}
                />
            );
        case 'header':
            return (
                <HeaderConfig
                    data={data}
                    brandPages={brandPages}
                    onDataChange={onDataChange}
                />
            );
        case 'form_embed':
            return (
                <div className="space-y-6">
                    <p className="text-xs text-zinc-500 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        This section embeds one of your lead forms directly into the page.
                    </p>
                    <ConfigField label="Select Form">
                        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl text-xs text-zinc-400 italic">
                            Form selection UI coming soon...
                        </div>
                    </ConfigField>
                </div>
            );
        default:
            return <div className="text-zinc-400 text-xs italic">Configuration for this section type is not yet available.</div>;
    }
}

function SectionStylingConfig({ data, onDataChange }: { data: any; onDataChange: (key: string, value: any) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Visual Styling</span>
            </div>

            <ConfigField label="Section Background">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="w-10 h-10 rounded-xl border border-zinc-100 shadow-inner shrink-0"
                            style={{ backgroundColor: data?.backgroundColor || 'transparent' }}
                        />
                        <input
                            type="color"
                            value={data?.backgroundColor || "#ffffff"}
                            onChange={(e) => onDataChange('backgroundColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={data?.backgroundColor || ""}
                            onChange={(e) => onDataChange('backgroundColor', e.target.value)}
                            placeholder="Transparent"
                            className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                        {data?.backgroundColor && (
                            <button
                                onClick={() => onDataChange('backgroundColor', '')}
                                className="px-3 bg-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-200 transition-colors text-[10px] font-bold uppercase"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </ConfigField>
        </div>
    );
}

function ConfigField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 ml-1">{label}</label>
            {children}
        </div>
    );
}
