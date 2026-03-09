ALTER TABLE brands
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS og_image_url text;

COMMENT ON COLUMN brands.seo_title IS 'Custom SEO title for the brand site (overrides brand name in search results)';
COMMENT ON COLUMN brands.seo_description IS 'Meta description shown in search engine results for the brand site';
COMMENT ON COLUMN brands.og_image_url IS 'Open Graph image URL for social sharing previews';
