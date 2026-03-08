export type StepType =
    | "welcome"
    | "multi-choice"
    | "address"
    | "input"
    | "contact"
    | "thank-you"
    | "sms-verification";

export interface FormStep {
    id: string;
    type: StepType;
    title: string;
    data: any;
    /** true while the DB write is in-flight (optimistic) */
    _pending?: boolean;
}

/** Default `data` seeds per step type — used for both optimistic UI and DB insert */
export function defaultData(type: StepType): Record<string, any> {
    switch (type) {
        case "welcome":
            return { heading: "Welcome to our form", subheading: "Please fill out the details below", buttonText: "Get Started" };
        case "contact":
            return { fields: ["first_name", "last_name", "email", "phone"] };
        case "multi-choice":
            return { question: "", options: ["Option 1", "Option 2"] };
        case "input":
            return { label: "", placeholder: "" };
        case "address":
            return { label: "Where are you located?" };
        case "thank-you":
            return { message: "Thanks for your submission!", subtext: "We'll be in touch soon." };
        case "sms-verification":
            return {};
        default:
            return {};
    }
}

export function humanTitle(type: StepType): string {
    switch (type) {
        case "welcome": return "Welcome Page";
        case "contact": return "Contact Details";
        case "multi-choice": return "Multi Choice";
        case "input": return "Text Input";
        case "address": return "Address";
        case "thank-you": return "Thank You Page";
        case "sms-verification": return "SMS Verification";
        default: return type;
    }
}
