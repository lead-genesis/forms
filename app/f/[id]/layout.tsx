import { Metadata } from "next";
import { getFormWithBrand } from "@/app/actions/forms";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data } = await getFormWithBrand(id);

    if (!data) return { title: "Genesis Flow" };

    const brandName = data.brands?.name;
    const formName = data.name || "Genesis Flow";
    const brandLogo = data.brands?.logo_url;

    // Title logic: 
    // 1. [custom_page_title] - [brand_name]
    // 2. [custom_page_title] (if no brand name)
    // 3. [form_name] - Genesis Flow (fallback)
    let title = `${formName} - Genesis Flow`;
    if (data.custom_page_title) {
        title = brandName ? `${data.custom_page_title} - ${brandName}` : data.custom_page_title;
    }

    const description = data.custom_site_description || "High-performance lead generation and form builder";

    return {
        title: { absolute: title },
        description,
        icons: brandLogo ? { icon: brandLogo } : undefined
    };
}

export default function FormIdLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
