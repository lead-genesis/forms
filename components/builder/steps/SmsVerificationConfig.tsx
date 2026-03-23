import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code } from "lucide-react";

interface SmsVerificationConfigProps {
    data: any;
    onUpdate: (data: any) => void;
}

export const SmsVerificationConfig = ({ data, onUpdate }: SmsVerificationConfigProps) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    <Code className="w-3 h-3 text-primary" />
                    <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Conversion Code</Label>
                </div>
                <Textarea
                    value={data.conversion_code || ""}
                    onChange={(e) => onUpdate({ conversion_code: e.target.value })}
                    placeholder={"<!-- Fires on SMS verification -->\n<script>\n  fbq('track', 'CompleteRegistration');\n</script>"}
                    className="min-h-[120px] resize-none font-mono text-xs"
                    spellCheck={false}
                />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Conversion scripts that fire when this step is reached. Use for ad platform event tracking (Meta Pixel, Google Ads, TikTok, etc).
                </p>
            </div>
        </div>
    );
};
