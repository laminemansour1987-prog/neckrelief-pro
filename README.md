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
- **Base de données réelle** (Prisma + SQLite) pour les comptes, abonnés
  et compteurs d'usage, avec écritures atomiques
- **SEO / partage** : Open Graph, `robots.txt`, `sitemap.xml`, favicon
- **Tests** (Vitest) sur la logique métier (plans, auth, quotas) et **CI**
  GitHub Actions (lint, typecheck, tests, build)
- **Dockerfile** pour un déploiement auto-hébergé

## Démarrage local

```bash
npm install                 # installe aussi Prisma Client (postinstall)
cp .env.example .env.local
npx prisma db push          # crée prisma/dev.db à partir du schéma
# renseignez au minimum ANTHROPIC_API_KEY pour activer le vrai chat IA
npm run dev
```

L'application est accessible sur http://localhost:3000.

Sans `ANTHROPIC_API_KEY`, le chat fonctionne quand même en **mode démo**
(réponses statiques, diffusées en streaming) pour permettre de tester
l'interface sans clé API.

## Base de données

Les comptes (`User`), abonnements (`Subscriber`) et compteurs d'usage
quotidiens (`UsageCounter`) sont stockés via [Prisma](https://www.prisma.io/)
(schéma dans `prisma/schema.prisma`). En local/démo, le provider est
**SQLite** (`prisma/dev.db`, ignoré par git) — zéro configuration requise.

Pour passer sur une vraie base de production (Postgres, MySQL…) :

1. Changez `provider = "sqlite"` en `provider = "postgresql"` (ou `mysql`)
   dans `prisma/schema.prisma`.
2. Pointez `DATABASE_URL` vers votre instance (ex: Neon, Supabase, RDS).
3. Relancez `npx prisma db push` (ou passez à `prisma migrate` pour des
   migrations versionnées).

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
npm test        # Vitest — logique métier (plans, auth, quotas), sur la vraie DB
npm run lint
npm run typecheck
npm run build
```

Le workflow `.github/workflows/ci.yml` exécute (dans l'ordre) lint,
typecheck, `prisma db push` sur une base SQLite éphémère, tests, puis
build, sur chaque push/PR vers `main`.

## Déploiement avec Docker

```bash
docker build -t aura-ai .
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e SESSION_SECRET=... \
  -e STRIPE_SECRET_KEY=... \
  -v aura-data:/app/prisma \
  aura-ai
```

Le `Dockerfile` construit l'app en production et exécute `prisma db push`
au démarrage du conteneur pour garder le schéma SQLite à jour. Montez un
volume sur `/app/prisma` pour que les données survivent aux redémarrages.
Pour un déploiement multi-instances, passez à Postgres (voir section
« Base de données ») plutôt que SQLite sur volume.

> Ce Dockerfile suit le pattern standard Next.js + Prisma mais n'a pas pu
> être testé par un vrai build Docker dans cet environnement (pas de
> daemon Docker disponible ici) — à valider avant un déploiement réel.

## Stack technique

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) pour le chat IA (streaming)
- [Stripe](https://stripe.com/) pour les abonnements et le portail de facturation
- [Prisma](https://www.prisma.io/) + SQLite pour la persistance
- [Vitest](https://vitest.dev/) pour les tests unitaires

## Notes de production

- SQLite convient pour une démo ou un déploiement mono-instance ; pour
  plusieurs instances/serverless, passez à Postgres (voir « Base de
  données » ci-dessus).
- `npm audit` signale des vulnérabilités connues sur la branche Next.js
  14.x (déjà sur la dernière version patch, `14.2.35`) ; les correctifs
  complets nécessitent Next.js 15/16, une montée de version majeure non
  effectuée ici pour ne pas casser l'App Router sans validation complète.
