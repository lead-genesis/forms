import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import {
    UserIcon,
    EnvelopeIcon as MailIcon,
    PhoneIcon,
    CalendarIcon,
    HashtagIcon as HashIcon,
    DocumentTextIcon as FileTextIcon,
    MapPinIcon
} from "@heroicons/react/24/outline";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { getFormSteps } from "@/app/actions/forms";

interface Lead {
    id: string;
    created_at: string;
    form_id: string;
    answers: Record<string, any>;
    form_name?: string;
    webhook_status?: number | null;
    webhook_response?: any;
    is_sms_verified?: boolean;
}

interface FormStep {
    id: string;
    type: string;
    title: string;
    data: any;
    order: number;
}

interface LeadDetailsSheetProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    steps?: FormStep[];
}

export function LeadDetailsSheet({ lead, open, onOpenChange, steps: initialSteps }: LeadDetailsSheetProps) {
    const [fetchedSteps, setFetchedSteps] = useState<FormStep[]>([]);
    const [isFetchingSteps, setIsFetchingSteps] = useState(false);

    // Use initialSteps if provided, otherwise use fetchedSteps
    const steps = (initialSteps && initialSteps.length > 0) ? initialSteps : fetchedSteps;

    useEffect(() => {
        // Reset fetched steps when lead changes or sheet closes
        if (!open || !lead?.id) {
            setFetchedSteps([]);
            return;
        }

        const shouldFetch = open && lead?.form_id && (!initialSteps || initialSteps.length === 0);

        if (shouldFetch) {
            const fetchSteps = async () => {
                setIsFetchingSteps(true);
                const res = await getFormSteps(lead.form_id);
                if (res.data) {
                    setFetchedSteps(res.data as FormStep[]);
                }
                setIsFetchingSteps(false);
            };
            fetchSteps();
        }
    }, [open, lead?.id, lead?.form_id, initialSteps]);

    if (!lead) return null;

    const renderAnswerValue = (key: string, value: any) => {
        // Find if this key corresponds to a step
        const stepId = key.split('_')[0];
        const step = steps.find(s => s.id === stepId);

        if (step?.type === "address" && typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return parsed.full_address || value;
            } catch (e) {
                return value;
            }
        }

        if (step?.type === "multi-choice") {
            const opts = step.data?.options || [];
            // value is the index
            const choiceIndex = parseInt(value);
            const option = typeof opts[choiceIndex] === "object" ? opts[choiceIndex]?.label : opts[choiceIndex];
            return option || value;
        }

        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    };

    const getStepTitle = (key: string) => {
        const stepId = key.split('_')[0];
        const step = steps.find(s => s.id === stepId);
        if (step) return step.title;

        // Humanize common keys
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Separate contact fields and other answers
    const contactFields = ["first_name", "last_name", "email", "phone"];

    // Sort answers by step order if possible
    const sortedAnswers = Object.entries(lead.answers)
        .filter(([key]) => !contactFields.includes(key))
        .sort(([keyA], [keyB]) => {
            const stepA = steps.find(s => s.id === keyA.split('_')[0]);
            const stepB = steps.find(s => s.id === keyB.split('_')[0]);
            if (stepA && stepB) return stepA.order - stepB.order;
            return 0;
        });

    const getWebhookStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        if (status >= 400) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
                <div className="flex-1 overflow-y-auto pt-12 px-6">
                    <SheetHeader className="pb-6 border-b border-border/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-foreground ring-2 ring-border shrink-0">
                                {lead.answers.first_name?.[0] || lead.answers.email?.[0]?.toUpperCase() || 'L'}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <SheetTitle className={cn("text-2xl font-bold truncate", sansFont)}>
                                    {lead.answers.first_name ? `${lead.answers.first_name} ${lead.answers.last_name || ''}` : 'Lead Details'}
                                </SheetTitle>
                                <SheetDescription>
                                    Captured on {format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="py-8 space-y-10">
                        {/* Primary Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                            <div className="grid gap-4">
                                <DetailRow icon={<UserIcon className="w-4 h-4" />} label="Full Name" value={`${lead.answers.first_name || 'Anonymous'} ${lead.answers.last_name || ''}`} />
                                <DetailRow icon={<MailIcon className="w-4 h-4" />} label="Email" value={lead.answers.email || "No email provided"} isEmail />
                                <DetailRow icon={<PhoneIcon className="w-4 h-4" />} label="Phone" value={lead.answers.phone || "No phone provided"} />
                                {lead.form_name && (
                                    <DetailRow icon={<FileTextIcon className="w-4 h-4" />} label="Source Form" value={lead.form_name} />
                                )}
                            </div>
                        </div>

                        {/* All Answers */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Form Responses</h3>
                                {isFetchingSteps && (
                                    <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />
                                )}
                            </div>
                            <div className="bg-secondary/20 rounded-2xl overflow-hidden border border-border/50">
                                {sortedAnswers.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground italic">
                                        No additional response data.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/30">
                                        {sortedAnswers.map(([key, value]) => (
                                            <div key={key} className="p-4 space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{getStepTitle(key)}</p>
                                                <p className="text-sm font-medium text-foreground">{renderAnswerValue(key, value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Webhook Delivery */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Webhook Delivery</h3>
                            {lead.webhook_status ? (
                                <div className="space-y-3">
                                    <div className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        getWebhookStatusColor(lead.webhook_status)
                                    )}>
                                        Status: {lead.webhook_status}
                                    </div>
                                    <div className="bg-slate-950 rounded-xl p-4 border border-border/50 overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-2">Response Data</p>
                                        <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                                            {JSON.stringify(lead.webhook_response, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-border flex items-center gap-3 text-sm text-muted-foreground">
                                    <HashIcon className="w-4 h-4" />
                                    <span>No webhook delivery data available.</span>
                                </div>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="pt-4 pb-12 space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Metadata</h3>
                            <div className="grid gap-3 opacity-60">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">Lead ID</span>
                                    <span className="font-mono">{lead.id}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">Form ID</span>
                                    <span className="font-mono">{lead.form_id}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">SMS Verified</span>
                                    <span className={cn(
                                        "font-bold uppercase tracking-tight",
                                        lead.is_sms_verified ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {lead.is_sms_verified ? 'True' : 'False'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </SheetContent>
        </Sheet>
    );
}

function DetailRow({ icon, label, value, isEmail }: { icon: React.ReactNode, label: string, value: string, isEmail?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-secondary/50 text-muted-foreground">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
                <p className={cn("text-sm font-semibold truncate", isEmail && "text-primary")}>{value}</p>
            </div>
        </div>
    );
}
