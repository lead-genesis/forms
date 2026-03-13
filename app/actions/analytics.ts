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
    totalRevenue: number;
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

export async function getDashboardStats(startDate?: string, endDate?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        // 1. Fetch forms (without lead count join so we can filter leads by date)
        const { data: forms, error: formsError } = await supabase
            .from("forms")
            .select(`
                id,
                name,
                views,
                brand_id,
                brands:brand_id (name)
            `);

        if (formsError) throw formsError;

        const formIds = forms.map((f: any) => f.id);

        // 2. Fetch leads with optional date filter
        let leadsQuery = supabase
            .from("leads")
            .select("id, form_id, created_at")
            .in("form_id", formIds);

        if (startDate) {
            leadsQuery = leadsQuery.gte("created_at", startDate);
        }
        if (endDate) {
            leadsQuery = leadsQuery.lt("created_at", endDate);
        }

        const { data: allLeads, error: leadsError } = await leadsQuery;
        if (leadsError) throw leadsError;

        // 3. Aggregate lead counts by form
        const leadCountByForm: Record<string, number> = {};
        (allLeads || []).forEach((lead: any) => {
            leadCountByForm[lead.form_id] = (leadCountByForm[lead.form_id] || 0) + 1;
        });

        const totalLeads = allLeads?.length || 0;
        const totalViews = forms.reduce((acc: number, f: any) => acc + (f.views || 0), 0);
        const totalRevenue = totalLeads * 50; // Mocked at $50 per lead
        const avgConversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

        // 4. Top Forms sorted by lead count in the selected period
        const topForms = forms
            .map((form: any) => {
                const count = leadCountByForm[form.id] || 0;
                const conversionRate = (form.views || 0) > 0 ? (count / form.views) * 100 : 0;
                return { name: form.name, count, conversionRate };
            })
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5);

        // 5. Top Brands aggregated from filtered leads
        const brandMap: Record<string, number> = {};
        forms.forEach((form: any) => {
            const brandName = (form.brands as any)?.name || "Unknown";
            const count = leadCountByForm[form.id] || 0;
            brandMap[brandName] = (brandMap[brandName] || 0) + count;
        });

        const topBrands = Object.entries(brandMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 6. Recent leads (always show latest 5 within the selected period)
        let recentQuery = supabase
            .from("leads")
            .select(`
                id,
                created_at,
                forms:form_id (
                    name,
                    brands:brand_id (name)
                )
            `)
            .in("form_id", formIds)
            .order("created_at", { ascending: false })
            .limit(5);

        if (startDate) {
            recentQuery = recentQuery.gte("created_at", startDate);
        }
        if (endDate) {
            recentQuery = recentQuery.lt("created_at", endDate);
        }

        const { data: recentLeadsData, error: recentError } = await recentQuery;
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
                totalRevenue,
                avgConversionRate,
                topForms,
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

