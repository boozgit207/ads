# Configuration des Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env.local` à la racine du projet :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_public
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Cloudinary Configuration (pour les images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Comment obtenir ces clés

### 1. Supabase URL et Anon Key
Dans votre dashboard Supabase :
- Project Settings → API
- Copier **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copier **Project API keys** → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Supabase Service Role Key (OBLIGATOIRE pour les server actions)
Dans votre dashboard Supabase :
- Project Settings → API → Project API keys
- Copier **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT** : Cette clé a tous les droits ! Ne la partagez jamais publiquement.

### 3. Cloudinary Credentials
- Créer un compte sur https://cloudinary.com
- Dashboard → Account Details
- Copier :
  - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
  - **API Key** → `CLOUDINARY_API_KEY`
  - **API Secret** → `CLOUDINARY_API_SECRET`

## Après modification
Redémarrez le serveur Next.js :
```bash
npm run dev
```
