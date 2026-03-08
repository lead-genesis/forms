import { Metadata } from "next";
import { getFormBySubdomain } from "@/app/actions/forms";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const { subdomain } = await params;

    try {
        const { data, error } = await getFormBySubdomain(subdomain);
        if (error || !data) {
            return { title: "Genesis Flow" };
        }

        const brandName = data.brands?.name;
        const formName = data.name || "Genesis Flow";
        const brandLogo = data.brands?.logo_url;

        let title = brandName ? `${formName} - ${brandName}` : formName;
        if (data.custom_page_title) {
            title = brandName ? `${data.custom_page_title} - ${brandName}` : data.custom_page_title;
        }

        const description = data.custom_site_description || "High-performance lead generation and form builder";

        return {
            title: { absolute: title },
            description,
            icons: brandLogo ? { icon: brandLogo } : undefined
        };
    } catch (err) {
        return { title: "Genesis Flow" };
    }
}

export default function SubdomainLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
