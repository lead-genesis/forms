"use client";

import React from "react";

export function TextConfig({ data, onDataChange }: {
    data: any;
    onDataChange: (key: string, value: any) => void;
}) {
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
        </div>
    );
}
