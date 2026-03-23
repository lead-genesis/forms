import { getBlogs } from "@/app/actions/blogs";
import { getBrands } from "@/app/actions/brands";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { BlogsListClient } from "@/components/dashboard/BlogsListClient";

export default async function BlogsPage() {
    const { data: blogs = [] } = await getBlogs();
    const { data: brands = [] } = await getBrands();

    return (
        <DashboardPage>
            <BlogsListClient initialBlogs={blogs} brands={brands} />
        </DashboardPage>
    );
}
