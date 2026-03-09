-- Add is_index to brand_pages to mark the index/home page per brand
ALTER TABLE brand_pages
ADD COLUMN IF NOT EXISTS is_index boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN brand_pages.is_index IS 'True for the brand index (home) page; one per brand.';
