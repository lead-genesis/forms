"use client";

import React from "react";
import { BrandPage, BrandSection, uploadPageImage } from "@/app/actions/pages";
import { cn } from "@/lib/utils";
import { X, Trash2, Image as ImageIcon, AlignLeft, AlignRight, Layout as LayoutIcon, Upload, Loader2, Star, Shield, Zap, Globe, Heart, Bell, Palette } from "lucide-react";
import { toast } from "sonner";

interface SectionConfigProps {
    section: BrandSection;
    brandPages?: BrandPage[];
    onChange: (updates: Partial<BrandSection>) => void;
    onDelete: () => void;
    onClose: () => void;
}

export function SectionConfig({ section, brandPages, onChange, onDelete, onClose }: SectionConfigProps) {
    const [activeTab, setActiveTab] = React.useState<'content' | 'style'>('content');

    const handleDataChange = (key: string, value: any) => {
        onChange({
            data: {
                ...(section.data || {}),
                [key]: value
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-white">
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
                    <SectionTypeConfig section={section} brandPages={brandPages} onDataChange={handleDataChange} />
                ) : (
                    <SectionStylingConfig data={section.data} onDataChange={handleDataChange} />
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

function SectionTypeConfig({ section, brandPages, onDataChange }: { section: BrandSection; brandPages?: BrandPage[]; onDataChange: (key: string, value: any) => void }) {
    const { type, data } = section;
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
                <div className="space-y-6">
                    <ConfigField label="Heading">
                        <input
                            type="text"
                            value={data?.heading || ""}
                            onChange={(e) => onDataChange('heading', e.target.value)}
                            placeholder="Enter main heading"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                    </ConfigField>
                    <ConfigField label="Subheading">
                        <textarea
                            value={data?.subheading || ""}
                            onChange={(e) => onDataChange('subheading', e.target.value)}
                            placeholder="Enter subheading"
                            rows={3}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none"
                        />
                    </ConfigField>
                    <div className="grid grid-cols-2 gap-4">
                        <ConfigField label="Button Text">
                            <input
                                type="text"
                                value={data?.buttonText || ""}
                                onChange={(e) => onDataChange('buttonText', e.target.value)}
                                placeholder="Get Started"
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            />
                        </ConfigField>
                        <ConfigField label="Button Link">
                            <input
                                type="text"
                                value={data?.buttonLink || ""}
                                onChange={(e) => onDataChange('buttonLink', e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            />
                        </ConfigField>
                    </div>

                    <div className="h-px bg-zinc-100 my-4" />

                    <ConfigField label="Hero Image">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={data?.imageUrl || ""}
                                    onChange={(e) => onDataChange('imageUrl', e.target.value)}
                                    placeholder="Paste image URL..."
                                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
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
                                    <img src={data.imageUrl} alt="Hero preview" className="w-full h-full object-cover" />
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
                                        (data?.orientation || 'background') === opt.id
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

                    <ConfigField label="Font Color">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div
                                    className="w-10 h-10 rounded-xl border border-zinc-100 shadow-inner shrink-0"
                                    style={{ backgroundColor: data?.fontColor || '#18181b' }}
                                />
                                <input
                                    type="color"
                                    value={data?.fontColor || "#18181b"}
                                    onChange={(e) => onDataChange('fontColor', e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={data?.fontColor || "#18181b"}
                                onChange={(e) => onDataChange('fontColor', e.target.value)}
                                placeholder="#000000"
                                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            />
                        </div>
                    </ConfigField>
                </div>
            );
        case 'text':
            return (
                <div className="space-y-6">
                    <ConfigField label="Title">
                        <input
                            type="text"
                            value={data?.title || ""}
                            onChange={(e) => onDataChange('title', e.target.value)}
                            placeholder="Block Title"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                    </ConfigField>
                    <ConfigField label="Content">
                        <textarea
                            value={data?.content || ""}
                            onChange={(e) => onDataChange('content', e.target.value)}
                            rows={8}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none"
                        />
                    </ConfigField>

                    <div className="h-px bg-zinc-100 my-4" />

                    <ConfigField label="Image">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={data?.imageUrl || ""}
                                    onChange={(e) => onDataChange('imageUrl', e.target.value)}
                                    placeholder="Paste image URL..."
                                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
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

                    <ConfigField label="Layout Orientation">
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
                    </ConfigField>
                </div>
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
        case 'features':
            const icons = [
                { id: 'star', icon: Star },
                { id: 'shield', icon: Shield },
                { id: 'zap', icon: Zap },
                { id: 'globe', icon: Globe },
                { id: 'heart', icon: Heart },
                { id: 'bell', icon: Bell },
            ];
            return (
                <div className="space-y-8">
                    <ConfigField label="Section Heading">
                        <input
                            type="text"
                            value={data?.heading || ""}
                            onChange={(e) => onDataChange('heading', e.target.value)}
                            placeholder="Our Features"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                    </ConfigField>

                    <div className="space-y-6">
                        {[0, 1, 2].map((idx) => {
                            const feature = (data?.items || [])[idx] || { title: `Feature ${idx + 1}`, description: '', icon: 'star' };
                            const updateFeature = (updates: any) => {
                                const newItems = [...(data?.items || [])];
                                while (newItems.length <= idx) newItems.push({ title: `Feature ${newItems.length + 1}`, description: '', icon: 'star' });
                                newItems[idx] = { ...newItems[idx], ...updates };
                                onDataChange('items', newItems);
                            };

                            return (
                                <div key={idx} className="p-4 border border-zinc-100 rounded-2xl space-y-4 bg-zinc-50/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Feature {idx + 1}</span>
                                        <div className="flex gap-1">
                                            {icons.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => updateFeature({ icon: item.id })}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-all",
                                                        feature.icon === item.id ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-100"
                                                    )}
                                                >
                                                    <item.icon className="w-3.5 h-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={feature.title}
                                        onChange={(e) => updateFeature({ title: e.target.value })}
                                        placeholder="Feature Title"
                                        className="w-full bg-white border border-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                    />
                                    <textarea
                                        value={feature.description}
                                        onChange={(e) => updateFeature({ description: e.target.value })}
                                        placeholder="Feature Description"
                                        rows={2}
                                        className="w-full bg-white border border-zinc-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        case 'header':
            const selectedPages = data?.navigation || [];
            const togglePage = (pageId: string) => {
                const newNav = selectedPages.includes(pageId)
                    ? selectedPages.filter((id: string) => id !== pageId)
                    : [...selectedPages, pageId];
                onDataChange('navigation', newNav);
            };

            return (
                <div className="space-y-6">
                    <p className="text-xs text-zinc-500 bg-indigo-50 p-4 rounded-xl border border-indigo-100 leading-relaxed">
                        Select which pages should appear in your site navigation. Your brand logo will be automatically included.
                    </p>
                    <ConfigField label="Navigation Links">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {brandPages?.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => togglePage(page.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                        selectedPages.includes(page.id)
                                            ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                                            : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-200"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{page.title}</span>
                                        <span className={cn("text-[9px] uppercase tracking-wider font-semibold opacity-60", selectedPages.includes(page.id) ? "text-zinc-300" : "text-zinc-400")}>
                                            /{page.slug}
                                        </span>
                                    </div>
                                    {selectedPages.includes(page.id) && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                </button>
                            ))}
                            {(!brandPages || brandPages.length === 0) && (
                                <div className="p-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                                    <p className="text-xs text-zinc-400 italic">No other pages found for this brand.</p>
                                </div>
                            )}
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
