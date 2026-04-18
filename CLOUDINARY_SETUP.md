# Configuration Cloudinary

## Variables d'environnement à ajouter dans .env.local

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Comment obtenir ces credentials

1. Créer un compte sur [Cloudinary](https://cloudinary.com)
2. Aller dans Dashboard → Account Details
3. Copier:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## Dossiers recommandés dans Cloudinary

- `ads/products/` - Images des produits
- `ads/laboratories/` - Logos des laboratoires
- `ads/categories/` - Images des catégories
- `ads/documents/` - Documents (notices, fiches techniques)

## Utilisation dans le code

```typescript
import { uploadImage, deleteImage } from '@/app/admin/actions/cloudinary';

// Upload une image
const result = await uploadImage(fileBuffer, 'ads/products', 'mon-produit');
console.log(result.secure_url); // URL de l'image uploadée

// Supprimer une image
await deleteImage('ads/products/mon-produit-123456');
```

## Formulaire avec upload d'image

Voir les pages produits et le composant de modal pour l'exemple d'intégration.
