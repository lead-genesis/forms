import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InputConfigProps {
    data: any;
    onUpdate: (data: any) => void;
}

export const InputConfig = ({ data, onUpdate }: InputConfigProps) => {
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
};
