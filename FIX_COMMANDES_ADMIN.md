# 🔧 Fix Commandes Admin

## Problème : Les commandes ne s'affichent pas dans l'admin

### Cause probable
La clé `SUPABASE_SERVICE_ROLE_KEY` n'est pas configurée ou les politiques RLS bloquent l'accès.

---

## Solution 1 : Ajouter la clé Service Role

### Étape 1 : Récupérer la clé sur Supabase
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **Project Settings** → **API**
4. Copiez la clé **service_role** (PAS la anon !)

### Étape 2 : Ajouter à .env.local
```env
# Clés existantes (déjà présentes)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon

# NOUVELLE CLÉ À AJOUTER
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_ici
```

### Étape 3 : Redémarrer le serveur
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

---

## Solution 2 : Corriger les politiques RLS

Si la clé est déjà configurée mais que ça ne marche toujours pas, exécutez le script SQL :

```bash
# Fichier : sql/fix_commandes_admin_rls.sql
```

Dans l'éditeur SQL de Supabase :
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une **New query**
5. Copiez-collez le contenu de `sql/fix_commandes_admin_rls.sql`
6. Cliquez sur **Run**

---

## Vérification

### 1. Vérifiez la console du navigateur
Ouvrez les outils de développement (F12) → Console :
- ✅ Si vous voyez "SUPABASE_SERVICE_ROLE_KEY présente" → La clé est configurée
- ❌ Si vous voyez "SUPABASE_SERVICE_ROLE_KEY manquante" → Ajoutez-la dans .env.local

### 2. Vérifiez les logs serveur
Dans le terminal où tourne Next.js, vous devriez voir :
```
🔍 Récupération des commandes admin...
📊 Nombre total de commandes: 5 Erreur: null
✅ Commandes récupérées: 5
```

---

## Résultat attendu

Après correction :
- Les commandes s'affichent dans `/admin/commandes`
- Les stats se mettent à jour
- Vous pouvez valider/annuler les commandes

---

## Support

Si le problème persiste après ces étapes :
1. Vérifiez que vous avez bien redémarré le serveur après modification de `.env.local`
2. Vérifiez que vous utilisez bien la bonne URL Supabase
3. Vérifiez que la table `commandes` existe bien dans votre base de données
