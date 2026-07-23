# Aura — votre compagnon IA au quotidien

Aura est une application web (Next.js / TypeScript) proposant un assistant
IA conversationnel pensé pour un usage quotidien par tout le monde
(réponses instantanées, conseils bien-être et posture, organisation), avec
comptes utilisateurs et abonnements payants gérés par Stripe.

## Fonctionnalités

- **Landing page** présentant le produit et ses fonctionnalités (`/`)
- **Comptes utilisateurs** : inscription / connexion par email + mot de
  passe, session signée en cookie httpOnly (`/signup`, `/login`,
  `/api/auth/*`)
- **Chat IA en streaming**, propulsé par l'API Claude (Anthropic),
  réponse affichée mot par mot (`/chat`)
- **Quotas appliqués côté serveur** (pas seulement côté client) : invités
  5 messages/jour, plan Free 15/jour, Plus 300/jour, Pro illimité
- **Page d'abonnements** avec 3 plans (Free / Plus / Pro) et paiement via
  Stripe Checkout (`/pricing`)
- **Espace compte** (`/account`) affichant le plan actif, l'usage du jour
  et un accès au portail de facturation Stripe (annuler/changer de plan)
- **Webhook Stripe** pour synchroniser l'état des abonnements
  (`/api/webhook`)
- **SEO / partage** : Open Graph, `robots.txt`, `sitemap.xml`, favicon
- **Tests** (Vitest) sur la logique métier (plans, auth, quotas) et **CI**
  GitHub Actions (lint, typecheck, tests, build)

## Démarrage local

```bash
npm install
cp .env.example .env.local
# renseignez au minimum ANTHROPIC_API_KEY pour activer le vrai chat IA
npm run dev
```

L'application est accessible sur http://localhost:3000.

Sans `ANTHROPIC_API_KEY`, le chat fonctionne quand même en **mode démo**
(réponses statiques, diffusées en streaming) pour permettre de tester
l'interface sans clé API.

## Comptes & sessions

L'authentification est un système email + mot de passe minimal :
mots de passe hashés (scrypt), session signée par HMAC stockée dans un
cookie httpOnly (`lib/auth.ts`). Définissez `SESSION_SECRET` dans
`.env.local` en production — sans elle, un secret est généré et persisté
localement dans `data/.session-secret` (pratique en dev, à ne pas utiliser
tel quel en prod).

## Configurer Stripe (abonnements)

1. Créez un compte [Stripe](https://dashboard.stripe.com) (mode test suffit
   pour développer).
2. Créez deux produits récurrents ("Plus" à 9€/mois, "Pro" à 19€/mois) et
   copiez leurs `price_id` dans `STRIPE_PRICE_ID_PLUS` /
   `STRIPE_PRICE_ID_PRO`.
3. Copiez votre clé secrète dans `STRIPE_SECRET_KEY`.
4. Activez le [portail de facturation client](https://dashboard.stripe.com/settings/billing/portal)
   pour que `/account` puisse rediriger vers la gestion d'abonnement.
5. Pour tester les webhooks en local avec la Stripe CLI :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   puis copiez le secret affiché (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`.

En production, configurez un webhook Stripe pointant vers
`https://votre-domaine.com/api/webhook` et écoutant au minimum :
`checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`.

Souscrire à un plan payant nécessite d'être connecté (l'email du compte
est utilisé pour créer le client Stripe).

## Plans

| Plan   | Prix     | Messages/jour |
| ------ | -------- | ------------- |
| Invité | —        | 5             |
| Free   | Gratuit  | 15            |
| Plus   | 9€/mois  | 300           |
| Pro    | 19€/mois | Illimité      |

Les plans sont définis dans `lib/plans.ts`.

## Tests

```bash
npm test        # Vitest — logique métier (plans, auth, quotas)
npm run lint
npm run typecheck
npm run build
```

Le workflow `.github/workflows/ci.yml` exécute ces quatre étapes sur
chaque push/PR vers `main`.

## Stack technique

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) pour le chat IA (streaming)
- [Stripe](https://stripe.com/) pour les abonnements et le portail de facturation
- [Vitest](https://vitest.dev/) pour les tests unitaires

## Notes de production

- Le stockage des comptes, abonnés et compteurs d'usage (`lib/users.ts`,
  `lib/subscribers.ts`, `lib/usage.ts`) utilise de simples fichiers JSON
  locaux à des fins de démo/développement. Avant un déploiement en
  production, remplacez-les par une vraie base de données (Postgres,
  etc.) — le stockage fichier n'est pas adapté à plusieurs instances ou
  à une forte concurrence.
- `npm audit` signale des vulnérabilités connues sur la branche Next.js
  14.x (déjà sur la dernière version patch, `14.2.35`) ; les correctifs
  complets nécessitent Next.js 15/16, une montée de version majeure non
  effectuée ici pour ne pas casser l'App Router sans validation complète.
