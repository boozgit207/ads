-- ============================================================
-- AJOUT CATÉGORIE BIOCHIMIE ET PRODUITS POUR BIOLINE
-- ============================================================

-- Récupérer l'ID de Bioline
WITH bioline AS (
  SELECT id FROM public.laboratoires WHERE slug = 'bioline'
)

-- Insérer la catégorie Biochimie pour Bioline
INSERT INTO public.categories (laboratoire_id, nom, nom_en, slug, description, description_en, is_active)
SELECT 
  (SELECT id FROM bioline),
  'Biochimie',
  'Biochemistry',
  'biochimie-bioline',
  'Tests de biochimie pour Bioline',
  'Biochemistry tests for Bioline',
  true
ON CONFLICT (slug) DO UPDATE SET
  nom = EXCLUDED.nom,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================
-- INSERTION DE PRODUITS BIOCHIMIE POUR BIOLINE
-- ============================================================

-- Récupérer l'ID de la catégorie biochimie Bioline
WITH biochimie_bioline AS (
  SELECT id FROM public.categories WHERE slug = 'biochimie-bioline'
)

-- Insertion des produits biochimie Bioline
INSERT INTO public.produits (categorie_id, nom, nom_en, slug, reference, description, prix, quantite_stock, seuil_alerte, statut, is_active)
SELECT
  c.id,
  p.nom,
  p.nom_en,
  p.slug,
  p.reference,
  p.description,
  p.prix,
  0,
  10,
  'disponible',
  true
FROM public.categories c
CROSS JOIN LATERAL (VALUES
  ('Acide Urique', 'Uric Acid', 'acide-urique-bioline', 'BIO-BIO-001', 'Acide Urique', 15000),
  ('ALAT', 'ALT', 'alat-bioline', 'BIO-BIO-002', 'ALAT', 15000),
  ('ASAT', 'AST', 'asat-bioline', 'BIO-BIO-003', 'ASAT', 15000),
  ('Bilirubine totale', 'Total Bilirubin', 'bilirubine-bioline', 'BIO-BIO-004', 'Bilirubine totale', 15000),
  ('Calcium R1/R2/R3 125ml', 'Calcium R1/R2/R3 125ml', 'calcium-bioline', 'BIO-BIO-005', 'Calcium R1: 125ml, R2/ 125ml, R3: 125ml', 15000),
  ('Chlore', 'Chloride', 'chlore-bioline', 'BIO-BIO-006', 'Chlore', 15000),
  ('Cholestérol HDL', 'HDL Cholesterol', 'hdl-bioline', 'BIO-BIO-007', 'Cholestérol HDL', 15000),
  ('Cholestérol LDL', 'LDL Cholesterol', 'ldl-bioline', 'BIO-BIO-008', 'Cholestérol LDL', 15000),
  ('Créatinine', 'Creatinine', 'creatinine-bioline', 'BIO-BIO-009', 'Créatinine', 15000),
  ('Magnesium', 'Magnesium', 'magnesium-bioline', 'BIO-BIO-010', 'Magnesium', 15000),
  ('Potassium', 'Potassium', 'potassium-bioline', 'BIO-BIO-011', 'Potassium', 15000),
  ('Sodium', 'Sodium', 'sodium-bioline', 'BIO-BIO-012', 'Sodium', 25000),
  ('Tryglycérides', 'Triglycerides', 'triglycerides-bioline', 'BIO-BIO-013', 'Tryglycérides', 18000),
  ('Urée', 'Urea', 'uree-bioline', 'BIO-BIO-014', 'Urée', 18000),
  ('Glucose', 'Glucose', 'glucose-bioline', 'BIO-BIO-015', 'GLUCOSE', 18000),
  ('Cholesterol Total', 'Total Cholesterol', 'cholesterol-total-bioline', 'BIO-BIO-016', 'CHOLESTEROL TOTAL', 18000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'biochimie-bioline'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
