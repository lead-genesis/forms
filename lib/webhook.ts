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
}

export function buildWebhookPayload({ formId, formName, steps, answers }: PayloadInput) {
    const dataSteps = steps.filter(
        s => s.type !== "welcome" && s.type !== "thank-you"
    );

    return {
        form_id: formId,
        form_name: formName,
        submitted_at: new Date().toISOString(),
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
                value = answers[`${s.id}_address`] ?? null;
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
