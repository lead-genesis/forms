/**
 * Build a clean, structured webhook payload.
 * Excludes welcome & thank-you steps — only data-capturing steps are included.
 */

interface FormStep {
    id: string;
    type: string;
    title: string;
    data: any;
}

interface PayloadInput {
    formId: string;
    formName: string;
    steps: FormStep[];
    answers: Record<string, any>;
    isSmsVerified?: boolean;
    smsVerifiedDate?: string | null;
}

export function buildWebhookPayload({ formId, formName, steps, answers, isSmsVerified, smsVerifiedDate }: PayloadInput) {
    const dataSteps = steps.filter(
        s => s.type !== "welcome" && s.type !== "thank-you"
    );

    return {
        form_id: formId,
        form_name: formName,
        submitted_at: new Date().toISOString(),
        sms_verification: isSmsVerified ?? false,
        sms_verified_at: smsVerifiedDate ?? null,
        data: dataSteps.map(s => {
            // Resolve the captured value(s) for this step
            let value: any = null;

            if (s.type === "contact") {
                value = {
                    first_name: answers["first_name"] ?? null,
                    last_name: answers["last_name"] ?? null,
                    email: answers["email"] ?? null,
                    phone: answers["phone"] ?? null,
                };
            } else if (s.type === "multi-choice") {
                const choiceIndex = answers[`${s.id}_choice`];
                const opts = s.data?.options ?? [];
                const option = typeof opts[choiceIndex] === "object"
                    ? opts[choiceIndex]?.label
                    : opts[choiceIndex];
                value = {
                    selected_index: choiceIndex ?? null,
                    selected_label: option ?? null,
                };
            } else if (s.type === "input") {
                value = answers[`${s.id}_input`] ?? null;
            } else if (s.type === "address") {
                const rawAddress = answers[`${s.id}_address`];
                if (rawAddress) {
                    try {
                        const parsed = JSON.parse(rawAddress);
                        value = {
                            full_address: parsed.full_address,
                            street_number: parsed.components?.street_number || null,
                            street_address: parsed.components?.street_address || null,
                            city: parsed.components?.city || null,
                            state: parsed.components?.state || null,
                            postcode: parsed.components?.postcode || null,
                            country: parsed.components?.country || null,
                        };
                    } catch (e) {
                        // Fallback if it wasn't valid JSON (e.g. old data or manual type)
                        value = { full_address: rawAddress };
                    }
                } else {
                    value = null;
                }
            } else if (s.type === "sms-verification") {
                value = isSmsVerified ?? false;
            }

            return {
                step_id: s.id,
                step_title: s.title,
                step_type: s.type,
                value,
            };
        }),
    };
}
