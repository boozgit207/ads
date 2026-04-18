# Configuration Stripe pour ADS

## 1. Installation des dépendances

```bash
npm install
```

## 2. Variables d'environnement

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Pour la production, utilisez vos clés live :
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. Configuration du Webhook

En local, installez Stripe CLI :
```bash
# Forwarder les webhooks vers localhost
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

En production, configurez le webhook dans le Dashboard Stripe :
- URL : `https://votredomaine.com/api/payments/stripe/webhook`
- Événements à écouter :
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

## 4. Activation de Stripe

Par défaut, les paiements par carte bancaire sont maintenant disponibles sur la page de checkout.

## Sécurité

- Les clés API ne sont jamais exposées côté client
- Les webhooks sont vérifiés avec la signature Stripe
- Les paiements utilisent 3D Secure pour les cartes Européennes
- Stripe gère la conformité PCI DSS

## Test

Utilisez ces numéros de carte pour tester :
- **Succès** : `4242 4242 4242 4242`
- **3D Secure** : `4000 0025 0000 3155`
- **Échec** : `4000 0000 0000 9995`
