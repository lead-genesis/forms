import { useState, useCallback, useRef } from "react";
import { updateForm } from "@/app/actions/forms";

export function useFormAutosave(formId: string | null) {
    const [isSaving, setIsSaving] = useState(false);
    const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const saveField = useCallback(async (key: string, value: any) => {
        if (!formId) return;

        setIsSaving(true);
        try {
            await updateForm(formId, { [key]: value });
        } finally {
            setIsSaving(false);
        }
    }, [formId]);

    const debouncedSave = useCallback((key: string, value: any, delay = 500) => {
        if (!formId) return;

        clearTimeout(debounceRefs.current[key]);
        debounceRefs.current[key] = setTimeout(() => {
            saveField(key, value);
        }, delay);
    }, [formId, saveField]);

    return { isSaving, debouncedSave, saveField };
}
