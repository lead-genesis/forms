"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Zap, Shield, Globe, Rocket, Terminal, Cpu } from "lucide-react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { updatePassword } from "@/app/actions/user";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";

const specialties = [
    { id: "saas", label: "SaaS", icon: Zap },
    { id: "fintech", label: "Fintech", icon: Shield },
    { id: "ai", label: "Artificial Intelligence", icon: Cpu },
    { id: "e-commerce", label: "E-commerce", icon: Globe },
    { id: "dev-tools", label: "Developer Tools", icon: Terminal },
    { id: "other", label: "Other / Undecided", icon: Rocket },
];

const confidenceEmojis = [
    { value: 1, emoji: "😟", label: "Not Confident" },
    { value: 2, emoji: "😕", label: "A Bit Unsure" },
    { value: 3, emoji: "😐", label: "Neutral" },
    { value: 4, emoji: "🙂", label: "Fairly Confident" },
    { value: 5, emoji: "🤩", label: "Very Confident" },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(0); // 0 = Welcome
    const [formData, setFormData] = useState({
        password: "",
        first_name: "",
        last_name: "",
        project_goals: "",
        target_specialty: "",
        confidence_level: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 6; // 0 is welcome, so 1-6 are input steps

    const nextStep = async () => {
        if (step === 1) {
            if (formData.password.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }
            setIsSubmitting(true);
            const res = await updatePassword(formData.password);
            setIsSubmitting(false);
            if (res.error) {
                toast.error(res.error);
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const updateField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleComplete = async () => {
        setIsSubmitting(true);

        const data = new FormData();
        data.append("first_name", formData.first_name);
        data.append("last_name", formData.last_name);
        data.append("project_goals", formData.project_goals);
        data.append("target_specialty", formData.target_specialty);
        data.append("confidence_level", formData.confidence_level.toString());

        try {
            const result = await completeOnboarding(data);
            if (result?.error) {
                toast.error(result.error);
                setIsSubmitting(false);
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    const getConfidenceFeedback = (level: number) => {
        if (level >= 4) return "That's the spirit! Confidence is a key ingredient to success.";
        if (level === 3) return "A solid foundation! We'll help you build that confidence to the next level.";
        return "That's completely normal. We're here to help you turn those nerves into strength.";
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-white font-sans">
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 z-50">
                {step > 0 && (
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                )}
            </div>

            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-3xl">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center space-y-8"
                            >
                                <div className="space-y-6">
                                    <p className="text-lg font-medium text-blue-400 uppercase tracking-widest">
                                        Welcome to Genesis Forms.
                                    </p>
                                    <h1 className={cn("text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight", sansFont)}>
                                        Let's get you set up.
                                    </h1>
                                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                                        Congratulations on joining! Just a few quick steps to personalize your experience and launch your portal.
                                    </p>
                                </div>
                                <Button size="lg" className="h-14 px-10 text-lg rounded-full" onClick={() => setStep(1)}>
                                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step > 0 && (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full"
                            >
                                <div className="space-y-12">
                                    <div className="space-y-4 text-center">
                                        <h2 className={cn("text-4xl md:text-5xl font-bold text-white tracking-tight", sansFont)}>
                                            {step === 1 && "Secure your account"}
                                            {step === 2 && "What should we call you?"}
                                            {step === 3 && "Tell us about your project"}
                                            {step === 4 && "Choose your focus area"}
                                            {step === 5 && "Confidence Level"}
                                            {step === 6 && "You're all set!"}
                                        </h2>
                                        <p className="text-slate-400 text-xl font-light">
                                            {step === 1 && "Please set a password for your account."}
                                            {step === 2 && "We'll use this to personalize your experience."}
                                            {step === 3 && "What are you looking to build with this template?"}
                                            {step === 4 && "What niche or industry are you targeting?"}
                                            {step === 5 && "How confident do you feel about your project?"}
                                            {step === 6 && getConfidenceFeedback(formData.confidence_level)}
                                        </p>
                                    </div>

                                    <div className="min-h-[200px] max-w-xl mx-auto w-full">
                                        {step === 1 && (
                                            <div className="space-y-4">
                                                <Input
                                                    type="password"
                                                    placeholder="Enter a strong password"
                                                    value={formData.password}
                                                    onChange={(e) => updateField("password", e.target.value)}
                                                    className="h-16 text-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl"
                                                    autoFocus
                                                />
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                                                    <Input
                                                        placeholder="Jane"
                                                        value={formData.first_name}
                                                        onChange={(e) => updateField("first_name", e.target.value)}
                                                        className="h-16 text-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                                                    <Input
                                                        placeholder="Doe"
                                                        value={formData.last_name}
                                                        onChange={(e) => updateField("last_name", e.target.value)}
                                                        className="h-16 text-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-4">
                                                <Textarea
                                                    placeholder="I'm building a..."
                                                    value={formData.project_goals}
                                                    onChange={(e) => updateField("project_goals", e.target.value)}
                                                    className="min-h-[240px] text-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/10 transition-all p-6 rounded-2xl resize-none leading-relaxed"
                                                    autoFocus
                                                />
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {specialties.map((spec) => (
                                                    <button
                                                        key={spec.id}
                                                        onClick={() => updateField("target_specialty", spec.id)}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all hover:scale-[1.02] group",
                                                            formData.target_specialty === spec.id
                                                                ? "border-primary bg-primary/20 text-white shadow-lg shadow-primary/10"
                                                                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20"
                                                        )}
                                                    >
                                                        <spec.icon className={cn("w-8 h-8 mb-4 transition-colors", formData.target_specialty === spec.id ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
                                                        <span className="font-medium text-lg">{spec.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {step === 5 && (
                                            <div className="flex flex-col items-center space-y-12 py-8">
                                                <div className="flex justify-between w-full max-w-lg gap-2">
                                                    {confidenceEmojis.map((item) => (
                                                        <button
                                                            key={item.value}
                                                            onClick={() => updateField("confidence_level", item.value)}
                                                            className={cn(
                                                                "flex flex-col items-center gap-4 p-4 rounded-2xl transition-all duration-300 transform",
                                                                formData.confidence_level === item.value
                                                                    ? "bg-white/10 scale-110 shadow-xl ring-1 ring-white/20"
                                                                    : "opacity-50 hover:opacity-100 hover:scale-105 hover:bg-white/5"
                                                            )}
                                                        >
                                                            <span className="text-5xl drop-shadow-lg filter grayscale-0">{item.emoji}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-8 max-w-xl mx-auto w-full">
                                        {step < 6 ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    onClick={prevStep}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                                </Button>

                                                <Button
                                                    size="lg"
                                                    onClick={nextStep}
                                                    disabled={
                                                        isSubmitting ||
                                                        (step === 1 && formData.password.length < 6) ||
                                                        (step === 2 && (!formData.first_name || !formData.last_name)) ||
                                                        (step === 3 && !formData.project_goals) ||
                                                        (step === 4 && !formData.target_specialty) ||
                                                        (step === 5 && formData.confidence_level === 0)
                                                    }
                                                    className="rounded-full px-8"
                                                >
                                                    {isSubmitting ? "Processing..." : "Continue"}
                                                    {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="w-full flex justify-center pt-8">
                                                <Button
                                                    size="lg"
                                                    onClick={handleComplete}
                                                    disabled={isSubmitting}
                                                    className="w-full sm:w-auto min-w-[240px] h-16 text-xl rounded-full"
                                                >
                                                    {isSubmitting ? "Setting up..." : "Go to Dashboard"}
                                                    {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        </div>
    );
}
