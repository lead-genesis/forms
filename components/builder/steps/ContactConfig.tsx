import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactConfigProps {
    data: any;
    onUpdate: (data: any) => void;
}

export const ContactConfig = ({ data, onUpdate }: ContactConfigProps) => {
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
};
