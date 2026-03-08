import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ThankYouConfigProps {
    data: any;
    onUpdate: (data: any) => void;
}

export const ThankYouConfig = ({ data, onUpdate }: ThankYouConfigProps) => {
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
};
