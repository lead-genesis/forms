import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrandPage, BrandSection, uploadPageImage } from "@/app/actions/pages";
import { cn } from "@/lib/utils";
import { X, Trash2, Palette, AlignLeft, AlignRight, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

// Modular Configs
import { HeroConfig } from "./configs/HeroConfig";
import { TextConfig } from "./configs/TextConfig";
import { FeaturesConfig } from "./configs/FeaturesConfig";
import { HeaderConfig } from "./configs/HeaderConfig";
import { Form as BrandForm } from "@/app/actions/forms";

interface SectionConfigProps {
    section: BrandSection;
    brandPages?: BrandPage[];
    brandForms?: BrandForm[];
    onChange: (updates: Partial<BrandSection>) => void;
    onDelete: () => void;
    onClose: () => void;
}

export function SectionConfig({ section, brandPages, brandForms, onChange, onDelete, onClose }: SectionConfigProps) {
    const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
    const [localData, setLocalData] = useState(section.data || {});
    const localDataRef = useRef<any>(section.data || {});
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync local data when section changes (e.g. selecting a different section)
    useEffect(() => {
        const data = section.data || {};
        setLocalData(data);
        localDataRef.current = data;
    }, [section.id]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const debouncedOnChange = useCallback((updates: any) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onChange({ data: updates });
        }, 400); // 400ms debounce
    }, [onChange]);

    const handleDataChange = (key: string, value: any) => {
        const newData = { ...localDataRef.current, [key]: value };
        localDataRef.current = newData;
        setLocalData(newData);
        debouncedOnChange(newData);
    };

    const handleFullDataUpdate = (newData: any) => {
        localDataRef.current = newData;
        setLocalData(newData);
        debouncedOnChange(newData);
    };

    const handleBatchDataChange = (updates: Record<string, any>) => {
        const newData = { ...localDataRef.current, ...updates };
        localDataRef.current = newData;
        setLocalData(newData);
        debouncedOnChange(newData);
    };

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            });

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const { url, error } = await uploadPageImage(section.page_id, base64);

                if (error) {
                    toast.error(error);
                } else if (url) {
                    const field = section.type === 'header' ? 'customLogoUrl' : 'imageUrl';
                    handleDataChange(field, url);
                    toast.success("Image uploaded!");
                }
                setIsUploading(false);
            };
            reader.readAsDataURL(compressed);
        } catch {
            toast.error("Failed to compress image");
            setIsUploading(false);
        }
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
                        aria-label="Delete section"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-xl transition-all"
                        aria-label="Close settings panel"
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
                        brandForms={brandForms}
                        onDataChange={handleDataChange}
                        onBatchDataChange={handleBatchDataChange}
                        onFullDataUpdate={handleFullDataUpdate}
                        onFileUpload={handleFileUpload}
                        isUploading={isUploading}
                        fileInputRef={fileInputRef}
                    />
                ) : (
                    <SectionStylingConfig
                        section={section}
                        data={localData}
                        onDataChange={handleDataChange}
                        onFileUpload={handleFileUpload}
                        isUploading={isUploading}
                        fileInputRef={fileInputRef}
                    />
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
    brandForms,
    onDataChange,
    onBatchDataChange,
    onFullDataUpdate,
    onFileUpload,
    isUploading,
    fileInputRef
}: {
    section: BrandSection;
    data: any;
    brandPages?: BrandPage[];
    brandForms?: BrandForm[];
    onDataChange: (key: string, value: any) => void;
    onBatchDataChange: (updates: Record<string, any>) => void;
    onFullDataUpdate: (newData: any) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
    const { type } = section;

    switch (type) {
        case 'hero':
            return (
                <HeroConfig
                    data={data}
                    brandPages={brandPages}
                    brandForms={brandForms}
                    onDataChange={onDataChange}
                    onBatchDataChange={onBatchDataChange}
                    onFileUpload={onFileUpload}
                    isUploading={isUploading}
                    fileInputRef={fileInputRef}
                />
            );
        case 'text':
            return (
                <TextConfig
                    data={data}
                    onDataChange={onDataChange}
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
                    onFileUpload={onFileUpload}
                    isUploading={isUploading}
                    fileInputRef={fileInputRef}
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
        case 'blog_list':
            return (
                <div className="space-y-6">
                    <p className="text-xs text-zinc-500 bg-teal-50 p-4 rounded-xl border border-teal-100">
                        This section automatically displays your published blog posts in a grid layout.
                    </p>
                    <ConfigField label="Heading">
                        <input
                            type="text"
                            value={data?.heading || ""}
                            onChange={(e) => onDataChange('heading', e.target.value)}
                            placeholder="Blog"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                    </ConfigField>
                    <ConfigField label="Description">
                        <textarea
                            value={data?.description || ""}
                            onChange={(e) => onDataChange('description', e.target.value)}
                            placeholder="Insights, stories, and updates from our team."
                            rows={3}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none"
                        />
                    </ConfigField>
                </div>
            );
        case 'blog_content':
            return (
                <div className="space-y-6">
                    <p className="text-xs text-zinc-500 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        This section automatically renders your blog post content. The layout includes the title, date, featured image, body, and author footer.
                    </p>
                </div>
            );
        default:
            return <div className="text-zinc-400 text-xs italic">Configuration for this section type is not yet available.</div>;
    }
}

function SectionStylingConfig({
    section,
    data,
    onDataChange,
    onFileUpload,
    isUploading,
    fileInputRef
}: {
    section: BrandSection;
    data: any;
    onDataChange: (key: string, value: any) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
    const { type } = section;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 mb-2">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Visual Styling</span>
            </div>

            <ConfigField label="Section Background">
                <ColorPicker
                    value={data?.backgroundColor}
                    onChange={(val) => onDataChange('backgroundColor', val)}
                    placeholder="Transparent"
                />
            </ConfigField>

            {(type === 'hero' || type === 'text') && (
                <>
                    <div className="h-px bg-zinc-100 my-2" />

                    <ConfigField label="Section Font Color">
                        <ColorPicker
                            value={data?.fontColor || (type === 'hero' ? '#18181b' : undefined)}
                            onChange={(val) => onDataChange('fontColor', val)}
                            placeholder="#18181b"
                        />
                    </ConfigField>

                    <ConfigField label="Section Image">
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
                    </ConfigField>

                    <ConfigField label="Image Orientation">
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
                                        (data?.orientation || (type === 'hero' ? 'background' : 'left')) === opt.id
                                            ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-200"
                                            : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                                    )}
                                >
                                    <opt.icon className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase tracking-tight">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </ConfigField>
                </>
            )}
        </div>
    );
}

function ColorPicker({ value, onChange, placeholder }: { value?: string; onChange: (val: string) => void; placeholder?: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <div
                    className="w-10 h-10 rounded-xl border border-zinc-100 shadow-inner shrink-0"
                    style={{ backgroundColor: value || 'transparent' }}
                />
                <input
                    type="color"
                    value={value || "#ffffff"}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            <div className="flex-1 flex gap-2">
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Transparent"}
                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                />
                {value && (
                    <button
                        onClick={() => onChange('')}
                        className="px-3 bg-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-200 transition-colors text-[10px] font-bold uppercase"
                    >
                        Clear
                    </button>
                )}
            </div>
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
