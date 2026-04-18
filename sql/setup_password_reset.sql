-- Configuration pour la réinitialisation de mot de passe Supabase Auth
-- Ce script configure les templates d'email pour la réinitialisation de mot de passe

-- Note: Ces configurations se font généralement via le Dashboard Supabase
-- dans Authentication > Email Templates

-- Template recommandé pour "Reset Password" :
/*
Subject: Réinitialisation de votre mot de passe ADS

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ADS (Angela Diagnostics & Services).

Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
{{ .ConfirmationURL }}

Ce lien est valide pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe ADS
*/

-- Configuration de l'URL de redirection (à configurer dans le Dashboard Supabase)
-- Site URL: http://localhost:3000 (en développement)
-- ou https://votredomaine.com (en production)

-- Redirect URLs à ajouter:
-- - http://localhost:3000/auth/reset-password
-- - https://votredomaine.com/auth/reset-password

-- Note: La fonction auth.resetPasswordForEmail() utilise automatiquement
-- le Site URL configuré dans Supabase avec le paramètre redirectTo
