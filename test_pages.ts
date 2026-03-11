import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const { data: pages, error } = await supabase.from('brand_pages').select('id, brand_id, slug, is_published');
    console.log("Pages:", pages, error);
}

async function testPages(brandId: string) {
    console.log("Testing is_index...");
    const { data: byIndex, error: e1 } = await supabase
        .from("brand_pages")
        .select("id, is_published, is_index, slug")
        .eq("brand_id", brandId)
        .eq("is_published", true)
        .eq("is_index", true);
        
    console.log("is_index result:", byIndex, e1);
    
    console.log("Testing slug=index...");
    const { data: bySlug, error: e2 } = await supabase
        .from("brand_pages")
        .select("id, is_published, is_index, slug")
        .eq("brand_id", brandId)
        .eq("is_published", true)
        .eq("slug", "index");
        
    console.log("slug=index result:", bySlug, e2);
    
    console.log("Testing all pages...");
    const { data: all, error: e3 } = await supabase
        .from("brand_pages")
        .select("id, is_published, is_index, slug")
        .eq("brand_id", brandId);
        
    console.log("all pages:", all, e3);
}

main().catch(console.error);
