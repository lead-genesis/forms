import BlogEditorPage from "@/components/dashboard/BlogEditorPage";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    return <BlogEditorPage params={params} />;
}
