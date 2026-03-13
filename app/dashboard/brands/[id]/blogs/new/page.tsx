import { Suspense } from "react";
import BrandBlogEditorPage from "@/components/dashboard/BrandBlogEditorPage";
import { Loader2Icon } from "lucide-react";

export default function NewBrandBlogPage({ params }: { params: Promise<{ id: string }> }) {
    // Pass params with a fake blogId of "new" to signal creation mode
    const wrappedParams = params.then(p => ({ ...p, blogId: "new" }));
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <BrandBlogEditorPage params={wrappedParams} />
        </Suspense>
    );
}
