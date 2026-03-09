"use client";

import React from "react";

interface FormEmbedRendererProps {
    data: any;
}

export const FormEmbedRenderer = React.memo(({ data }: FormEmbedRendererProps) => {
    return (
        <div className="py-10 sm:py-14 lg:py-20 px-4 sm:px-8 lg:px-12 bg-zinc-50/50">
            <div className="max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-zinc-100 shadow-xl shadow-zinc-200/50">
                <div className="space-y-6">
                    <div className="h-6 w-32 bg-zinc-100 rounded-lg animate-pulse" />
                    <div className="space-y-3">
                        <div className="h-12 w-full bg-zinc-50 rounded-xl border border-zinc-100" />
                        <div className="h-12 w-full bg-zinc-50 rounded-xl border border-zinc-100" />
                    </div>
                    <div className="h-12 w-full bg-zinc-900 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                        {data?.formId ? "View Form" : "Select a Form"}
                    </div>
                </div>
            </div>
        </div>
    );
});

FormEmbedRenderer.displayName = "FormEmbedRenderer";
