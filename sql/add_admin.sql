-- ============================================================
-- AJOUTER UN ADMINISTRATEUR
-- ============================================================
-- Remplace l'ID par celui de l'utilisateur que tu veux passer admin
-- Tu peux trouver l'ID dans Supabase → Authentication → Users

-- Méthode 1 : Passer un utilisateur existant en admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'bebd4ceb-ea12-41e3-8ea4-b89b3bd9badd';
-- Remplace par l'ID de l'utilisateur

-- Méthode 2 : Passer un admin par email
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'fonkououmbebobo@gmail.com';

-- Vérifier le résultat
SELECT id, email, first_name, last_name, role FROM public.profiles WHERE role = 'admin';
