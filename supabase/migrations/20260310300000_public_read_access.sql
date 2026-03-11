-- Allow public read access to brands
CREATE POLICY "Public can view all brands"
ON brands
FOR SELECT USING (true);

-- Allow public read access to published pages
CREATE POLICY "Public can view published pages"
ON brand_pages
FOR SELECT USING (is_published = true);

-- Allow public read access to sections of published pages
CREATE POLICY "Public can view sections of published pages"
ON brand_sections
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM brand_pages
    WHERE brand_pages.id = brand_sections.page_id
    AND brand_pages.is_published = true
  )
);

-- Allow public read access to published blogs
CREATE POLICY "Public can view published blogs"
ON blogs
FOR SELECT USING (is_published = true);

-- Allow public read access to published forms
CREATE POLICY "Public can view published forms"
ON forms
FOR SELECT USING (status = 'published');

-- Allow public read access to steps of published forms
CREATE POLICY "Public can view steps of published forms"
ON form_steps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_steps.form_id
    AND forms.status = 'published'
  )
);

-- Allow public to insert leads
CREATE POLICY "Public can insert leads"
ON leads
FOR INSERT WITH CHECK (true);
