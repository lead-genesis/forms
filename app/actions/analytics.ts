"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes('placeholder')) {
        return null;
    }

    return createSupabaseClient(url, key);
}

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export interface DashboardStats {
    totalLeads: number;
    totalViews: number;
    avgConversionRate: number;
    topForms: { name: string; count: number; conversionRate: number }[];
    topBrands: { name: string; count: number }[];
    recentLeads: any[];
}

export async function getDashboardStats(userId?: string) {
    const supabase = getClient();
    if (!supabase) return { data: null, error: "Supabase client not initialized" };
    const uid = userId ?? DEMO_USER_ID;

    try {
        // 1. Fetch form views and lead counts
        const { data: forms, error: formsError } = await supabase
            .from("forms")
            .select("id, name, views, brand_id, brands(name)")
            .eq("user_id", uid);

        if (formsError) throw formsError;

        const totalViews = forms.reduce((acc, f) => acc + (f.views || 0), 0);
        const formIds = forms.map(f => f.id);

        // 2. Fetch leads for these forms
        const { data: leads, error: leadsError } = await supabase
            .from("leads")
            .select("id, form_id, created_at, forms(name, brand_id, brands(name))")
            .in("form_id", formIds)
            .order("created_at", { ascending: false });

        if (leadsError) throw leadsError;

        const totalLeads = leads.length;
        const avgConversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

        // 3. Calculate Top Performing Forms
        const formStats = forms.map(form => {
            const formLeads = leads.filter(l => l.form_id === form.id).length;
            const conversionRate = form.views > 0 ? (formLeads / form.views) * 100 : 0;
            return {
                name: form.name,
                count: formLeads,
                conversionRate: conversionRate
            };
        }).sort((a, b) => b.count - a.count).slice(0, 5);

        // 4. Calculate Top Performing Brands
        const brandMap: Record<string, number> = {};
        leads.forEach(lead => {
            const brandName = (lead.forms as any)?.brands?.name || "Unknown";
            brandMap[brandName] = (brandMap[brandName] || 0) + 1;
        });

        const topBrands = Object.entries(brandMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 5. Recent Leads (Recent 5)
        const recentLeads = leads.slice(0, 5).map(lead => ({
            id: lead.id,
            formName: (lead.forms as any)?.name,
            brandName: (lead.forms as any)?.brands?.name,
            createdAt: lead.created_at,
            // Assuming answers might have name/email
            customer: "Lead #" + lead.id.toString().slice(0, 4)
        }));

        return {
            data: {
                totalLeads,
                totalViews,
                avgConversionRate,
                topForms: formStats,
                topBrands,
                recentLeads
            },
            error: null
        };

    } catch (error: any) {
        console.error("Dashboard stats error:", error);
        return { data: null, error: error.message };
    }
}
