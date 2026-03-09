-- Add SEO and OpenGraph fields to brand_pages
ALTER TABLE brand_pages
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS og_image_url text;

COMMENT ON COLUMN brand_pages.seo_title IS 'Custom SEO title for the page (overrides page title in search results)';
COMMENT ON COLUMN brand_pages.seo_description IS 'Meta description shown in search engine results';
COMMENT ON COLUMN brand_pages.og_image_url IS 'Open Graph image URL for social sharing previews';
