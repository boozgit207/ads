-- Ajouter la colonne nombre_avis à la table produits
ALTER TABLE produits ADD COLUMN IF NOT EXISTS nombre_avis INTEGER DEFAULT 0;
