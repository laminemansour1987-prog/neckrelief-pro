# Aura — votre compagnon IA au quotidien

Aura est une application web (Next.js / TypeScript) proposant un assistant
IA conversationnel pensé pour un usage quotidien par tout le monde
(réponses instantanées, conseils bien-être et posture, organisation), avec
des abonnements payants gérés par Stripe.

## Fonctionnalités

- **Landing page** présentant le produit et ses fonctionnalités (`/`)
- **Chat IA** propulsé par l'API Claude (Anthropic), avec limite quotidienne
  de messages pour le plan gratuit (`/chat`)
- **Page d'abonnements** avec 3 plans (Free / Plus / Pro) et paiement via
  Stripe Checkout (`/pricing`)
- **Webhook Stripe** pour synchroniser l'état des abonnements
  (`/api/webhook`)

## Démarrage local

```bash
npm install
cp .env.example .env.local
# renseignez au minimum ANTHROPIC_API_KEY pour activer le vrai chat IA
npm run dev
```

L'application est accessible sur http://localhost:3000.

Sans `ANTHROPIC_API_KEY`, le chat fonctionne quand même en **mode démo**
(réponses statiques) pour permettre de tester l'interface sans clé API.

## Configurer Stripe (abonnements)

1. Créez un compte [Stripe](https://dashboard.stripe.com) (mode test suffit
   pour développer).
2. Créez deux produits récurrents ("Plus" à 9€/mois, "Pro" à 19€/mois) et
   copiez leurs `price_id` dans `STRIPE_PRICE_ID_PLUS` /
   `STRIPE_PRICE_ID_PRO`.
3. Copiez votre clé secrète dans `STRIPE_SECRET_KEY`.
4. Pour tester les webhooks en local avec la Stripe CLI :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   puis copiez le secret affiché (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`.

En production, configurez un webhook Stripe pointant vers
`https://votre-domaine.com/api/webhook` et écoutant au minimum :
`checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`.

## Plans

| Plan | Prix    | Messages/jour |
| ---- | ------- | ------------- |
| Free | Gratuit | 15            |
| Plus | 9€/mois | 300           |
| Pro  | 19€/mois| Illimité      |

Les plans sont définis dans `lib/plans.ts`.

## Stack technique

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) pour le chat IA
- [Stripe](https://stripe.com/) pour les abonnements

## Notes de production

Le stockage des abonnés (`lib/subscribers.ts`) utilise un simple fichier
JSON local à des fins de démo/développement. Avant un déploiement en
production, remplacez-le par une vraie base de données (Postgres, etc.).
