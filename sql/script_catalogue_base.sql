-- ============================================================
-- ADS - Angela Diagnostics & Services
-- BASE CATALOGUE - Tables et Types de base
-- ============================================================

-- ============================================================
-- TYPES PERSONNALISÉS
-- ============================================================

-- Statut du produit
CREATE TYPE produit_statut AS ENUM (
  'disponible',
  'rupture',
  'perime',
  'retire'
);

-- Type de mouvement de stock
CREATE TYPE mouvement_type AS ENUM (
  'entree',
  'sortie',
  'ajustement',
  'inventaire'
);

-- Unité de produit
CREATE TYPE produit_unite AS ENUM (
  'unite',
  'boite',
  'flacon',
  'tube',
  'bouteille',
  'sachet',
  'ml',
  'g',
  'mg',
  'l'
);

-- Type de document
CREATE TYPE document_type AS ENUM (
  'notice',
  'fiche_technique',
  'certificat',
  'autorisation',
  'autre'
);

-- ============================================================
-- TABLES DE BASE
-- ============================================================

-- Table laboratoires
CREATE TABLE IF NOT EXISTS public.laboratoires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  nom_en VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  description_en TEXT,
  image_url TEXT,
  icone_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laboratoire_id UUID REFERENCES public.laboratoires(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  nom_en VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  description_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table produits
CREATE TABLE IF NOT EXISTS public.produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  nom_en VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  reference VARCHAR(100),
  code_barre VARCHAR(50),
  description TEXT,
  description_en TEXT,
  indications TEXT,
  indications_en TEXT,
  composition TEXT,
  prix NUMERIC(10, 2) NOT NULL DEFAULT 0,
  prix_promo NUMERIC(10, 2),
  promo_debut TIMESTAMP WITH TIME ZONE,
  promo_fin TIMESTAMP WITH TIME ZONE,
  quantite_stock INTEGER NOT NULL DEFAULT 0,
  seuil_alerte INTEGER NOT NULL DEFAULT 10,
  unite produit_unite DEFAULT 'unite',
  contenance VARCHAR(50),
  fabricant VARCHAR(255),
  pays_fabricant VARCHAR(100),
  numero_lot VARCHAR(100),
  date_fabrication DATE,
  date_peremption DATE,
  temperature_min NUMERIC(5, 2),
  temperature_max NUMERIC(5, 2),
  conditions_conservation TEXT,
  conditions_conservation_en TEXT,
  poids NUMERIC(10, 2),
  dimensions VARCHAR(50),
  certifications TEXT[],
  classe_dispositif VARCHAR(50),
  statut produit_statut DEFAULT 'disponible',
  nombre_ventes INTEGER DEFAULT 0,
  nombre_vues INTEGER DEFAULT 0,
  note_moyenne NUMERIC(3, 2),
  nombre_avis INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_title_en VARCHAR(255),
  meta_description_en TEXT,
  image_principale_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLES AUXILIAIRES
-- ============================================================

-- Table stock_mouvements
CREATE TABLE IF NOT EXISTS public.stock_mouvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  type mouvement_type NOT NULL,
  quantite INTEGER NOT NULL,
  quantite_avant INTEGER NOT NULL,
  quantite_apres INTEGER NOT NULL,
  reference_doc VARCHAR(100),
  note TEXT,
  effectue_par UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table produit_images
CREATE TABLE IF NOT EXISTS public.produit_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  alt_text_en VARCHAR(255),
  ordre INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table produit_documents
CREATE TABLE IF NOT EXISTS public.produit_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  nom VARCHAR(255) NOT NULL,
  nom_en VARCHAR(255),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table audit_logs (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role VARCHAR(50),
  actor_name VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIGGER : updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers pour toutes les tables avec updated_at
CREATE TRIGGER laboratoires_updated_at
  BEFORE UPDATE ON public.laboratoires
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER produits_updated_at
  BEFORE UPDATE ON public.produits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- FONCTION : fn_is_admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Laboratoires RLS
ALTER TABLE public.laboratoires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "laboratoires_select_all" ON public.laboratoires
  FOR SELECT
  USING (true);

CREATE POLICY "laboratoires_insert_admin" ON public.laboratoires
  FOR INSERT
  WITH CHECK (public.fn_is_admin());

CREATE POLICY "laboratoires_update_admin" ON public.laboratoires
  FOR UPDATE
  USING (public.fn_is_admin());

CREATE POLICY "laboratoires_delete_admin" ON public.laboratoires
  FOR DELETE
  USING (public.fn_is_admin());

-- Categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT
  WITH CHECK (public.fn_is_admin());

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE
  USING (public.fn_is_admin());

CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE
  USING (public.fn_is_admin());

-- Produits RLS
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produits_select_all" ON public.produits
  FOR SELECT
  USING (true);

CREATE POLICY "produits_insert_admin" ON public.produits
  FOR INSERT
  WITH CHECK (public.fn_is_admin());

CREATE POLICY "produits_update_admin" ON public.produits
  FOR UPDATE
  USING (public.fn_is_admin());

CREATE POLICY "produits_delete_admin" ON public.produits
  FOR DELETE
  USING (public.fn_is_admin());

-- Stock mouvements RLS
ALTER TABLE public.stock_mouvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_mouvements_select_admin" ON public.stock_mouvements
  FOR SELECT
  USING (public.fn_is_admin());

CREATE POLICY "stock_mouvements_insert_admin" ON public.stock_mouvements
  FOR INSERT
  WITH CHECK (public.fn_is_admin());

-- Produit images RLS
ALTER TABLE public.produit_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produit_images_select_all" ON public.produit_images
  FOR SELECT
  USING (true);

CREATE POLICY "produit_images_insert_admin" ON public.produit_images
  FOR INSERT
  WITH CHECK (public.fn_is_admin());

CREATE POLICY "produit_images_delete_admin" ON public.produit_images
  FOR DELETE
  USING (public.fn_is_admin());

-- Produit documents RLS
ALTER TABLE public.produit_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produit_documents_select_all" ON public.produit_documents
  FOR SELECT
  USING (true);

CREATE POLICY "produit_documents_insert_admin" ON public.produit_documents
  FOR INSERT
  WITH CHECK (public.fn_is_admin());

CREATE POLICY "produit_documents_delete_admin" ON public.produit_documents
  FOR DELETE
  USING (public.fn_is_admin());

-- Audit logs RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
  FOR SELECT
  USING (public.fn_is_admin());

CREATE POLICY "audit_logs_insert_system" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_laboratoires_slug ON public.laboratoires(slug);
CREATE INDEX IF NOT EXISTS idx_laboratoires_is_active ON public.laboratoires(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_laboratoire_id ON public.categories(laboratoire_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

CREATE INDEX IF NOT EXISTS idx_produits_slug ON public.produits(slug);
CREATE INDEX IF NOT EXISTS idx_produits_categorie_id ON public.produits(categorie_id);
CREATE INDEX IF NOT EXISTS idx_produits_is_active ON public.produits(is_active);
CREATE INDEX IF NOT EXISTS idx_produits_statut ON public.produits(statut);
CREATE INDEX IF NOT EXISTS idx_produits_is_featured ON public.produits(is_featured);

CREATE INDEX IF NOT EXISTS idx_stock_mouvements_produit_id ON public.stock_mouvements(produit_id);
CREATE INDEX IF NOT EXISTS idx_stock_mouvements_created_at ON public.stock_mouvements(created_at);

CREATE INDEX IF NOT EXISTS idx_produit_images_produit_id ON public.produit_images(produit_id);

CREATE INDEX IF NOT EXISTS idx_produit_documents_produit_id ON public.produit_documents(produit_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
