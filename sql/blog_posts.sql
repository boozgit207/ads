-- Table des articles de blog ADS
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre VARCHAR(300) NOT NULL,
  titre_en VARCHAR(300),
  slug VARCHAR(300) NOT NULL UNIQUE,
  extrait TEXT,
  extrait_en TEXT,
  contenu TEXT NOT NULL DEFAULT '',
  contenu_en TEXT,
  image_url TEXT,
  auteur VARCHAR(200) DEFAULT 'ADS',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique articles publiés" ON blog_posts;
CREATE POLICY "Lecture publique articles publiés"
  ON blog_posts FOR SELECT
  USING (is_published = true)
  TO anon, authenticated;

DROP POLICY IF EXISTS "Admins gestion blog" ON blog_posts;
CREATE POLICY "Admins gestion blog"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
