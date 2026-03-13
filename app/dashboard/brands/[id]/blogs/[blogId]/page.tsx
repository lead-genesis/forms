import { Suspense } from "react";
import BrandBlogEditorPage from "@/components/dashboard/BrandBlogEditorPage";
import { Loader2Icon } from "lucide-react";

export default function EditBrandBlogPage({ params }: { params: Promise<{ id: string; blogId: string }> }) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <BrandBlogEditorPage params={params} />
        </Suspense>
    );
}
