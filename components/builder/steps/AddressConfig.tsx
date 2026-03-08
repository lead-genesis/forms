import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AddressConfigProps {
    data: any;
    onUpdate: (data: any) => void;
}

export const AddressConfig = ({ data, onUpdate }: AddressConfigProps) => {
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
};
