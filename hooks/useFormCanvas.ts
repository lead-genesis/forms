"use client";

import { useState, useCallback, useRef } from "react";
import { FormStep } from "@/components/form/FormStepRenderer";
import { saveLead } from "@/app/actions/leads";

interface UseFormCanvasProps {
    steps: FormStep[];
    mode: "preview" | "live";
    formId?: string;
    onComplete?: () => void;
    activeStepId?: string;
}

export function useFormCanvas({
    steps,
    mode,
    formId,
    onComplete,
    activeStepId
}: UseFormCanvasProps) {
    const [liveStepId, setLiveStepId] = useState<string>(steps[0]?.id ?? "");
    const [history, setHistory] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [verifiedLeadId, setVerifiedLeadId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isSubmittingRef = useRef(false);

    const currentStepId = mode === "preview" ? (activeStepId ?? steps[0]?.id) : (liveStepId || steps[0]?.id);
    const currentStep = steps.find(s => s.id === currentStepId) || steps[0] || null;
    const currentIndex = steps.findIndex(s => s.id === currentStepId);

    const handleAnswer = useCallback((key: string, value: any) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    }, []);

    const resolveNextStep = useCallback((step: FormStep, optionIndex?: number): string | null => {
        if (step.type === "multi-choice" && optionIndex !== undefined) {
            const opts = step.data?.options ?? [];
            const opt = typeof opts[optionIndex] === "object" ? opts[optionIndex] : null;
            if (opt?.nextStepId && steps.some(s => s.id === opt.nextStepId)) {
                return opt.nextStepId;
            }
        }

        const nextId = step.data?.logic?.nextStepId;
        if (nextId && steps.some(s => s.id === nextId)) return nextId;

        const idx = steps.findIndex(s => s.id === step.id);
        return idx < steps.length - 1 ? steps[idx + 1].id : null;
    }, [steps]);

    const goNext = useCallback(async (optionIndex?: number) => {
        if (!currentStep) return;

        const nextId = resolveNextStep(currentStep, optionIndex);
        if (!nextId) return;

        const nextStep = steps.find(s => s.id === nextId);

        const isArrivingAtSubmissionPoint =
            (nextStep?.type === "sms-verification" || nextStep?.type === "thank-you") &&
            currentStep.type !== "sms-verification" &&
            !submitted &&
            !isSubmittingRef.current;

        if (isArrivingAtSubmissionPoint && formId) {
            setIsLoading(true);
            isSubmittingRef.current = true;
            try {
                const res = await saveLead({ formId, answers });
                if (res.data?.id) {
                    setVerifiedLeadId(res.data.id);
                    if (nextStep?.type === "thank-you") {
                        setSubmitted(true);
                        onComplete?.();
                    }
                } else {
                    isSubmittingRef.current = false;
                }
            } catch (e) {
                console.error("Save lead error:", e);
                isSubmittingRef.current = false;
            } finally {
                setIsLoading(false);
            }
        }

        setHistory(prev => [...prev, currentStepId]);
        setLiveStepId(nextId);
    }, [currentStep, currentStepId, resolveNextStep, answers, formId, steps, onComplete, submitted]);

    const goBack = useCallback(() => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const newHistory = [...prev];
            const prevId = newHistory.pop()!;
            setLiveStepId(prevId);
            return newHistory;
        });
    }, []);

    return {
        currentStepId,
        currentStep,
        currentIndex,
        answers,
        history,
        submitted,
        setSubmitted,
        verifiedLeadId,
        setVerifiedLeadId,
        isLoading,
        handleAnswer,
        goNext,
        goBack
    };
}
