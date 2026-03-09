"use server";

import { createClient } from "@/lib/supabase/server";

export interface AnalyticsSummary {
    totalLeads: number;
    totalConversions: number;
    conversionRate: number;
    leadsByDay: { date: string, count: number }[];
    leadsByBrand: { name: string, count: number }[];
    totalViews: number;
}

export async function getAnalyticsSummary(brandId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        // This is a placeholder for more detailed analytics if needed later
        // For now, we'll return a basic structure or implement as needed
        return { data: null, error: "Not implemented" };
    } catch (e: any) {
        return { data: null, error: e.message };
    }
}

export interface DashboardStats {
    totalLeads: number;
    totalViews: number;
    avgConversionRate: number;
    topForms: { name: string; count: number; conversionRate: number }[];
    topBrands: { name: string; count: number }[];
    recentLeads: {
        id: string;
        formName: string;
        brandName: string;
        createdAt: string;
    }[];
}

export async function getDashboardStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    const userId = user.id;

    try {
        // 1. Fetch form views and counts of leads per form in one query
        const { data: forms, error: formsError } = await supabase
            .from("forms")
            .select(`
                id, 
                name, 
                views, 
                brand_id, 
                brands:brand_id (name),
                leads:leads (count)
            `)
            .eq("user_id", userId);

        if (formsError) throw formsError;

        const totalViews = forms.reduce((acc: number, f: any) => acc + (f.views || 0), 0);

        // 2. Map form stats and calculate total leads
        let totalLeads = 0;
        const formStats = forms.map((form: any) => {
            const leadCount = (form.leads as any)?.[0]?.count || 0;
            totalLeads += leadCount;
            const conversionRate = form.views > 0 ? (leadCount / form.views) * 100 : 0;

            return {
                name: form.name,
                count: leadCount,
                conversionRate: conversionRate,
                brandName: (form.brands as any)?.name || "Unknown"
            };
        });

        const avgConversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

        // 3. Top Forms (Sorted by count)
        const sortedTopForms = [...formStats]
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(({ name, count, conversionRate }) => ({ name, count, conversionRate }));

        // 4. Calculate Top Brands from the form stats
        const brandMap: Record<string, number> = {};
        formStats.forEach((form: any) => {
            brandMap[form.brandName] = (brandMap[form.brandName] || 0) + form.count;
        });

        const topBrands = Object.entries(brandMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 5. Fetch only the most recent 5 leads across all forms
        const { data: recentLeadsData, error: recentError } = await supabase
            .from("leads")
            .select(`
                id, 
                created_at, 
                forms:form_id (
                    name, 
                    brands:brand_id (name)
                )
            `)
            .in("form_id", forms.map((f: any) => f.id))
            .order("created_at", { ascending: false })
            .limit(5);

        if (recentError) throw recentError;

        const recentLeads = (recentLeadsData || []).map((lead: any) => ({
            id: lead.id,
            formName: (lead.forms as any)?.name || "Unknown",
            brandName: (lead.forms as any)?.brands?.name || "Unknown",
            createdAt: lead.created_at
        }));

        return {
            data: {
                totalLeads,
                totalViews,
                avgConversionRate,
                topForms: sortedTopForms,
                topBrands,
                recentLeads
            } as DashboardStats,
            error: null
        };

    } catch (error: any) {
        console.error("Dashboard stats error:", error);
        return { data: null, error: error.message };
    }
}
