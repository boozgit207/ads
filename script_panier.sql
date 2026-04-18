-- ============================================================
-- ADS - Angela Diagnostics & Services
-- Script SQL Partie 3 : Commandes & Panier
-- VERSION CORRIGÉE : types ENUM déclarés une seule fois
-- ============================================================

-- ============================================================
-- 0. SUPPRESSION & RECRÉATION DES TYPES (une seule fois)
-- ============================================================

DROP TYPE IF EXISTS user_gender        CASCADE;
DROP TYPE IF EXISTS livraison_type     CASCADE;
DROP TYPE IF EXISTS paiement_methode   CASCADE;
DROP TYPE IF EXISTS commande_statut    CASCADE;

CREATE TYPE user_gender AS ENUM (
  'male',
  'female',
  'not_specified'
);

CREATE TYPE livraison_type AS ENUM (
  'livraison_domicile',
  'retrait_magasin',
  'expedition'
);

CREATE TYPE paiement_methode AS ENUM (
  'orange_money',
  'mtn_money',
  'virement_bancaire'
);

CREATE TYPE commande_statut AS ENUM (
  'en_attente',        -- commande reçue, paiement non encore confirmé
  'paiement_recu',     -- paiement confirmé par l'admin
  'en_preparation',    -- en cours de préparation
  'expediee',          -- envoyée au client
  'livree',            -- livrée et confirmée
  'annulee',           -- annulée par le client ou l'admin
  'remboursee'         -- remboursée
);


-- ============================================================
-- 1. TABLE : paniers
--    Panier persistant pour les clients connectés
--    Pour les anonymes : géré côté client (localStorage)
--    et envoyé à la commande
-- ============================================================

CREATE TABLE paniers (

  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- UNIQUE : un seul panier actif par utilisateur connecté
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX idx_panier_user_id ON paniers(user_id);

COMMENT ON TABLE paniers IS 'Panier persistant des clients connectés (un seul par utilisateur)';


-- ============================================================
-- 2. TABLE : panier_items
--    Lignes du panier (produit + quantité)
-- ============================================================

CREATE TABLE panier_items (

  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panier_id       UUID NOT NULL REFERENCES paniers(id) ON DELETE CASCADE,
  produit_id      UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  quantite        INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
  -- Prix sauvegardé au moment de l'ajout (le prix peut changer)
  prix_unitaire   NUMERIC(12,2) NOT NULL,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un produit ne peut apparaître qu'une fois par panier
  UNIQUE(panier_id, produit_id)

);

CREATE INDEX idx_panier_items_panier_id  ON panier_items(panier_id);
CREATE INDEX idx_panier_items_produit_id ON panier_items(produit_id);

COMMENT ON TABLE panier_items IS 'Produits dans le panier de chaque client connecté';


-- ============================================================
-- 3. TABLE : clients_anonymes
--    Informations temporaires des clients non connectés
-- ============================================================

CREATE TABLE clients_anonymes (

  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom             VARCHAR(200) NOT NULL,
  prenom          VARCHAR(200),
  phone           VARCHAR(30) NOT NULL,
  email           VARCHAR(255),
  gender          user_gender DEFAULT 'not_specified',

  -- Adresse
  adresse         TEXT,
  ville           VARCHAR(100),
  pays            VARCHAR(100) DEFAULT 'Cameroun',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX idx_clients_anonymes_phone ON clients_anonymes(phone);
CREATE INDEX idx_clients_anonymes_email ON clients_anonymes(email);

COMMENT ON TABLE clients_anonymes IS 'Informations temporaires des clients non connectés (commandes sans compte)';


-- ============================================================
-- 4. TABLE : commandes
--    Une commande = un client (connecté ou anonyme) + produits
-- ============================================================

CREATE TABLE commandes (

  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_commande       VARCHAR(50) NOT NULL UNIQUE,  -- ex: ADS-2024-000001

  -- Client : soit connecté soit anonyme (l'un des deux est renseigné)
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_anonyme_id     UUID REFERENCES clients_anonymes(id) ON DELETE SET NULL,

  -- Informations client copiées au moment de la commande
  -- (car le client peut modifier son profil après)
  client_nom            VARCHAR(200) NOT NULL,
  client_prenom         VARCHAR(200),
  client_phone          VARCHAR(30)  NOT NULL,
  client_email          VARCHAR(255),
  client_gender         user_gender  DEFAULT 'not_specified',

  -- Adresse de livraison
  adresse_livraison     TEXT,
  ville_livraison       VARCHAR(100),
  pays_livraison        VARCHAR(100) DEFAULT 'Cameroun',

  -- Livraison
  type_livraison        livraison_type    NOT NULL DEFAULT 'livraison_domicile',
  frais_livraison       NUMERIC(12,2)     NOT NULL DEFAULT 0,

  -- Prix
  sous_total            NUMERIC(12,2) NOT NULL,   -- total produits HT
  total_commande        NUMERIC(12,2) NOT NULL,   -- sous_total + frais_livraison

  -- Paiement
  methode_paiement      paiement_methode NOT NULL,
  statut                commande_statut  NOT NULL DEFAULT 'en_attente',

  -- Notes
  note_client           TEXT,   -- note laissée par le client
  note_admin            TEXT,   -- note interne admin

  -- Notification
  notification_envoyee  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Dates clés
  commande_le           TIMESTAMPTZ NOT NULL DEFAULT now(),
  paiement_confirme_le  TIMESTAMPTZ,
  expediee_le           TIMESTAMPTZ,
  livree_le             TIMESTAMPTZ,
  annulee_le            TIMESTAMPTZ,
  annulee_par           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  raison_annulation     TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contrainte : une commande doit avoir au moins un client
  CONSTRAINT chk_client CHECK (
    user_id IS NOT NULL OR client_anonyme_id IS NOT NULL
  )

);

CREATE INDEX idx_commande_numero       ON commandes(numero_commande);
CREATE INDEX idx_commande_user_id      ON commandes(user_id, commande_le DESC);
CREATE INDEX idx_commande_anonyme_id   ON commandes(client_anonyme_id);
CREATE INDEX idx_commande_statut       ON commandes(statut, commande_le DESC);
CREATE INDEX idx_commande_methode      ON commandes(methode_paiement);
CREATE INDEX idx_commande_commande_le  ON commandes(commande_le DESC);

COMMENT ON TABLE commandes IS 'Commandes passées par les clients (connectés ou anonymes)';
COMMENT ON COLUMN commandes.numero_commande IS 'Format : ADS-AAAA-NNNNNN, généré automatiquement';


-- ============================================================
-- 4. TABLE : commande_items
--    Lignes d'une commande (produit + quantité + prix figé)
-- ============================================================

CREATE TABLE commande_items (

  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commande_id       UUID NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id        UUID REFERENCES produits(id) ON DELETE SET NULL,

  -- Données du produit copiées au moment de la commande
  -- (le produit peut être modifié ou supprimé après)
  produit_nom       VARCHAR(300) NOT NULL,
  produit_reference VARCHAR(100),
  produit_image_url TEXT,
  produit_unite     VARCHAR(50),

  quantite          INTEGER      NOT NULL CHECK (quantite > 0),
  prix_unitaire     NUMERIC(12,2) NOT NULL,   -- prix au moment de la commande
  prix_total        NUMERIC(12,2) NOT NULL,   -- prix_unitaire * quantite

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX idx_commande_items_commande_id ON commande_items(commande_id);
CREATE INDEX idx_commande_items_produit_id  ON commande_items(produit_id);

COMMENT ON TABLE commande_items IS 'Détail des produits dans chaque commande';


-- ============================================================
-- 5. TABLE : config_livraison
--    Prix de livraison configurable par l'admin
-- ============================================================

CREATE TABLE config_livraison (

  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  frais_livraison_domicile  NUMERIC(12,2) NOT NULL DEFAULT 1500,  -- en FCFA
  livraison_gratuite_min    NUMERIC(12,2),   -- montant min pour livraison gratuite (NULL = jamais gratuite)
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  modifie_par               UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()

);

-- Insérer la config par défaut
INSERT INTO config_livraison (frais_livraison_domicile, livraison_gratuite_min)
VALUES (1500, NULL);

COMMENT ON TABLE config_livraison IS 'Configuration du prix de livraison (modifiable par l admin)';


-- ============================================================
-- 6. ROW LEVEL SECURITY — Commandes
-- ============================================================

ALTER TABLE paniers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE panier_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE commande_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_livraison ENABLE ROW LEVEL SECURITY;

-- Panier : chaque client ne voit que le sien
CREATE POLICY "panier_select_own" ON paniers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "panier_insert_own" ON paniers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "panier_update_own" ON paniers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "panier_delete_own" ON paniers FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "panier_items_own" ON panier_items FOR ALL USING (
  EXISTS (SELECT 1 FROM paniers p WHERE p.id = panier_id AND p.user_id = auth.uid())
);

-- Commandes : client connecté voit ses commandes
CREATE POLICY "commande_select_own" ON commandes
  FOR SELECT USING (user_id = auth.uid());

-- Commandes : tout le monde peut créer (client connecté ou anonyme)
CREATE POLICY "commande_insert_public" ON commandes
  FOR INSERT WITH CHECK (TRUE);

-- Admin : accès total aux commandes
CREATE POLICY "commande_admin_all" ON commandes
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Items commande : client connecté voit les siens
CREATE POLICY "commande_items_select_own" ON commande_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM commandes c WHERE c.id = commande_id AND c.user_id = auth.uid())
  );

-- Items commande : insertion ouverte (lors de la création de commande)
CREATE POLICY "commande_items_insert_public" ON commande_items
  FOR INSERT WITH CHECK (TRUE);

-- Items commande : admin accès total
CREATE POLICY "commande_items_admin" ON commande_items
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Config livraison : lecture publique, écriture admin uniquement
CREATE POLICY "config_livraison_select_public" ON config_livraison
  FOR SELECT USING (TRUE);

CREATE POLICY "config_livraison_admin" ON config_livraison
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));


-- ============================================================
-- 7. FONCTIONS & TRIGGERS — Commandes
-- ============================================================

-- Fonction utilitaire pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Génération automatique du numéro de commande
CREATE OR REPLACE FUNCTION fn_generer_numero_commande()
RETURNS TRIGGER AS $$
DECLARE
  annee     TEXT;
  compteur  INTEGER;
  numero    TEXT;
BEGIN
  annee := TO_CHAR(now(), 'YYYY');

  SELECT COUNT(*) + 1 INTO compteur
  FROM commandes
  WHERE EXTRACT(YEAR FROM commande_le) = EXTRACT(YEAR FROM now());

  numero := 'ADS-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
  NEW.numero_commande := numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generer_numero_commande
  BEFORE INSERT ON commandes
  FOR EACH ROW EXECUTE FUNCTION fn_generer_numero_commande();

-- Triggers updated_at
CREATE TRIGGER trg_commande_updated_at
  BEFORE UPDATE ON commandes
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_panier_updated_at
  BEFORE UPDATE ON paniers
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_panier_items_updated_at
  BEFORE UPDATE ON panier_items
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_config_livraison_updated
  BEFORE UPDATE ON config_livraison
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- Mise à jour stock et nombre_ventes lors de la validation d'une commande
CREATE OR REPLACE FUNCTION fn_valider_commande_stock()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Seulement quand le statut passe à 'paiement_recu'
  IF NEW.statut = 'paiement_recu' AND OLD.statut = 'en_attente' THEN

    FOR item IN
      SELECT ci.produit_id, ci.quantite
      FROM commande_items ci
      WHERE ci.commande_id = NEW.id
    LOOP
      -- Déduire du stock
      UPDATE produits
      SET
        quantite_stock = quantite_stock - item.quantite,
        nombre_ventes  = nombre_ventes  + item.quantite,
        updated_at     = now()
      WHERE id = item.produit_id;

      -- Enregistrer le mouvement de stock
      INSERT INTO stock_mouvements (
        produit_id, type, quantite,
        quantite_avant, quantite_apres,
        reference_doc, note
      )
      SELECT
        item.produit_id,
        'sortie_vente',
        -item.quantite,
        quantite_stock + item.quantite,
        quantite_stock,
        NEW.numero_commande,
        'Vente validée - commande ' || NEW.numero_commande
      FROM produits WHERE id = item.produit_id;
    END LOOP;

    NEW.paiement_confirme_le := now();
  END IF;

  -- Statut annulée : remettre en stock si paiement avait été confirmé
  IF NEW.statut = 'annulee' AND OLD.statut = 'paiement_recu' THEN

    FOR item IN
      SELECT ci.produit_id, ci.quantite
      FROM commande_items ci
      WHERE ci.commande_id = NEW.id
    LOOP
      UPDATE produits
      SET
        quantite_stock = quantite_stock + item.quantite,
        nombre_ventes  = GREATEST(nombre_ventes - item.quantite, 0),
        updated_at     = now()
      WHERE id = item.produit_id;

      INSERT INTO stock_mouvements (
        produit_id, type, quantite,
        quantite_avant, quantite_apres,
        reference_doc, note
      )
      SELECT
        item.produit_id,
        'retour',
        item.quantite,
        quantite_stock - item.quantite,
        quantite_stock,
        NEW.numero_commande,
        'Retour stock - annulation commande ' || NEW.numero_commande
      FROM produits WHERE id = item.produit_id;
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_valider_commande_stock
  BEFORE UPDATE OF statut ON commandes
  FOR EACH ROW EXECUTE FUNCTION fn_valider_commande_stock();


-- ============================================================
-- 8. VUES — Commandes
-- ============================================================

-- Vue complète des commandes pour l'admin
CREATE OR REPLACE VIEW v_commandes_admin AS
SELECT
  c.id,
  c.numero_commande,
  c.client_nom,
  c.client_prenom,
  c.client_phone,
  c.client_email,
  c.type_livraison,
  c.frais_livraison,
  c.sous_total,
  c.total_commande,
  c.methode_paiement,
  c.statut,
  c.note_client,
  c.note_admin,
  c.commande_le,
  c.paiement_confirme_le,
  c.expediee_le,
  c.livree_le,
  c.annulee_le,
  c.raison_annulation,
  -- Nombre de produits dans la commande
  (SELECT COUNT(*) FROM commande_items ci WHERE ci.commande_id = c.id) AS nb_produits,
  -- Type client
  CASE WHEN c.user_id IS NOT NULL THEN 'connecte' ELSE 'anonyme' END AS type_client
FROM commandes c
ORDER BY c.commande_le DESC;

-- Vue : commandes du client connecté
CREATE OR REPLACE VIEW v_mes_commandes AS
SELECT
  c.id,
  c.numero_commande,
  c.statut,
  c.total_commande,
  c.methode_paiement,
  c.type_livraison,
  c.frais_livraison,
  c.commande_le,
  c.paiement_confirme_le,
  c.livree_le
FROM commandes c
WHERE c.user_id = auth.uid()
ORDER BY c.commande_le DESC;

-- ============================================================
-- FIN PARTIE 3 — COMMANDES & PANIER
-- ============================================================