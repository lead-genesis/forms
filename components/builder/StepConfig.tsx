"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FormStep, StepType } from "@/app/builder/page";
import { sansFont } from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight } from "lucide-react";

interface StepConfigProps {
    step: FormStep;
    allSteps: FormStep[];
    onUpdate: (data: any) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise options — legacy string[] → {label, nextStepId}[] */
function normaliseOptions(raw: any[]): { label: string; nextStepId: string | null }[] {
    return (raw ?? []).map(o =>
        typeof o === "string" ? { label: o, nextStepId: null } : o
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StepPicker({
    value,
    allSteps,
    currentStepId,
    onChange,
    label = "Then go to",
}: {
    value: string | null;
    allSteps: FormStep[];
    currentStepId: string;
    onChange: (id: string | null) => void;
    label?: string;
}) {
    const others = allSteps.filter(s => s.id !== currentStepId);
    return (
        <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            <select
                value={value ?? ""}
                onChange={e => onChange(e.target.value || null)}
                className="flex-1 text-[12px] text-muted-foreground bg-secondary/30 border border-border/40 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            >
                <option value="">{label === "Then go to" ? "Next step (default)" : "Next step"}</option>
                {others.map((s, i) => (
                    <option key={s.id} value={s.id}>
                        Step {allSteps.findIndex(x => x.id === s.id) + 1} — {s.title}
                    </option>
                ))}
            </select>
        </div>
    );
}

function LogicSection({
    step,
    allSteps,
    onUpdate,
}: {
    step: FormStep;
    allSteps: FormStep[];
    onUpdate: (data: any) => void;
}) {
    const isTerminal = step.type === "thank-you";
    if (isTerminal) return null;

    const nextStepId = step.data?.logic?.nextStepId ?? null;

    return (
        <div className="space-y-3 pt-4 border-t border-border/60">
            <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3" />
                Logic
            </Label>
            <StepPicker
                value={nextStepId}
                allSteps={allSteps}
                currentStepId={step.id}
                onChange={id => onUpdate({ logic: { ...(step.data?.logic ?? {}), nextStepId: id } })}
                label="Then go to"
            />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepConfig({ step, allSteps, onUpdate }: StepConfigProps) {
    const { type, data } = step;

    const renderFields = () => {
        switch (type) {
            case "welcome":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Heading</Label>
                            <Input
                                value={data.heading || ""}
                                onChange={(e) => onUpdate({ heading: e.target.value })}
                                placeholder="Welcome to our form"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subheading</Label>
                            <Textarea
                                value={data.subheading || ""}
                                onChange={(e) => onUpdate({ subheading: e.target.value })}
                                placeholder="A brief description..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Button Text</Label>
                            <Input
                                value={data.buttonText || ""}
                                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                                placeholder="Get Started"
                            />
                        </div>
                    </div>
                );

            case "contact":
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Heading</Label>
                                <Input
                                    value={data.heading ?? "Contact Details"}
                                    onChange={(e) => onUpdate({ heading: e.target.value })}
                                    placeholder="e.g. Where should we send it?"
                                />
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.showSpinner ?? false}
                                    onChange={(e) => onUpdate({ showSpinner: e.target.checked })}
                                    className="w-4 h-4 rounded text-primary"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold">Show loading spinner?</span>
                                    <span className="text-[10px] text-muted-foreground">Animates a brief check above the title</span>
                                </div>
                            </label>

                            <div className="space-y-2">
                                <Label>Fields to include</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["first_name", "last_name", "email", "phone"].map((field) => (
                                        <label key={field} className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={(data.fields || []).includes(field)}
                                                onChange={(e) => {
                                                    const current = data.fields || [];
                                                    const updated = e.target.checked
                                                        ? [...current, field]
                                                        : current.filter((f: string) => f !== field);
                                                    onUpdate({ fields: updated });
                                                }}
                                                className="w-3 h-3 rounded"
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">{field.replace("_", " ")}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border/50">
                                <Label>Opt-in / Disclaimer Text</Label>
                                <Textarea
                                    value={data.optInText ?? ""}
                                    onChange={(e) => onUpdate({ optInText: e.target.value })}
                                    placeholder="By submitting, you opt in for a rep to contact you..."
                                    className="text-xs h-20"
                                />
                            </div>
                        </div>
                    </div>
                );

            case "multi-choice": {
                const options = normaliseOptions(data.options ?? ["Option 1", "Option 2"]);

                const setOptions = (updated: typeof options) => onUpdate({ options: updated });

                const updateLabel = (i: number, label: string) => {
                    const next = [...options];
                    next[i] = { ...next[i], label };
                    setOptions(next);
                };

                const updateRoute = (i: number, nextStepId: string | null) => {
                    const next = [...options];
                    next[i] = { ...next[i], nextStepId };
                    setOptions(next);
                };

                const addOption = () => {
                    setOptions([...options, { label: `Option ${options.length + 1}`, nextStepId: null }]);
                };

                const removeOption = (i: number) => {
                    setOptions(options.filter((_, idx) => idx !== i));
                };

                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Question</Label>
                            <Input
                                value={data.question || ""}
                                onChange={(e) => onUpdate({ question: e.target.value })}
                                placeholder="What choice?"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Options & Routing</Label>
                            <div className="space-y-2">
                                {options.map((opt, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-border/50 bg-secondary/10 p-3 space-y-2"
                                    >
                                        {/* Option label + delete */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full border-2 border-border/50 shrink-0 flex items-center justify-center">
                                                <span className="text-[9px] font-bold text-muted-foreground/60">{i + 1}</span>
                                            </div>
                                            <input
                                                value={opt.label}
                                                onChange={(e) => updateLabel(i, e.target.value)}
                                                className="flex-1 h-7 text-xs bg-transparent border-0 border-b border-transparent focus:border-foreground outline-none px-1 font-medium transition-colors placeholder:text-muted-foreground/40"
                                                placeholder={`Option ${i + 1}`}
                                            />
                                            {options.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(i)}
                                                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Step picker */}
                                        <StepPicker
                                            value={opt.nextStepId}
                                            allSteps={allSteps}
                                            currentStepId={step.id}
                                            onChange={(id) => updateRoute(i, id)}
                                            label="Goes to"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addOption}
                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border/50 text-[12px] text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/20 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add option
                            </button>
                        </div>
                    </div>
                );
            }

            case "input":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input
                                value={data.label || ""}
                                onChange={(e) => onUpdate({ label: e.target.value })}
                                placeholder="Enter your answer..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Placeholder</Label>
                            <Input
                                value={data.placeholder || ""}
                                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                                placeholder="e.g. Type something..."
                            />
                        </div>
                    </div>
                );

            case "address":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input
                                value={data.label || ""}
                                onChange={(e) => onUpdate({ label: e.target.value })}
                                placeholder="Where are you located?"
                            />
                        </div>
                        <div className="p-3 bg-secondary/10 rounded-lg border border-border/50">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold text-center">Standard Address Search Enabled</p>
                        </div>
                    </div>
                );

            case "thank-you":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Input
                                value={data.message || ""}
                                onChange={(e) => onUpdate({ message: e.target.value })}
                                placeholder="Thank You!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtext</Label>
                            <Textarea
                                value={data.subtext || ""}
                                onChange={(e) => onUpdate({ subtext: e.target.value })}
                                placeholder="Confirmation message..."
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="p-4 bg-secondary/10 rounded-lg text-xs text-muted-foreground italic border border-border/50 text-center uppercase tracking-widest font-bold opacity-60">
                        {(type as any).replace("-", " ")} settings coming soon
                    </div>
                );
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h3 className={cn("text-lg font-bold mb-1", sansFont)}>Step Settings</h3>
                <p className="text-xs text-muted-foreground">Configure how this step looks and behaves.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Step Title</Label>
                    <Input
                        value={step.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        className="font-medium"
                    />
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-4">
                    <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Content</Label>
                    {renderFields()}
                </div>

                {/* Logic section — shown for all non-terminal, non-multi-choice steps */}
                {type !== "multi-choice" && (
                    <LogicSection step={step} allSteps={allSteps} onUpdate={onUpdate} />
                )}
            </div>
        </div>
    );
}
