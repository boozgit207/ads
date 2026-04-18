-- Ajouter la colonne reference_paiement pour stocker la référence de paiement externe
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS reference_paiement VARCHAR(100);

-- Créer un index pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_commandes_reference_paiement ON commandes(reference_paiement);
