import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getBrands } from "@/app/actions/brands";
import { BrandListClient } from "@/components/dashboard/BrandListClient";

export default async function BrandsPage() {
    const { data: brands } = await getBrands();

    return (
        <DashboardPage>
            <BrandListClient initialBrands={brands || []} />
        </DashboardPage>
    );
}
