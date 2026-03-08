import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WelcomeConfigProps {
    data: any;
    onUpdate: (data: any) => void;
}

export const WelcomeConfig = ({ data, onUpdate }: WelcomeConfigProps) => {
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
};
