import { getForms } from "@/app/actions/forms";
import { FormsListClient } from "@/components/forms/forms-list-client";
import { getBrands } from "@/app/actions/brands";
import { CreateFormButton } from "@/components/forms/create-form-button";

export default async function FormsPage() {
    const { data: forms = [] } = await getForms();
    const { data: brands = [] } = await getBrands();

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor your lead generation forms.
                    </p>
                </div>
                <CreateFormButton brands={brands} />
            </div>

            <FormsListClient initialForms={forms} brands={brands} />
        </div>
    );
}
