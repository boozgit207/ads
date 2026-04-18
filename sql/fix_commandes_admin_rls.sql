-- =====================================================
-- CORRECTION RLS POUR ADMIN COMMANDES
-- Ce script permet au service role de bypass RLS
-- =====================================================

-- 1. Vérifier les politiques existantes sur la table commandes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'commandes';

-- 2. Créer une politique pour permettre au service role tout accès
-- Cette politique bypass toutes les restrictions pour le service role
DROP POLICY IF EXISTS "Service role full access on commandes" ON public.commandes;

CREATE POLICY "Service role full access on commandes" ON public.commandes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Créer une politique similaire pour commande_items
DROP POLICY IF EXISTS "Service role full access on commande_items" ON public.commande_items;

CREATE POLICY "Service role full access on commande_items" ON public.commande_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. S'assurer que RLS est activé sur les tables
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commande_items ENABLE ROW LEVEL SECURITY;

-- 5. Forcer RLS même pour le propriétaire de la table (sécurité renforcée)
ALTER TABLE public.commandes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.commande_items FORCE ROW LEVEL SECURITY;

-- 6. Accorder les permissions nécessaires au rôle authentifié (lecture de ses propres commandes)
-- Vérifier si une politique existe déjà pour les utilisateurs authentifiés

-- Politique pour que les users voient leurs propres commandes
DROP POLICY IF EXISTS "Users can view their own orders" ON public.commandes;

CREATE POLICY "Users can view their own orders" ON public.commandes
    FOR SELECT
    TO authenticated
    USING (
        utilisateur_id = auth.uid() 
        OR client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Politique pour que les users créent leurs propres commandes
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.commandes;

CREATE POLICY "Users can insert their own orders" ON public.commandes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        utilisateur_id = auth.uid() 
        OR client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- 7. Vérifier le résultat
SELECT 
    'Politiques commandes:' as info,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'commandes';

SELECT 
    'Politiques commande_items:' as info,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'commande_items';
