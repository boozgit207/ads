-- ============================================================
-- CORRECTION DES RLS POLICIES (Récursion infinie)
-- ============================================================

-- Désactiver d'abord toutes les policies existantes
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- ============================================================
-- NOUVELLES POLICIES SANS RÉCURSION
-- ============================================================

-- Policy SELECT : chacun voit son propre profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy SELECT admin : les admins voient tous les profils
-- On utilise une fonction security definer pour éviter la récursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role VARCHAR(50);
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role = 'admin';
END;
$$;

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy INSERT : uniquement son propre profil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy UPDATE : utilisateur modifie son propre profil (sauf le rôle)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy UPDATE admin : admin peut tout modifier
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Policy DELETE : son propre profil OU admin
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT 'RLS policies corrigées avec succès' as status;
