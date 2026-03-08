import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { FormStep } from "@/lib/builder";

interface MultiChoiceConfigProps {
    data: any;
    allSteps: FormStep[];
    stepId: string;
    onUpdate: (data: any) => void;
}

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

function normaliseOptions(raw: any[]): { label: string; nextStepId: string | null }[] {
    return (raw ?? []).map(o =>
        typeof o === "string" ? { label: o, nextStepId: null } : o
    );
}

export const MultiChoiceConfig = ({ data, allSteps, stepId, onUpdate }: MultiChoiceConfigProps) => {
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

                            <StepPicker
                                value={opt.nextStepId}
                                allSteps={allSteps}
                                currentStepId={stepId}
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
};
