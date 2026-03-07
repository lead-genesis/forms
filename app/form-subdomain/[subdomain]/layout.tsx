import { Metadata } from "next";
import { getFormBySubdomain } from "@/app/actions/forms";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const { subdomain } = await params;
    const { data } = await getFormBySubdomain(subdomain);
    const formName = data?.name || "Genesis Flow";
    const brandLogo = data?.brands?.logo_url;

    return {
        title: { absolute: formName },
        icons: brandLogo ? { icon: brandLogo } : undefined
    };
}

export default function SubdomainLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
