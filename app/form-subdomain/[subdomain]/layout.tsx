import { Metadata } from "next";
import { getFormBySubdomain } from "@/app/actions/forms";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const { subdomain } = await params;

    try {
        const { data, error } = await getFormBySubdomain(subdomain);
        if (error || !data) {
            return { title: "Genesis Flow" };
        }

        const formName = data.name || "Genesis Flow";
        const brandLogo = data.brands?.logo_url;

        return {
            title: formName,
            icons: brandLogo ? { icon: brandLogo } : undefined
        };
    } catch (err) {
        return { title: "Genesis Flow" };
    }
}

export default function SubdomainLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
