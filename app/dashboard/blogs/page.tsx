import { redirect } from "next/navigation";

// Blogs are now managed under /dashboard/brands/[id]/blogs
export default function BlogsRedirect() {
    redirect("/dashboard/brands");
}
