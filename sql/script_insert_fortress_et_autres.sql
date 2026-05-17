-- ============================================================
-- INSERTION COMPLÈTE - Laboratoires, Catégories et Produits
-- Fortress Diagnostics, Bioline, Hightop, Consommables
-- ============================================================

-- ============================================================
-- 1. LABORATOIRES
-- ============================================================

INSERT INTO public.laboratoires (nom, nom_en, slug, description, description_en, is_active) VALUES
('Fortress Diagnostics', 'Fortress Diagnostics', 'fortress-diagnostics', 'Laboratoire spécialisé en diagnostics médicaux', 'Medical diagnostics laboratory', true),
('Bioline', 'Bioline', 'bioline', 'Laboratoire de sérologie et TDR', 'Serology and rapid test laboratory', true),
('Hightop', 'Hightop', 'hightop', 'Laboratoire de tests rapides et ELISA', 'Rapid tests and ELISA laboratory', true),
('Consommables', 'Consommables', 'consommables', 'Fournitures et consommables médicaux', 'Medical supplies and consumables', true)
ON CONFLICT (slug) DO UPDATE SET
  nom = EXCLUDED.nom,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================
-- 2. CATÉGORIES PAR LABORATOIRE
-- ============================================================

-- Récupérer l'ID de Fortress Diagnostics
WITH fortress AS (
  SELECT id FROM public.laboratoires WHERE slug = 'fortress-diagnostics'
),
-- Récupérer l'ID de Bioline
bioline AS (
  SELECT id FROM public.laboratoires WHERE slug = 'bioline'
),
-- Récupérer l'ID de Hightop
hightop AS (
  SELECT id FROM public.laboratoires WHERE slug = 'hightop'
),
-- Récupérer l'ID de Consommables
consommables AS (
  SELECT id FROM public.laboratoires WHERE slug = 'consommables'
)

INSERT INTO public.categories (laboratoire_id, nom, nom_en, slug, description, description_en, is_active)
SELECT * FROM (
  -- FORTRESS DIAGNOSTICS - Catégories
  SELECT (SELECT id FROM fortress), 'Latex', 'Latex', 'latex-fortress', 'Tests latex', 'Latex tests', true
  UNION ALL SELECT (SELECT id FROM fortress), 'Biochimie', 'Biochemistry', 'biochimie', 'Tests de biochimie', 'Biochemistry tests', true
  UNION ALL SELECT (SELECT id FROM fortress), 'Hormones', 'Hormones', 'hormones', 'Dosages hormonaux', 'Hormone assays', true
  UNION ALL SELECT (SELECT id FROM fortress), 'Marqueurs Tumoraux', 'Tumor Markers', 'marqueurs-tumoraux', 'Marqueurs tumoraux', 'Tumor markers', true
  UNION ALL SELECT (SELECT id FROM fortress), 'Autres', 'Others', 'autres-fortress', 'Autres tests', 'Other tests', true
  UNION ALL SELECT (SELECT id FROM fortress), 'Maladies Infectieuses', 'Infectious Diseases', 'maladies-infectieuses', 'Tests maladies infectieuses', 'Infectious disease tests', true
  
  -- BIOLINE - Catégories
  UNION ALL SELECT (SELECT id FROM bioline), 'Sérologie / TDR', 'Serology / RDT', 'serologie-tdr-bioline', 'Sérologie et tests rapides', 'Serology and rapid tests', true
  UNION ALL SELECT (SELECT id FROM bioline), 'Latex', 'Latex', 'latex-bioline', 'Tests latex', 'Latex tests', true
  
  -- HIGHTOP - Catégories
  UNION ALL SELECT (SELECT id FROM hightop), 'Sérologie / TDR', 'Serology / RDT', 'serologie-tdr-hightop', 'Sérologie et tests rapides', 'Serology and rapid tests', true
  UNION ALL SELECT (SELECT id FROM hightop), 'ELISA', 'ELISA', 'elisa', 'Tests ELISA', 'ELISA tests', true
  
  -- CONSOMMABLES - Catégories
  UNION ALL SELECT (SELECT id FROM consommables), 'Consommables', 'Consumables', 'consommables-cat', 'Consommables médicaux', 'Medical consumables', true
  UNION ALL SELECT (SELECT id FROM consommables), 'Colorants', 'Stains', 'colorants', 'Colorants et réactifs', 'Stains and reagents', true
) AS cats(laboratoire_id, nom, nom_en, slug, description, description_en, is_active)
ON CONFLICT (slug) DO UPDATE SET
  nom = EXCLUDED.nom,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================
-- 3. PRODUITS - FORTRESS DIAGNOSTICS
-- ============================================================

-- LATEX
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
  ('ASO 100 Tests', 'ASO 100 Tests', 'aso-100-tests-fortress', 'FORT-LATEX-001', 'Tests ASO 100 Tests', 11000),
  ('CRP 100T', 'CRP 100 Tests', 'crp-100t-fortress', 'FORT-LATEX-002', 'CRP 100 Tests', 12000),
  ('Facteur Rhumatoïdes 100 Tests', 'Rheumatoid Factor 100 Tests', 'facteur-rhumatoi', 'FORT-LATEX-003', 'Facteur Rhumatoïdes 100 Tests', 12000),
  ('Groupage sanguin 100 Tests', 'Blood Typing 100 Tests', 'groupage-100t', 'FORT-LATEX-004', 'Groupage sanguin 100 Tests', 12000),
  ('AHG coombe', 'AHG Coombs', 'ahg-coombe', 'FORT-LATEX-005', 'AHG Coombe', 45000),
  ('RPR', 'RPR', 'rpr', 'FORT-LATEX-006', 'RPR Test', 11000),
  ('TPHA', 'TPHA', 'tpha', 'FORT-LATEX-007', 'TPHA Test', 15000),
  ('VDRL', 'VDRL', 'vdrl', 'FORT-LATEX-008', 'VDRL Test', 14000),
  ('WIDAL', 'WIDAL', 'widal-fortress', 'FORT-LATEX-009', 'WIDAL Test', 14000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'latex-fortress'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- BIOCHIMIE
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
  ('Acide Urique', 'Uric Acid', 'acide-urique', 'FORT-BIO-001', 'Acide Urique', 18000),
  ('ALAT', 'ALT', 'alat', 'FORT-BIO-002', 'ALAT', 18000),
  ('ASAT', 'AST', 'asat', 'FORT-BIO-003', 'ASAT', 18000),
  ('Bilirubine totale', 'Total Bilirubin', 'bilirubine', 'FORT-BIO-004', 'Bilirubine totale', 18000),
  ('Calcium R1/R2/R3 125ml', 'Calcium R1/R2/R3 125ml', 'calcium', 'FORT-BIO-005', 'Calcium R1: 125ml, R2/ 125ml, R3: 125ml', 18000),
  ('Chlore', 'Chloride', 'chlore', 'FORT-BIO-006', 'Chlore', 18000),
  ('Cholestérol HDL', 'HDL Cholesterol', 'hdl', 'FORT-BIO-007', 'Cholestérol HDL', 18000),
  ('Cholestérol LDL', 'LDL Cholesterol', 'ldl', 'FORT-BIO-008', 'Cholestérol LDL', 18000),
  ('Créatinine', 'Creatinine', 'creatinine', 'FORT-BIO-009', 'Créatinine', 18000),
  ('Magnesium', 'Magnesium', 'magnesium', 'FORT-BIO-010', 'Magnesium', 18000),
  ('Potassium', 'Potassium', 'potassium', 'FORT-BIO-011', 'Potassium', 18000),
  ('Sodium', 'Sodium', 'sodium', 'FORT-BIO-012', 'Sodium', 30000),
  ('Tryglycérides', 'Triglycerides', 'triglycerides', 'FORT-BIO-013', 'Tryglycérides', 20000),
  ('Urée', 'Urea', 'uree', 'FORT-BIO-014', 'Urée', 20000),
  ('Glucose', 'Glucose', 'glucose', 'FORT-BIO-015', 'GLUCOSE', 20000),
  ('Cholesterol Total', 'Total Cholesterol', 'cholesterol-total', 'FORT-BIO-016', 'CHOLESTEROL TOTAL', 20000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'biochimie'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- HORMONES
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
  ('FSH', 'FSH', 'fsh', 'FORT-HORM-001', 'FSH', 60000),
  ('LH', 'LH', 'lh', 'FORT-HORM-002', 'LH', 60000),
  ('Œstradiol', 'Estradiol', 'oestradiol', 'FORT-HORM-003', 'Œstradiol', 75000),
  ('Progestérone', 'Progesterone', 'progesterone', 'FORT-HORM-004', 'Progestérone', 70000),
  ('Prolactine', 'Prolactin', 'prolactine', 'FORT-HORM-005', 'Prolactine', 60000),
  ('FT4', 'FT4', 'ft4', 'FORT-HORM-006', 'FT4', 65000),
  ('T3', 'T3', 't3', 'FORT-HORM-007', 'T3', 60000),
  ('T4', 'T4', 't4', 'FORT-HORM-008', 'T4', 60000),
  ('Testostérone Free', 'Free Testosterone', 'testo-free', 'FORT-HORM-009', 'Testostérone free', 85000),
  ('Testostérone', 'Testosterone', 'testosterone', 'FORT-HORM-010', 'Testostérone', 75000),
  ('TSH', 'TSH', 'tsh', 'FORT-HORM-011', 'TSH', 60000),
  ('FT3', 'FT3', 'ft3', 'FORT-HORM-012', 'FT3', 65000),
  ('BHCG', 'BHCG', 'bhcg', 'FORT-HORM-013', 'BHCG', 60000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'hormones'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- MARQUEURS TUMORAUX
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
  ('PSA 96 Tests', 'PSA 96 Tests', 'psa-96', 'FORT-TUM-001', 'PSA 96 TEST', 70000),
  ('CA 15-3 96 Tests', 'CA 15-3 96 Tests', 'ca15-3', 'FORT-TUM-002', 'CA 15-3 96 TEST', 90000),
  ('CA 125 96 Tests', 'CA 125 96 Tests', 'ca125', 'FORT-TUM-003', 'CA 125 96 TEST', 90000),
  ('CA 19-9 96 Tests', 'CA 19-9 96 Tests', 'ca19-9', 'FORT-TUM-004', 'CA 19-9 96 TEST', 100000),
  ('AFP 96 Tests', 'AFP 96 Tests', 'afp-96', 'FORT-TUM-005', 'AFP 96 TEST', 65000),
  ('PSA Free 96 Tests', 'PSA Free 96 Tests', 'psa-free', 'FORT-TUM-006', 'PSA FREE 96 TEST', 85000),
  ('CEA 96 Tests', 'CEA 96 Tests', 'cea-96', 'FORT-TUM-007', 'CEA 96 TEST', 75000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'marqueurs-tumoraux'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- AUTRES
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
  ('Vit D 96T', 'Vit D 96 Tests', 'vit-d', 'FORT-AUT-001', 'Vit D 96 T', 80000),
  ('IgE 96T', 'IgE 96 Tests', 'ige', 'FORT-AUT-002', 'IgE 96 T', 65000),
  ('Cortisol 96T', 'Cortisol 96 Tests', 'cortisol', 'FORT-AUT-003', 'CORTISOL 96 T', 90000),
  ('Ferritin 96T', 'Ferritin 96 Tests', 'ferritin', 'FORT-AUT-004', 'FERRITIN 96 T', 80000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'autres-fortress'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- MALADIES INFECTIEUSES
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
  ('Ac Hbs Quantitatif 96 Tests', 'HBsAg Quantitative 96 Tests', 'hbsag-quant', 'FORT-INF-001', 'Ac Hbs quantitatif 96 TEST', 65000),
  ('Ac HCV 96 Tests', 'Anti-HCV 96 Tests', 'hcv', 'FORT-INF-002', 'Ac HCV 96 TEST', 55000),
  ('HSV 1/2 IgM 96T', 'HSV 1/2 IgM 96 Tests', 'hsv-igm', 'FORT-INF-003', 'HSV 1/2 IgM 96 T', 70000),
  ('HSV 1/2 IgG 96T', 'HSV 1/2 IgG 96 Tests', 'hsv-igg', 'FORT-INF-004', 'HSV 1/2 IgG 96 T', 70000),
  ('H. Pylori IgG 96T', 'H. Pylori IgG 96 Tests', 'pylori-igg', 'FORT-INF-005', 'H, Pylori IgG 96 T', 70000),
  ('H. Pylori IgM 96T', 'H. Pylori IgM 96 Tests', 'pylori-igm', 'FORT-INF-006', 'H. Pylori IgM 96 T', 70000),
  ('Toxo IgG 96T', 'Toxoplasma IgG 96 Tests', 'toxo-igg', 'FORT-INF-007', 'TOXO IgG 96 T', 60000),
  ('Toxo IgM 96T', 'Toxoplasma IgM 96 Tests', 'toxo-igm', 'FORT-INF-008', 'TOXO IgM 96 T', 60000),
  ('Rubéole IgG 96T', 'Rubella IgG 96 Tests', 'rub-igg', 'FORT-INF-009', 'RUBEOLE IgG 96 T', 60000),
  ('Rubéole IgM 96T', 'Rubella IgM 96 Tests', 'rub-igm', 'FORT-INF-010', 'RUBEOLE IgM 96 T', 60000),
  ('CMV IgG 96T', 'CMV IgG 96 Tests', 'cmv-igg', 'FORT-INF-011', 'CMV IgG 96 T', 55000),
  ('CMV IgM 96T', 'CMV IgM 96 Tests', 'cmv-igm', 'FORT-INF-012', 'CMV IgM 96 T', 55000),
  ('Syphilis 96T', 'Syphilis 96 Tests', 'syphilis', 'FORT-INF-013', 'SYPHILIS 96 T', 65000),
  ('Alpha Fœtoprotéine Elisa 96T', 'AFP ELISA 96 Tests', 'afp-elisa', 'FORT-INF-014', 'Alfa fœtoprotéine Elisa 96 T', 65000),
  ('Ac Hbc Elisa 96T', 'Anti-HBc ELISA 96 Tests', 'hbc', 'FORT-INF-015', 'Ac Hbc Elisa 96 T', 65000),
  ('Ag Hbe 96T', 'HBeAg 96 Tests', 'hbe', 'FORT-INF-016', 'Ag Hbe 96 T', 65000),
  ('Ag Hbs 96T ELISA', 'HBsAg 96 Tests ELISA', 'hbsag-elisa', 'FORT-INF-017', 'Ag Hbs 96 T ELISA', 65000),
  ('HIV 1/2 Ag/Ac 4th Gen 96 Tests', 'HIV 1/2 Ag/Ab 4th Gen 96 Tests', 'hiv-4g', 'FORT-INF-018', 'HIV ½ Ag/Ac 4th generation 96 Tests ELISA', 65000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'maladies-infectieuses'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- ============================================================
-- 4. PRODUITS - BIOLINE
-- ============================================================

-- SEROLOGIE / TDRS
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
  ('TDR Paludisme B/25', 'Malaria RDT B/25', 'tdr-palu', 'BIO-TDR-001', 'TDRS PALUDISME B/25', 7000),
  ('Electrophorèse B/20', 'Electrophoresis B/20', 'electro', 'BIO-TDR-002', 'ELECTROPHORESE B/20', 45000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'serologie-tdr-bioline'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- LATEX BIOLINE
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
  ('CRP', 'CRP', 'crp-bioline', 'BIO-LATEX-001', 'CRP', 8000),
  ('Widal', 'Widal', 'widal-bioline', 'BIO-LATEX-002', 'WIDAL', 10000),
  ('Groupage Sanguin', 'Blood Typing', 'groupage-bio', 'BIO-LATEX-003', 'Groupage sanguin', 8000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'latex-bioline'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- ============================================================
-- 5. PRODUITS - HIGHTOP
-- ============================================================

-- SEROLOGIE / TDRS HIGHTOP
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
  ('Ag Hbs B/40 Cassettes', 'HBsAg B/40 Cassettes', 'hbsag-cass', 'HIGH-TDR-001', 'Ag Hbs B/40 cassettes', 10000),
  ('Ag Hbs B/50 Bandelettes', 'HBsAg B/50 Strips', 'hbsag-strip', 'HIGH-TDR-002', 'Ag Hbs B/50 bandelettes', 5000),
  ('Ac HCV B/40 Cassettes', 'Anti-HCV B/40 Cassettes', 'hcv-cass', 'HIGH-TDR-003', 'Ac Hcv B/40 casettes', 10000),
  ('Ac HCV B/50 Bandelettes', 'Anti-HCV B/50 Strips', 'hcv-strip', 'HIGH-TDR-004', 'Ac Hcv B/50 bandelettes', 6000),
  ('Chlamydiae IgG 20 DOT', 'Chlamydia IgG 20 DOT', 'chlam-igg', 'HIGH-TDR-005', 'Chlamydiae IgG 20 DOT', 10000),
  ('Chlamydiae IgM 20 DOT', 'Chlamydia IgM 20 DOT', 'chlam-igm', 'HIGH-TDR-006', 'Chlamydiae IgM 20 DOT', 10000),
  ('Combi 11', 'Combi 11', 'combi-11', 'HIGH-TDR-007', 'Combi 11', 5000),
  ('Combi 2', 'Combi 2', 'combi-2', 'HIGH-TDR-008', 'Combi 2', 2500),
  ('H. Pylori AC 25 Tests', 'H. Pylori Ab 25 Tests', 'pylori-ac', 'HIGH-TDR-009', 'H. pylori AC 25 Tests', 11000),
  ('H. Pylori AG 20 Tests', 'H. Pylori Ag 20 Tests', 'pylori-ag', 'HIGH-TDR-010', 'H. pylori AG 20 Tests', 15000),
  ('HBV 5 en 1 Marqueurs Hep B 20 Tests', 'HBV 5 in 1 Hep B Markers 20 Tests', 'hbv-5en1', 'HIGH-TDR-011', 'HBV 5 en 1 (marqueurs Hep B) 20 Tests', 15000),
  ('HCG Bandelettes 50 Tests', 'HCG Strips 50 Tests', 'hcg-strip', 'HIGH-TDR-012', 'HCG bandelettes 50 Tests urine, sérum, plasma', 3500),
  ('HCG Cassettes 25 Tests', 'HCG Cassettes 25 Tests', 'hcg-cass', 'HIGH-TDR-013', 'HCG casettes 25 Tests urine, sérum, plasma', 4500),
  ('HIV 1/2 100 Tests', 'HIV 1/2 100 Tests', 'hiv-100', 'HIGH-TDR-014', 'HIV ½ 100 Tests', 11000),
  ('HSV 1/2 B/25', 'HSV 1/2 B/25', 'hsv-25', 'HIGH-TDR-015', 'HSV 1/2 boîte de 25', 13000),
  ('LH B/40', 'LH B/40', 'lh-40', 'HIGH-TDR-016', 'LH boîte de 40', 11000),
  ('Malaria 25 Tests Pf/PAN', 'Malaria 25 Tests Pf/PAN', 'malaria-25', 'HIGH-TDR-017', 'Malaria 25 Tests Pf/PAN', 7000),
  ('PSA Ag 25 Tests', 'PSA Ag 25 Tests', 'psa-25', 'HIGH-TDR-018', 'PSA Ag 25 Tests', 11000),
  ('Rubéole IgG/IgM 25 Tests', 'Rubella IgG/IgM 25 Tests', 'rub-igm', 'HIGH-TDR-019', 'Rubéole IgG/ IgM 25 Tests', 11000),
  ('Syphilis B/40 Cassettes', 'Syphilis B/40 Cassettes', 'syph-cass', 'HIGH-TDR-020', 'Syplilis B/40 cassettes', 10000),
  ('Syphilis B/50 Bandelettes', 'Syphilis B/50 Strips', 'syph-strip', 'HIGH-TDR-021', 'Syplilis B/50 bandelettes', 5000),
  ('Toxoplasmose IgG/IgM 25 Tests', 'Toxoplasma IgG/IgM 25 Tests', 'toxo-igm', 'HIGH-TDR-022', 'Toxoplasmose IgG/ IgM 25 Tests', 11000),
  ('Typhoïdes AC 25 Tests', 'Typhoid AC 25 Tests', 'typh-ac', 'HIGH-TDR-023', 'Typhoïdes AC 25 Tests', 11000),
  ('Torch AB', 'Torch AB', 'torch', 'HIGH-TDR-024', 'Torch AB', 40000),
  ('SARS-COV2 24 Tests', 'SARS-CoV-2 24 Tests', 'covid-24', 'HIGH-TDR-025', 'SARS-COV2 24 Tests', 50000),
  ('Multi Drug 12 Paramètres', 'Multi Drug 12 Parameters', 'multi-drug', 'HIGH-TDR-026', 'Multi drug 12 Paramètres', 50000),
  ('Ag Hbs/HIV/Hepatite B/40 Cassettes', 'HBsAg/HIV/Hep B B/40 Cassettes', 'combo-hbv', 'HIGH-TDR-027', 'Ag Hbs/HIV/HEPATITE B/40 Cassettes', 17000),
  ('FOB', 'FOB', 'fob', 'HIGH-TDR-028', 'FOB', 15000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'serologie-tdr-hightop'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- ELISA HIGHTOP
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
  ('Toxoplasmose IgG 96 Tests', 'Toxoplasma IgG 96 Tests', 'toxo-igg-high', 'HIGH-ELISA-001', 'Toxoplasmose IgG 96 Tests', 50000),
  ('Toxoplasmose IgM 96 Tests', 'Toxoplasma IgM 96 Tests', 'toxo-igm-high', 'HIGH-ELISA-002', 'Toxoplasmose IgM 96 Tests', 50000),
  ('Rubéole IgG 96 Tests', 'Rubella IgG 96 Tests', 'rub-igg-high', 'HIGH-ELISA-003', 'Rubéole IgG 96 Tests', 50000),
  ('Rubéole IgM 96 Tests', 'Rubella IgM 96 Tests', 'rub-igm-high', 'HIGH-ELISA-004', 'Rubéole IgM 96 Tests', 50000),
  ('Hepatite B 96T', 'Hepatitis B 96 Tests', 'hepb-high', 'HIGH-ELISA-005', 'Hepatite B 96T', 40000),
  ('HCV Elisa 96T', 'HCV ELISA 96 Tests', 'hcv-elisa-high', 'HIGH-ELISA-006', 'HCV Elisa 96T', 45000),
  ('Clamydia IgG 96 Tests', 'Chlamydia IgG 96 Tests', 'chlam-igg-high', 'HIGH-ELISA-007', 'Clamedia igG 96 T', 55000),
  ('Clamydia IgM 96 Tests', 'Chlamydia IgM 96 Tests', 'chlam-igm-high', 'HIGH-ELISA-008', 'Clamedia igM 96 T', 55000),
  ('HIV 96 Tests', 'HIV 96 Tests', 'hiv-elisa-high', 'HIGH-ELISA-009', 'HIV', 55000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'elisa'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- ============================================================
-- 6. PRODUITS - CONSOMMABLES
-- ============================================================

-- CONSOMMABLES
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
  ('Alcool 1L', 'Alcohol 1L', 'alcool-1l', 'CONS-001', 'Alcool 1L', 1000),
  ('Compresses 10x10 cm', 'Compresses 10x10 cm', 'compresses', 'CONS-002', 'Compresses 10x10 cm', 3500),
  ('Cones Bleus', 'Blue Cones', 'cones-bleus', 'CONS-003', 'Cones bleus', 3500),
  ('Cones Jaunes', 'Yellow Cones', 'cones-jaunes', 'CONS-004', 'Cones jaunes', 3500),
  ('Ecouvillons', 'Swabs', 'ecouvillons', 'CONS-005', 'Ecouvillons', 5000),
  ('Gants Soins B/100', 'Gloves B/100', 'gants', 'CONS-006', 'Gants Soins B/100', 3000),
  ('Lamelles', 'Cover Slips', 'lamelles', 'CONS-007', 'Lamelles', 1500),
  ('Lames', 'Slides', 'lames', 'CONS-008', 'Lames', 1500),
  ('Pob à Selles/Urine', 'Stool/Urine Container', 'pob', 'CONS-009', 'Pob à selles /urine', 5000),
  ('Seringues 10cc', 'Syringes 10cc', 'seringues-10', 'CONS-010', 'Séringues 10cc', 3000),
  ('Seringues 50cc', 'Syringes 50cc', 'seringues-50', 'CONS-011', 'Séringues 50cc', 3000),
  ('Sparadrap', 'Adhesive Tape', 'sparadrap', 'CONS-012', 'Spardrap', 2000),
  ('Speculums', 'Speculums', 'speculums', 'CONS-013', 'Spéculums', 25000),
  ('Tubes à Hemolyse', 'Hemolysis Tubes', 'tubes-hemo', 'CONS-014', 'Tubes à hemolyse', 10000),
  ('Tubes Citrates', 'Citrate Tubes', 'tubes-cit', 'CONS-015', 'Tubes citrates', 7000),
  ('Tubes EDTA', 'EDTA Tubes', 'tubes-edta', 'CONS-016', 'Tubes EDTA', 5000),
  ('Tubes Heparinés', 'Heparin Tubes', 'tubes-hep', 'CONS-017', 'Tubes Heparinés', 7000),
  ('Tubes Secs', 'Dry Tubes', 'tubes-secs', 'CONS-018', 'Tubes secs', 5000),
  ('Taux d''Hb (Urit 12)', 'Hb Meter (Urit 12)', 'hb-urit', 'CONS-019', 'Taux d''hb(urit 12)', 9000),
  ('Poche à Sang 450cc', 'Blood Bag 450cc', 'poche-450', 'CONS-020', 'Poche a sang 450 cc', 5500),
  ('Glycémie Sino Care', 'Sino Care Glucometer', 'sino-care', 'CONS-021', 'Glycemie Sino care', 9000),
  ('Transfuseur', 'Transfusion Set', 'transfuseur', 'CONS-022', 'Transfuseur', 6000),
  ('Embout Jaune', 'Yellow Tip', 'embout-jaune', 'CONS-023', 'Embout jaune', 4000),
  ('Embout Bleu', 'Blue Tip', 'embout-bleu', 'CONS-024', 'Embout BLEU', 4000),
  ('Coton', 'Cotton', 'coton', 'CONS-025', 'COTON', 2500),
  ('Cryotubes 2ml', 'Cryotubes 2ml', 'cryotubes', 'CONS-026', 'Cryotubes (2ml)', 15000),
  ('Poche à Sang 250cc', 'Blood Bag 250cc', 'poche-250', 'CONS-027', 'Poche à sang 250c', 4000),
  ('Eau Distillée', 'Distilled Water', 'eau-dist', 'CONS-028', 'Eau distillée', 2000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'consommables-cat'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- COLORANTS
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
  ('Acide Chlorydrique', 'Hydrochloric Acid', 'acide-chlor', 'COL-001', 'Acide chloryldrique', 15000),
  ('Bleu de Methylène 1L', 'Methylene Blue 1L', 'bleu-meth', 'COL-002', 'Bleu de methylène 1L', 12000),
  ('Eau Physiologique 1L', 'Physiological Water 1L', 'eau-physio', 'COL-003', 'Eau physiologique 1L', 5000),
  ('Fuschine 1L', 'Fuchsin 1L', 'fuschine', 'COL-004', 'Fuschine 1L', 12000),
  ('Giemsa 1L', 'Giemsa 1L', 'giemsa', 'COL-005', 'Giemsa 1L', 12000),
  ('Huile à Immersion 100ml', 'Immersion Oil 100ml', 'huile-imm', 'COL-006', 'Huile à immersion 100ML', 8000),
  ('Lugol 1L', 'Lugol 1L', 'lugol', 'COL-007', 'Lugol 1L', 12000),
  ('Marcano 1L', 'Marcano 1L', 'marcano', 'COL-008', 'Marcano 1L', 12000),
  ('May Gumwandal 1L', 'May Grünwald 1L', 'may-gum', 'COL-009', 'May Gumwandal 1L', 12000),
  ('Violet de Gentiane 1L', 'Gentian Violet 1L', 'violet-gent', 'COL-010', 'Violet de gentiane 1L', 12000),
  ('Lyse', 'Lysis Solution', 'lyse', 'COL-011', 'Lyse', 45000)
) AS p(nom, nom_en, slug, reference, description, prix)
WHERE c.slug = 'colorants'
ON CONFLICT (slug) DO UPDATE SET
  prix = EXCLUDED.prix,
  updated_at = NOW();

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
