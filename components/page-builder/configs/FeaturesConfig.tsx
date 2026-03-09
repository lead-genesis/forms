"use client";

import React from "react";
import { Star, Shield, Zap, Globe, Heart, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesConfigProps {
    data: any;
    onDataChange: (key: string, value: any) => void;
}

const icons = [
    { id: 'star', icon: Star },
    { id: 'shield', icon: Shield },
    { id: 'zap', icon: Zap },
    { id: 'globe', icon: Globe },
    { id: 'heart', icon: Heart },
    { id: 'bell', icon: Bell },
];

export function FeaturesConfig({ data, onDataChange }: FeaturesConfigProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Display Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'features', label: 'Features' },
                        { id: 'steps', label: 'Steps' },
                    ].map((type) => (
                        <button
                            key={type.id}
                            onClick={() => onDataChange('type', type.id)}
                            className={cn(
                                "py-2.5 rounded-xl border text-[11px] font-bold transition-all",
                                (data?.type || 'features') === type.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Section Heading</label>
                <input
                    type="text"
                    value={data?.heading || ""}
                    onChange={(e) => onDataChange('heading', e.target.value)}
                    placeholder="Our Features"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                />
            </div>

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
}
