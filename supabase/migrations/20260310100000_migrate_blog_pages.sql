-- Migrate existing "Blogs" pages from type 'content' to 'blog_list'
UPDATE brand_pages
SET type = 'blog_list', updated_at = now()
WHERE slug = 'blogs' AND type = 'content';

-- Seed header + blog_list sections on blog_list pages that have no sections
INSERT INTO brand_sections (page_id, type, data, "order")
SELECT bp.id, 'header', '{}'::jsonb, 0
FROM brand_pages bp
LEFT JOIN brand_sections bs ON bs.page_id = bp.id
WHERE bp.type = 'blog_list'
GROUP BY bp.id
HAVING count(bs.id) = 0;

INSERT INTO brand_sections (page_id, type, data, "order")
SELECT bp.id, 'blog_list', '{"heading": "Blog", "description": ""}'::jsonb, 1
FROM brand_pages bp
LEFT JOIN brand_sections bs ON bs.page_id = bp.id
WHERE bp.type = 'blog_list'
  AND bp.id NOT IN (SELECT page_id FROM brand_sections WHERE type = 'blog_list')
GROUP BY bp.id
HAVING count(bs.id) <= 1;

-- Seed header + blog_content sections on blog template pages that have no sections
INSERT INTO brand_sections (page_id, type, data, "order")
SELECT bp.id, 'header', '{}'::jsonb, 0
FROM brand_pages bp
LEFT JOIN brand_sections bs ON bs.page_id = bp.id
WHERE bp.type = 'blog'
GROUP BY bp.id
HAVING count(bs.id) = 0;

INSERT INTO brand_sections (page_id, type, data, "order")
SELECT bp.id, 'blog_content', '{}'::jsonb, 1
FROM brand_pages bp
LEFT JOIN brand_sections bs ON bs.page_id = bp.id
WHERE bp.type = 'blog'
  AND bp.id NOT IN (SELECT page_id FROM brand_sections WHERE type = 'blog_content')
GROUP BY bp.id
HAVING count(bs.id) <= 1;
