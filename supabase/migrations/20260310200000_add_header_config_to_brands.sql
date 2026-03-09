ALTER TABLE brands
ADD COLUMN IF NOT EXISTS header_config jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN brands.header_config IS 'Brand-level header configuration (logo, navigation, styling) applied across all pages';
