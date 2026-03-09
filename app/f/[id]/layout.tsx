import { Metadata } from "next";
import { getForm } from "@/app/actions/forms";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data } = await getForm(id);

    if (!data) return { title: "Genesis Flow" };

    const brandName = data.brands?.name;
    const formName = data.name || "Genesis Flow";
    const brandLogo = data.brands?.logo_url;

    // Title logic: 
    // 1. [custom_page_title] - [brand_name]
    // 2. [custom_page_title] (if no brand name)
    // 3. [form_name] - [brand_name]
    // 4. [form_name] (fallback)
    let title = brandName ? `${formName} - ${brandName}` : formName;
    if (data.custom_page_title) {
        title = brandName ? `${data.custom_page_title} - ${brandName}` : data.custom_page_title;
    }

    const description = data.custom_site_description || "High-performance lead generation and form builder";

    return {
        title: { absolute: title },
        description,
        icons: brandLogo ? { icon: brandLogo } : undefined,
        openGraph: {
            title,
            description,
            type: "website",
            images: brandLogo ? [{ url: brandLogo }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: brandLogo ? [brandLogo] : undefined,
        },
    };
}

export default function FormIdLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
