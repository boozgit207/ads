-- ============================================================
-- ADS - Angela Diagnostics & Services
-- Script SQL Partie 4 : Paiements & Reçus
-- ============================================================


-- ============================================================
-- 1. TYPES ENUM — Paiements
-- ============================================================

CREATE TYPE paiement_methode AS ENUM (
  'orange_money',     -- Orange Money
  'mtn_mobile_money', -- MTN Mobile Money
  'virement_bancaire',-- Virement bancaire
  'especes'           -- Espèces (paiement à la livraison)
);

CREATE TYPE paiement_statut AS ENUM (
  'en_attente',       -- paiement initié, pas encore confirmé
  'en_cours',         -- traitement en cours (API)
  'confirme',         -- paiement reçu et vérifié
  'echoue',           -- paiement échoué
  'annule',           -- annulé par le client
  'rembourse'         -- remboursé
);


-- ============================================================
-- 2. TABLE : paiements
--    Trace de chaque tentative de paiement
--    SÉCURITÉ CRITIQUE : jamais de suppression
-- ============================================================

CREATE TABLE paiements (

  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commande_id         UUID NOT NULL REFERENCES commandes(id) ON DELETE RESTRICT,
  -- ON DELETE RESTRICT : impossible de supprimer une commande avec des paiements

  -- Méthode et statut
  methode             paiement_methode NOT NULL,
  statut              paiement_statut NOT NULL DEFAULT 'en_attente',

  -- Montants
  montant             NUMERIC(12,2) NOT NULL,           -- montant attendu
  montant_recu        NUMERIC(12,2),                    -- montant réellement reçu

  -- Orange Money / MTN Money
  numero_payeur       VARCHAR(30),                      -- numéro OM/MTN du client
  reference_operateur VARCHAR(200),                     -- référence de la transaction chez l'opérateur
  code_confirmation   VARCHAR(100),                     -- code reçu par SMS
  transaction_id      VARCHAR(300),                     -- ID retourné par l'API

  -- Virement bancaire
  nom_banque          VARCHAR(200),
  numero_compte       VARCHAR(100),
  reference_virement  VARCHAR(200),
  date_virement       DATE,

  -- Validation admin
  valide_par          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  valide_le           TIMESTAMPTZ,
  note_validation     TEXT,

  -- Données brutes API (pour audit)
  reponse_api         JSONB,                            -- réponse complète de l'API

  -- Dates
  initie_le           TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirme_le         TIMESTAMPTZ,
  echoue_le           TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX idx_paiement_commande_id   ON paiements(commande_id);
CREATE INDEX idx_paiement_statut        ON paiements(statut);
CREATE INDEX idx_paiement_methode       ON paiements(methode);
CREATE INDEX idx_paiement_transaction   ON paiements(transaction_id);
CREATE INDEX idx_paiement_initie_le     ON paiements(initie_le DESC);
CREATE INDEX idx_paiement_reference_op  ON paiements(reference_operateur);

-- SÉCURITÉ CRITIQUE : les paiements ne peuvent jamais être supprimés
CREATE RULE no_delete_paiement AS ON DELETE TO paiements DO INSTEAD NOTHING;

COMMENT ON TABLE paiements IS 'Enregistrement immuable de toutes les transactions de paiement ADS';
COMMENT ON COLUMN paiements.reponse_api IS 'Réponse brute complète de l API de paiement, pour audit';


-- ============================================================
-- 3. TABLE : recus
--    Reçu généré après confirmation du paiement
-- ============================================================

CREATE TABLE recus (

  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_recu         VARCHAR(50) NOT NULL UNIQUE,     -- ex: RECU-ADS-2024-000001
  commande_id         UUID NOT NULL REFERENCES commandes(id) ON DELETE RESTRICT,
  paiement_id         UUID NOT NULL REFERENCES paiements(id) ON DELETE RESTRICT,

  -- Informations client (copiées au moment de l'émission)
  client_nom          VARCHAR(200) NOT NULL,
  client_prenom       VARCHAR(200),
  client_phone        VARCHAR(30) NOT NULL,
  client_email        VARCHAR(255),

  -- Montants
  sous_total          NUMERIC(12,2) NOT NULL,
  frais_livraison     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total               NUMERIC(12,2) NOT NULL,
  methode_paiement    paiement_methode NOT NULL,

  -- Statut du reçu
  est_valide          BOOLEAN NOT NULL DEFAULT TRUE,
  annule_le           TIMESTAMPTZ,
  annule_par          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  raison_annulation   TEXT,

  -- URL du PDF généré
  pdf_url             TEXT,

  -- Dates
  emis_le             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX idx_recu_numero       ON recus(numero_recu);
CREATE INDEX idx_recu_commande_id  ON recus(commande_id);
CREATE INDEX idx_recu_paiement_id  ON recus(paiement_id);
CREATE INDEX idx_recu_emis_le      ON recus(emis_le DESC);

CREATE RULE no_delete_recu AS ON DELETE TO recus DO INSTEAD NOTHING;

COMMENT ON TABLE recus IS 'Reçus de paiement générés après validation, immuables';


-- ============================================================
-- 4. TABLE : recu_items
--    Détail des produits dans le reçu (snapshot)
-- ============================================================

CREATE TABLE recu_items (

  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recu_id       UUID NOT NULL REFERENCES recus(id) ON DELETE RESTRICT,
  produit_nom   VARCHAR(300) NOT NULL,
  reference     VARCHAR(100),
  quantite      INTEGER NOT NULL,
  prix_unitaire NUMERIC(12,2) NOT NULL,
  prix_total    NUMERIC(12,2) NOT NULL

);

CREATE INDEX idx_recu_items_recu_id ON recu_items(recu_id);

COMMENT ON TABLE recu_items IS 'Lignes produits figées dans chaque reçu';


-- ============================================================
-- 5. TABLE : config_paiement
--    Informations bancaires et numéros OM/MTN de l'entreprise
--    (affichées au client lors du paiement)
-- ============================================================

CREATE TABLE config_paiement (

  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Orange Money
  om_numero             VARCHAR(30),
  om_nom_compte         VARCHAR(200),
  om_instructions       TEXT,
  om_instructions_en    TEXT,

  -- MTN Money
  mtn_numero            VARCHAR(30),
  mtn_nom_compte        VARCHAR(200),
  mtn_instructions      TEXT,
  mtn_instructions_en   TEXT,

  -- Virement bancaire
  banque_nom            VARCHAR(200),
  banque_iban           VARCHAR(100),
  banque_swift          VARCHAR(50),
  banque_numero_compte  VARCHAR(100),
  banque_nom_titulaire  VARCHAR(200),
  banque_instructions   TEXT,
  banque_instructions_en TEXT,

  -- Qui a modifié
  modifie_par           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()

);

-- Une seule ligne de configuration
INSERT INTO config_paiement (
  om_numero, om_nom_compte,
  mtn_numero, mtn_nom_compte,
  banque_nom, banque_nom_titulaire
) VALUES (
  '6XXXXXXXX', 'Angela Diagnostics & Services',
  '6XXXXXXXX', 'Angela Diagnostics & Services',
  'Nom de votre banque', 'Angela Diagnostics & Services'
);

COMMENT ON TABLE config_paiement IS 'Coordonnées de paiement ADS affichées au client (OM, MTN, virement)';


-- ============================================================
-- 6. ROW LEVEL SECURITY — Paiements
-- ============================================================

ALTER TABLE paiements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE recus            ENABLE ROW LEVEL SECURITY;
ALTER TABLE recu_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_paiement  ENABLE ROW LEVEL SECURITY;

-- Paiements : client connecté voit ses paiements
CREATE POLICY "paiement_select_own" ON paiements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM commandes c
      WHERE c.id = commande_id AND c.user_id = auth.uid()
    )
  );

-- Paiements : client peut créer un paiement
CREATE POLICY "paiement_insert_public" ON paiements
  FOR INSERT WITH CHECK (TRUE);

-- Paiements : admin accès total
CREATE POLICY "paiement_admin_all" ON paiements
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Reçus : client connecté voit ses reçus
CREATE POLICY "recu_select_own" ON recus
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM commandes c
      WHERE c.id = commande_id AND c.user_id = auth.uid()
    )
  );

-- Reçus : insertion via fonctions serveur
CREATE POLICY "recu_insert_open"  ON recus FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "recu_admin_all"    ON recus FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "recu_items_select_own" ON recu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recus r
      JOIN commandes c ON c.id = r.commande_id
      WHERE r.id = recu_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "recu_items_insert_open" ON recu_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "recu_items_admin"       ON recu_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Config paiement : lecture publique, écriture admin
CREATE POLICY "config_paiement_select_public" ON config_paiement FOR SELECT USING (TRUE);
CREATE POLICY "config_paiement_admin"         ON config_paiement FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));


-- ============================================================
-- 7. TRIGGERS — Paiements
-- ============================================================

CREATE TRIGGER trg_paiement_updated_at       BEFORE UPDATE ON paiements      FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_recu_updated_at           BEFORE UPDATE ON recus           FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_config_paiement_updated   BEFORE UPDATE ON config_paiement FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Génération automatique du numéro de reçu
CREATE OR REPLACE FUNCTION fn_generer_numero_recu()
RETURNS TRIGGER AS $$
DECLARE
  annee    TEXT;
  compteur INTEGER;
  numero   TEXT;
BEGIN
  annee := TO_CHAR(now(), 'YYYY');
  SELECT COUNT(*) + 1 INTO compteur
  FROM recus
  WHERE EXTRACT(YEAR FROM emis_le) = EXTRACT(YEAR FROM now());

  numero := 'RECU-ADS-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
  NEW.numero_recu := numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generer_numero_recu
  BEFORE INSERT ON recus
  FOR EACH ROW EXECUTE FUNCTION fn_generer_numero_recu();

-- Quand un paiement est confirmé : mettre à jour la commande
CREATE OR REPLACE FUNCTION fn_paiement_confirme()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'confirme' AND OLD.statut != 'confirme' THEN
    -- Mettre à jour la commande
    UPDATE commandes
    SET
      statut              = 'paiement_recu',
      paiement_confirme_le = now(),
      updated_at          = now()
    WHERE id = NEW.commande_id
      AND statut = 'en_attente';

    NEW.confirme_le := now();
  END IF;

  IF NEW.statut = 'echoue' THEN
    NEW.echoue_le := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_paiement_confirme
  BEFORE UPDATE OF statut ON paiements
  FOR EACH ROW EXECUTE FUNCTION fn_paiement_confirme();


-- ============================================================
-- 8. VUES — Paiements
-- ============================================================

-- Vue complète paiements + commandes pour l'admin
CREATE OR REPLACE VIEW v_paiements_admin AS
SELECT
  p.id,
  p.commande_id,
  c.numero_commande,
  c.client_nom,
  c.client_prenom,
  c.client_phone,
  p.methode,
  p.statut,
  p.montant,
  p.montant_recu,
  p.numero_payeur,
  p.reference_operateur,
  p.transaction_id,
  p.reference_virement,
  p.date_virement,
  p.valide_le,
  p.initie_le
FROM paiements p
JOIN commandes c ON c.id = p.commande_id
ORDER BY p.initie_le DESC;

-- Vue : résumé des paiements par méthode
CREATE OR REPLACE VIEW v_paiements_par_methode AS
SELECT
  methode,
  COUNT(*) FILTER (WHERE statut = 'confirme')     AS nb_confirmes,
  COUNT(*) FILTER (WHERE statut = 'en_attente')   AS nb_en_attente,
  COUNT(*) FILTER (WHERE statut = 'echoue')       AS nb_echoues,
  SUM(montant_recu) FILTER (WHERE statut = 'confirme') AS total_recu
FROM paiements
GROUP BY methode;

-- ============================================================
-- FIN PARTIE 4 — PAIEMENTS & REÇUS
-- ============================================================
