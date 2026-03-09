import { Suspense } from "react";
import BlogEditorPage from "@/components/dashboard/BlogEditorPage";
import { Loader2Icon } from "lucide-react";

export default function NewBlogPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <BlogEditorPage params={Promise.resolve({})} />
        </Suspense>
    );
}
