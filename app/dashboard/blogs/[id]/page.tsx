import { redirect } from "next/navigation";

// Blog editing is now under /dashboard/brands/[id]/blogs/[blogId]
// Redirect old links to /dashboard/brands
export default function OldBlogEditorRedirect() {
    redirect("/dashboard/brands");
}
