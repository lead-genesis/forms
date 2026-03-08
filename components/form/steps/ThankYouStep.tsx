"use client";

import React from "react";
import { FormStep } from "../FormStepRenderer";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ThankYouStepProps {
    step: FormStep;
}

export function ThankYouStep({ step }: ThankYouStepProps) {
    const { data } = step;

    return (
        <div className="text-center space-y-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
            >
                <Check className="w-7 h-7" strokeWidth={3} />
            </motion.div>
            <h2 className={cn("text-xl @sm:text-2xl font-bold", sansFont)}>{data.message || "Thank You!"}</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">{data.subtext || "Your details have been submitted."}</p>
        </div>
    );
}
