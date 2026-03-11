"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FormStep, StepType } from "@/lib/builder";
import {
    Plus,
    Layout,
    Users,
    Type,
    MessageSquare,
    MapPin,
    CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { createPortal } from "react-dom";

interface StepListProps {
    steps: FormStep[];
    currentStepId: string;
    onStepSelect: (id: string) => void;
    onAddStep: (type: StepType) => void;
    onStepsReorder: (steps: FormStep[]) => void;
}

const STEP_TYPES: { type: StepType; label: string; icon: any; color: string }[] = [
    { type: "welcome", label: "Welcome Page", icon: Layout, color: "text-blue-500" },
    { type: "contact", label: "Contact Details", icon: Users, color: "text-purple-500" },
    { type: "multi-choice", label: "Multi Choice", icon: MessageSquare, color: "text-orange-500" },
    { type: "input", label: "Text Input", icon: Type, color: "text-green-500" },
    { type: "address", label: "Address", icon: MapPin, color: "text-red-500" },
    { type: "thank-you", label: "Thank You", icon: CheckCircle2, color: "text-emerald-500" },
];

const STEP_TYPE_META: Record<string, { icon: any; color: string }> = {
    "welcome": { icon: Layout, color: "text-blue-500" },
    "contact": { icon: Users, color: "text-purple-500" },
    "multi-choice": { icon: MessageSquare, color: "text-orange-500" },
    "input": { icon: Type, color: "text-green-500" },
    "address": { icon: MapPin, color: "text-red-500" },
    "thank-you": { icon: CheckCircle2, color: "text-emerald-500" },
};

function AddStepMenu({
    stepTypes,
    onAddStep,
    anchorRect,
}: {
    stepTypes: typeof STEP_TYPES;
    onAddStep: (type: StepType) => void;
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
                left: Math.max(16, anchorRect.left - 160),
                zIndex: 200,
            }}
            className="w-48 bg-background rounded-xl border border-border/60 shadow-xl p-1"
        >
            <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                Add step
            </p>
            {stepTypes.map((st) => (
                <button
                    key={st.type}
                    onClick={() => onAddStep(st.type)}
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

export function StepList({ steps, currentStepId, onStepSelect, onAddStep, onStepsReorder }: StepListProps) {
    const [showAddMenu, setShowAddMenu] = React.useState(false);
    const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

    return (
        /* Outer shell — flex row, fixed height pill */
        <div className="bg-background/95 backdrop-blur-xl rounded-[12px] border border-border/50 shadow-lg flex items-stretch overflow-hidden">

            {/* Scrollable steps area */}
            <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
                <Reorder.Group
                    axis="x"
                    values={steps}
                    onReorder={onStepsReorder}
                    className="flex items-center gap-2"
                >
                    {steps.map((step, index) => {
                        const isActive = currentStepId === step.id;
                        const meta = STEP_TYPE_META[step.type];
                        const Icon = meta?.icon;
                        return (
                            <Reorder.Item
                                key={step.id}
                                value={step}
                                className="shrink-0"
                            >
                                <button
                                    onClick={() => onStepSelect(step.id)}
                                    className={cn(
                                        "flex flex-col items-start gap-1 px-4 py-2.5 rounded-xl text-left transition-all cursor-grab active:cursor-grabbing min-w-[110px]",
                                        isActive
                                            ? "bg-foreground text-background shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/40"
                                    )}
                                >
                                    {/* Step number + icon row */}
                                    <div className="flex items-center gap-1.5 w-full">
                                        <span className={cn(
                                            "text-[10px] font-bold tabular-nums",
                                            isActive ? "text-background/60" : "text-muted-foreground/50"
                                        )}>
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        {Icon && (
                                            <Icon className={cn(
                                                "w-3 h-3 ml-auto",
                                                isActive ? "text-background/50" : meta.color + "/70"
                                            )} />
                                        )}
                                    </div>
                                    {/* Title */}
                                    <span className="text-[13px] font-semibold leading-tight truncate w-full max-w-[100px]">
                                        {step.title}
                                    </span>
                                </button>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            </div>

            {/* Divider + Add button — always visible, outside the scroll */}
            <div className="flex items-center shrink-0 border-l border-border/40 px-2.5">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            setAnchorRect(e.currentTarget.getBoundingClientRect());
                            setShowAddMenu(!showAddMenu);
                        }}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            showAddMenu
                                ? "bg-foreground text-background"
                                : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Plus className={cn("w-4 h-4 transition-transform duration-200", showAddMenu && "rotate-45")} />
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
                                <AddStepMenu
                                    stepTypes={STEP_TYPES}
                                    anchorRect={anchorRect}
                                    onAddStep={(type) => {
                                        onAddStep(type);
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
