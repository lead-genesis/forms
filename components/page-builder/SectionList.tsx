"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BrandSection } from "@/app/actions/pages";
import {
    Plus,
    Square,
    CheckCircle2,
    Type,
    Layers,
    FileText,
    Share2
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { createPortal } from "react-dom";

interface SectionListProps {
    sections: BrandSection[];
    currentSectionId: string | null;
    onSectionSelect: (id: string) => void;
    onAddSection: (type: BrandSection['type']) => void;
    onSectionsReorder: (sections: BrandSection[]) => void;
}

const SECTION_TYPES: { type: BrandSection['type']; label: string; icon: any; color: string }[] = [
    { type: "hero", label: "Hero Section", icon: Square, color: "text-blue-500" },
    { type: "features", label: "Features", icon: Layers, color: "text-purple-500" },
    { type: "text", label: "Text Block", icon: Type, color: "text-orange-500" },
    { type: "blog_list", label: "Blog List", icon: Layers, color: "text-teal-500" },
    { type: "blog_content", label: "Blog Content", icon: FileText, color: "text-emerald-500" },
    { type: "form_embed", label: "Embed Form", icon: Share2, color: "text-red-500" },
];

const SECTION_TYPE_META: Record<string, { icon: any; color: string }> = {
    "hero": { icon: Square, color: "text-blue-500" },
    "features": { icon: Layers, color: "text-purple-500" },
    "text": { icon: Type, color: "text-orange-500" },
    "blog_list": { icon: Layers, color: "text-teal-500" },
    "blog_content": { icon: FileText, color: "text-emerald-500" },
    "form_embed": { icon: Share2, color: "text-red-500" },
};

function AddSectionMenu({
    sectionTypes,
    onAddSection,
    anchorRect,
}: {
    sectionTypes: typeof SECTION_TYPES;
    onAddSection: (type: BrandSection['type']) => void;
    anchorRect: DOMRect | null;
}) {
    if (!anchorRect || typeof document === "undefined") return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
                position: "fixed",
                bottom: window.innerHeight - anchorRect.top + 12,
                left: anchorRect.left - 80,
                zIndex: 200,
            }}
            className="w-48 bg-background rounded-xl border border-border/60 shadow-xl p-1"
        >
            <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                Add Section
            </p>
            {sectionTypes.map((st) => (
                <button
                    key={st.type}
                    onClick={() => onAddSection(st.type)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
                >
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center", st.color)}>
                        <st.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-foreground/80 text-xs">{st.label}</span>
                </button>
            ))}
        </motion.div>,
        document.body
    );
}

export function SectionList({ sections, currentSectionId, onSectionSelect, onAddSection, onSectionsReorder }: SectionListProps) {
    const [showAddMenu, setShowAddMenu] = React.useState(false);
    const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

    return (
        <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl flex items-stretch h-[60px] overflow-hidden select-none">
            <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto overflow-y-hidden no-scrollbar max-w-[600px]">
                <Reorder.Group
                    axis="x"
                    values={sections}
                    onReorder={onSectionsReorder}
                    className="flex items-center gap-2"
                >
                    {sections.map((section, index) => {
                        const isActive = currentSectionId === section.id;
                        const meta = SECTION_TYPE_META[section.type];
                        const Icon = meta?.icon;
                        return (
                            <Reorder.Item
                                key={section.id}
                                value={section}
                                className="shrink-0"
                            >
                                <button
                                    onClick={() => onSectionSelect(section.id)}
                                    className={cn(
                                        "flex items-center gap-2.5 px-4 h-[44px] rounded-xl text-left transition-all cursor-grab active:cursor-grabbing",
                                        isActive
                                            ? "bg-zinc-900 text-white shadow-lg"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-100"
                                    )}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className={cn(
                                            "text-[9px] font-bold tabular-nums mb-0.5",
                                            isActive ? "text-zinc-400" : "text-zinc-300"
                                        )}>
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="text-[12px] font-semibold leading-tight truncate max-w-[100px]">
                                            {section.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {Icon && (
                                        <Icon className={cn(
                                            "w-3.5 h-3.5",
                                            isActive ? "text-zinc-400" : meta.color + "/70"
                                        )} />
                                    )}
                                </button>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            </div>

            <div className="flex items-center shrink-0 border-l border-zinc-100 px-3 py-2">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            setAnchorRect(e.currentTarget.getBoundingClientRect());
                            setShowAddMenu(!showAddMenu);
                        }}
                        className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                            showAddMenu
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100/50 hover:bg-zinc-100 text-zinc-500"
                        )}
                    >
                        <Plus className={cn("w-5 h-5 transition-transform duration-200", showAddMenu && "rotate-45")} />
                    </button>

                    <AnimatePresence>
                        {showAddMenu && (
                            <>
                                {createPortal(
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[190] bg-black/5"
                                        onClick={() => setShowAddMenu(false)}
                                    />,
                                    document.body
                                )}
                                <AddSectionMenu
                                    sectionTypes={SECTION_TYPES}
                                    anchorRect={anchorRect}
                                    onAddSection={(type) => {
                                        onAddSection(type);
                                        setShowAddMenu(false);
                                    }}
                                />
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
