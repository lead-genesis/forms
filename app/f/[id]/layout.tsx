import { Metadata } from "next";
import { getFormWithBrand } from "@/app/actions/forms";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data } = await getFormWithBrand(id);
    const formName = data?.name || "Genesis Flow";
    const brandLogo = data?.brands?.logo_url;

    return {
        title: { absolute: formName },
        icons: brandLogo ? { icon: brandLogo } : undefined
    };
}

export default function FormIdLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
