-- ============================================================
-- FIX RLS pour la table commandes
-- Permettre aux utilisateurs de créer leurs commandes
-- ============================================================

-- Activer RLS sur la table commandes
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs authentifiés peuvent créer leurs propres commandes
CREATE POLICY "Utilisateurs peuvent créer leurs commandes"
  ON commandes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Politique : Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Utilisateurs peuvent voir leurs commandes"
  ON commandes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Politique : Les admins peuvent tout faire
CREATE POLICY "Admins peuvent tout faire sur commandes"
  ON commandes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Politique pour commande_items (les articles de commande)
ALTER TABLE commande_items ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les articles de leurs commandes
CREATE POLICY "Utilisateurs peuvent voir leurs commande_items"
  ON commande_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM commandes 
      WHERE commandes.id = commande_items.commande_id 
      AND commandes.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des articles pour leurs commandes
CREATE POLICY "Utilisateurs peuvent créer leurs commande_items"
  ON commande_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM commandes 
      WHERE commandes.id = commande_items.commande_id 
      AND commandes.user_id = auth.uid()
    )
  );

-- Les admins peuvent tout faire sur commande_items
CREATE POLICY "Admins peuvent tout faire sur commande_items"
  ON commande_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
