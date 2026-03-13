import { getForms } from "@/app/actions/forms";
import { FormsListClient } from "@/components/forms/forms-list-client";
import { getBrands } from "@/app/actions/brands";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export default async function FormsPage() {
    const { data: forms = [] } = await getForms();
    const { data: brands = [] } = await getBrands();

    return (
        <DashboardPage>
            <FormsListClient initialForms={forms} brands={brands} />
        </DashboardPage>
    );
}
