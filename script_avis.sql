-- ============================================================
-- ADS - Angela Diagnostics & Services
-- Script SQL Partie 5 : Avis, Commentaires & Notifications
-- VERSION MODIFIÉE : avis visibles immédiatement, admin peut supprimer
-- ============================================================


-- ============================================================
-- 1. TABLE : avis_produits
--    Commentaires et étoiles sur les produits
--    Visible publiquement IMMÉDIATEMENT (sans modération)
--    L'admin peut supprimer un avis si nécessaire
-- ============================================================

CREATE TABLE avis_produits (

  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produit_id      UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,

  -- Auteur : obligatoirement connecté pour laisser un avis
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contenu
  note            SMALLINT NOT NULL CHECK (note >= 1 AND note <= 5),
  titre           VARCHAR(200),
  commentaire     TEXT,

  -- Un utilisateur ne peut laisser qu'un seul avis par produit
  UNIQUE(produit_id, user_id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX idx_avis_produit_id ON avis_produits(produit_id);
CREATE INDEX idx_avis_user_id    ON avis_produits(user_id);
CREATE INDEX idx_avis_note       ON avis_produits(note);
CREATE INDEX idx_avis_created    ON avis_produits(created_at DESC);

COMMENT ON TABLE avis_produits IS 'Avis et étoiles des clients sur les produits (visibles immédiatement, supprimables par l admin)';


-- ============================================================
-- 2. FUNCTION : mise à jour automatique de updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. TRIGGER : mise à jour note_moyenne et nombre_avis
--    sur la table produits après chaque avis (tous les avis comptent)
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_note_produit()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE produits
  SET
    note_moyenne  = (
      SELECT COALESCE(AVG(note), 0)
      FROM avis_produits
      WHERE produit_id = COALESCE(NEW.produit_id, OLD.produit_id)
    ),
    nombre_avis   = (
      SELECT COUNT(*)
      FROM avis_produits
      WHERE produit_id = COALESCE(NEW.produit_id, OLD.produit_id)
    ),
    updated_at    = now()
  WHERE id = COALESCE(NEW.produit_id, OLD.produit_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_note_produit
  AFTER INSERT OR UPDATE OR DELETE ON avis_produits
  FOR EACH ROW EXECUTE FUNCTION fn_update_note_produit();

CREATE TRIGGER trg_avis_updated_at
  BEFORE UPDATE ON avis_produits
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ============================================================
-- 3. TABLE : notifications
--    Notifications pour l'admin (nouvelle commande, message...)
--    et pour le client (commande validée, annulée...)
-- ============================================================

CREATE TYPE notification_type AS ENUM (
  -- Notifications admin
  'nouvelle_commande',
  'paiement_recu',
  'nouveau_message_contact',
  'stock_faible',
  'rupture_stock',
  'nouvel_avis',
  -- Notifications client
  'commande_validee',
  'commande_expediee',
  'commande_livree',
  'commande_annulee',
  'reponse_message'
);

CREATE TYPE notification_destinataire AS ENUM ('admin', 'client');

CREATE TABLE notifications (

  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Destinataire
  destinataire    notification_destinataire NOT NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Si null + destinataire = 'admin' : notification pour tous les admins

  -- Contenu
  type            notification_type NOT NULL,
  titre           VARCHAR(300) NOT NULL,
  titre_en        VARCHAR(300),
  message         TEXT NOT NULL,
  message_en      TEXT,

  -- Lien associé (vers commande, produit, message...)
  lien            TEXT,
  reference_id    UUID,            -- ID de la commande, produit, etc.
  reference_type  VARCHAR(50),     -- 'commande', 'produit', 'message', etc.

  -- Statut
  est_lue         BOOLEAN NOT NULL DEFAULT FALSE,
  lue_le          TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX idx_notif_user_id      ON notifications(user_id, est_lue, created_at DESC);
CREATE INDEX idx_notif_destinataire ON notifications(destinataire, est_lue, created_at DESC);
CREATE INDEX idx_notif_type         ON notifications(type);
CREATE INDEX idx_notif_created      ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'Notifications temps réel pour admins et clients';


-- ============================================================
-- 4. TRIGGER : créer une notification à chaque nouvelle commande
-- ============================================================

CREATE OR REPLACE FUNCTION fn_notifier_nouvelle_commande()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    destinataire, type, titre, titre_en,
    message, message_en,
    reference_id, reference_type
  ) VALUES (
    'admin',
    'nouvelle_commande',
    'Nouvelle commande reçue',
    'New order received',
    'La commande ' || NEW.numero_commande || ' de ' || NEW.client_nom || ' (' || NEW.total_commande || ' FCFA) attend votre traitement.',
    'Order ' || NEW.numero_commande || ' from ' || NEW.client_nom || ' (' || NEW.total_commande || ' FCFA) is waiting for processing.',
    NEW.id,
    'commande'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notifier_nouvelle_commande
  AFTER INSERT ON commandes
  FOR EACH ROW EXECUTE FUNCTION fn_notifier_nouvelle_commande();


-- ============================================================
-- 5. TRIGGER : notifier le client quand sa commande change de statut
-- ============================================================

CREATE OR REPLACE FUNCTION fn_notifier_statut_commande()
RETURNS TRIGGER AS $$
BEGIN
  -- Notifier seulement si le statut a changé et si le client a un compte
  IF NEW.statut != OLD.statut AND NEW.user_id IS NOT NULL THEN

    INSERT INTO notifications (
      destinataire, user_id, type, titre, titre_en,
      message, message_en, reference_id, reference_type
    )
    SELECT
      'client',
      NEW.user_id,
      CASE NEW.statut
        WHEN 'paiement_recu'   THEN 'commande_validee'
        WHEN 'expediee'        THEN 'commande_expediee'
        WHEN 'livree'          THEN 'commande_livree'
        WHEN 'annulee'         THEN 'commande_annulee'
        ELSE 'commande_validee'
      END::notification_type,
      CASE NEW.statut
        WHEN 'paiement_recu'   THEN 'Paiement confirmé !'
        WHEN 'expediee'        THEN 'Commande expédiée'
        WHEN 'livree'          THEN 'Commande livrée'
        WHEN 'annulee'         THEN 'Commande annulée'
        ELSE 'Mise à jour de votre commande'
      END,
      CASE NEW.statut
        WHEN 'paiement_recu'   THEN 'Payment confirmed!'
        WHEN 'expediee'        THEN 'Order shipped'
        WHEN 'livree'          THEN 'Order delivered'
        WHEN 'annulee'         THEN 'Order cancelled'
        ELSE 'Your order was updated'
      END,
      CASE NEW.statut
        WHEN 'paiement_recu'   THEN 'Votre paiement pour la commande ' || NEW.numero_commande || ' a été confirmé. Merci pour votre confiance !'
        WHEN 'expediee'        THEN 'Votre commande ' || NEW.numero_commande || ' est en route vers vous.'
        WHEN 'livree'          THEN 'Votre commande ' || NEW.numero_commande || ' a été livrée. Bonne utilisation !'
        WHEN 'annulee'         THEN 'Votre commande ' || NEW.numero_commande || ' a été annulée. ' || COALESCE('Raison : ' || NEW.raison_annulation, '')
        ELSE 'Votre commande ' || NEW.numero_commande || ' a été mise à jour.'
      END,
      NULL,
      NEW.id,
      'commande';

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notifier_statut_commande
  AFTER UPDATE OF statut ON commandes
  FOR EACH ROW EXECUTE FUNCTION fn_notifier_statut_commande();


-- ============================================================
-- 6. TRIGGER : notifier l'admin d'un stock faible
-- ============================================================

CREATE OR REPLACE FUNCTION fn_notifier_stock_faible()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut vient de passer à stock_faible ou rupture_stock
  IF NEW.statut IN ('stock_faible', 'rupture_stock')
     AND OLD.statut NOT IN ('stock_faible', 'rupture_stock') THEN

    INSERT INTO notifications (
      destinataire, type, titre, titre_en,
      message, message_en, reference_id, reference_type
    ) VALUES (
      'admin',
      CASE NEW.statut
        WHEN 'stock_faible'    THEN 'stock_faible'
        WHEN 'rupture_stock'   THEN 'rupture_stock'
      END::notification_type,
      CASE NEW.statut
        WHEN 'stock_faible'    THEN 'Stock faible : ' || NEW.nom
        WHEN 'rupture_stock'   THEN 'RUPTURE DE STOCK : ' || NEW.nom
      END,
      CASE NEW.statut
        WHEN 'stock_faible'    THEN 'Low stock: ' || COALESCE(NEW.nom_en, NEW.nom)
        WHEN 'rupture_stock'   THEN 'OUT OF STOCK: ' || COALESCE(NEW.nom_en, NEW.nom)
      END,
      'Le produit ' || NEW.nom || ' (Réf: ' || COALESCE(NEW.reference, 'N/A') || ') a ' || NEW.quantite_stock || ' unité(s) restante(s).',
      NULL,
      NEW.id,
      'produit'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notifier_stock_faible
  AFTER UPDATE OF statut ON produits
  FOR EACH ROW EXECUTE FUNCTION fn_notifier_stock_faible();


-- ============================================================
-- 7. TRIGGER : notifier l'admin d'un nouveau message de contact
-- ============================================================
-- Désactivé : la table contact_messages n'existe pas encore
-- À activer après création de la table contact_messages

/*
CREATE OR REPLACE FUNCTION fn_notifier_nouveau_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    destinataire, type, titre, titre_en,
    message, message_en, reference_id, reference_type
  ) VALUES (
    'admin',
    'nouveau_message_contact',
    'Nouveau message de ' || NEW.sender_name,
    'New message from ' || NEW.sender_name,
    COALESCE(NEW.subject, 'Sans objet') || ' — ' || LEFT(NEW.message, 100) || '...',
    NULL,
    NEW.id,
    'message'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notifier_nouveau_message
  AFTER INSERT ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION fn_notifier_nouveau_message();
*/


-- ============================================================
-- 8. TRIGGER : notifier l'admin d'un nouvel avis publié
-- ============================================================

CREATE OR REPLACE FUNCTION fn_notifier_nouvel_avis()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    destinataire, type, titre, titre_en,
    message, message_en, reference_id, reference_type
  )
  SELECT
    'admin',
    'nouvel_avis',
    'Nouvel avis publié (' || NEW.note || '/5)',
    'New review posted (' || NEW.note || '/5)',
    'Un client a laissé un avis sur : ' || p.nom || '. Note : ' || NEW.note || '/5.',
    NULL,
    NEW.id,
    'avis'
  FROM produits p WHERE p.id = NEW.produit_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notifier_nouvel_avis
  AFTER INSERT ON avis_produits
  FOR EACH ROW EXECUTE FUNCTION fn_notifier_nouvel_avis();


-- ============================================================
-- 9. ROW LEVEL SECURITY — Avis & Notifications
-- ============================================================

ALTER TABLE avis_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- AVIS : tout le monde peut lire tous les avis
-- ----------------------------------------------------------
CREATE POLICY "avis_select_public" ON avis_produits
  FOR SELECT USING (TRUE);

-- Utilisateur connecté peut créer un avis (1 seul par produit via UNIQUE)
CREATE POLICY "avis_insert_connected" ON avis_produits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Utilisateur peut modifier son propre avis
CREATE POLICY "avis_update_own" ON avis_produits
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Utilisateur peut supprimer son propre avis
CREATE POLICY "avis_delete_own" ON avis_produits
  FOR DELETE USING (auth.uid() = user_id);

-- Admin peut supprimer n'importe quel avis
CREATE POLICY "avis_delete_admin" ON avis_produits
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ----------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------

-- Chaque utilisateur voit ses propres notifs client
CREATE POLICY "notif_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Admin voit toutes les notifs admin
CREATE POLICY "notif_select_admin" ON notifications
  FOR SELECT USING (
    destinataire = 'admin' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Insertion ouverte (via triggers SECURITY DEFINER)
CREATE POLICY "notif_insert_open" ON notifications
  FOR INSERT WITH CHECK (TRUE);

-- Utilisateur peut marquer ses notifs comme lues
CREATE POLICY "notif_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admin peut marquer les notifs admin comme lues
CREATE POLICY "notif_update_admin" ON notifications
  FOR UPDATE USING (
    destinataire = 'admin' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin peut supprimer des notifications
CREATE POLICY "notif_delete_admin" ON notifications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ============================================================
-- 10. VUES — Avis & Notifications
-- ============================================================

-- Vue avis avec infos utilisateur pour l'admin (tous les avis)
CREATE OR REPLACE VIEW v_avis_admin AS
SELECT
  a.id,
  a.produit_id,
  pr.nom                                              AS produit_nom,
  a.user_id,
  p.first_name || ' ' || COALESCE(p.last_name, '')   AS client_nom,
  a.note,
  a.titre,
  a.commentaire,
  a.created_at,
  a.updated_at
FROM avis_produits a
JOIN produits pr ON pr.id = a.produit_id
JOIN profiles  p  ON p.id  = a.user_id
ORDER BY a.created_at DESC;

-- Vue avis publics pour le site (tous visibles immédiatement)
CREATE OR REPLACE VIEW v_avis_public AS
SELECT
  a.id,
  a.produit_id,
  a.note,
  a.titre,
  a.commentaire,
  p.first_name                                        AS client_prenom,
  LEFT(COALESCE(p.last_name, ''), 1) || '.'           AS client_initiale,
  a.created_at
FROM avis_produits a
JOIN profiles p ON p.id = a.user_id
ORDER BY a.created_at DESC;

-- Vue notifications non lues pour l'admin
CREATE OR REPLACE VIEW v_notifications_admin_non_lues AS
SELECT *
FROM notifications
WHERE destinataire = 'admin' AND est_lue = FALSE
ORDER BY created_at DESC;

-- ============================================================
-- FIN PARTIE 5 — AVIS & NOTIFICATIONS
-- ============================================================