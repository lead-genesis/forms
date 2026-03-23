import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getVerticals } from "@/app/actions/verticals";
import { VerticalListClient } from "@/components/dashboard/VerticalListClient";

export default async function VerticalsPage() {
    const { data: verticals } = await getVerticals();

    return (
        <DashboardPage>
            <VerticalListClient initialVerticals={verticals || []} />
        </DashboardPage>
    );
}
