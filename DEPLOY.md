# Déployer Aura sur Vercel

Le projet est prêt à être déployé. Il ne reste que des étapes qui demandent
**votre** compte (Vercel, base de données, Stripe) — elles ne peuvent pas
être faites à votre place. Comptez ~5 minutes.

> **Pourquoi une base Postgres ?** En local, Aura utilise SQLite
> (`prisma/schema.prisma`). Sur Vercel, le système de fichiers est en
> lecture seule et éphémère : SQLite y échouerait dès la première
> inscription. Le déploiement utilise donc `prisma/schema.production.prisma`
> (PostgreSQL), branché automatiquement via `vercel.json`.

## Option A — Tout depuis le dashboard Vercel (le plus simple)

1. Allez sur https://vercel.com/new et connectez-vous (GitHub, GitLab…).
2. **Importez** le dépôt `laminemansour1987-prog/neckrelief-pro` et
   choisissez la branche `claude/global-ai-subscriptions-pbb90q`.
3. Avant de cliquer sur **Deploy**, ajoutez une base Postgres :
   onglet **Storage → Create Database → Postgres** (l'offre Vercel/Neon
   gratuite suffit). Vercel renseigne alors `DATABASE_URL` tout seul.
4. Dans **Settings → Environment Variables**, ajoutez au minimum :

   | Variable | Valeur |
   | --- | --- |
   | `DATABASE_URL` | (créée à l'étape 3, ou votre URL Postgres) |
   | `SESSION_SECRET` | une chaîne aléatoire — voir ci-dessous |
   | `ANTHROPIC_API_KEY` | votre clé Anthropic (sinon le chat reste en démo) |
   | `NEXT_PUBLIC_APP_URL` | l'URL finale, ex. `https://aura-xxx.vercel.app` |

   Pour Stripe (facultatif au premier déploiement) :
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `STRIPE_PRICE_ID_PLUS`, `STRIPE_PRICE_ID_PRO`,
   `STRIPE_PRICE_ID_PLUS_ANNUAL`, `STRIPE_PRICE_ID_PRO_ANNUAL`.

5. Cliquez **Deploy**. Le build lance `prisma db push` sur votre Postgres,
   crée les tables, puis `next build`. C'est en ligne.

Générer un `SESSION_SECRET` :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Option B — En ligne de commande (depuis votre machine, pas ce bac à sable)

```bash
npm i -g vercel
vercel login
vercel link           # sélectionnez / créez le projet
# Ajoutez les variables d'env (répétez pour chaque clé) :
vercel env add DATABASE_URL production
vercel env add SESSION_SECRET production
vercel env add ANTHROPIC_API_KEY production
vercel --prod         # build + déploiement
```

> Ce dépôt ne peut pas lancer `vercel` lui-même : l'environnement
> d'exécution bloque l'accès réseau à `vercel.com` (règle de sécurité).
> Ces commandes se lancent depuis votre poste.

## Après le déploiement

- **Webhook Stripe** : dans le dashboard Stripe, créez un endpoint vers
  `https://VOTRE-DOMAINE/api/webhook` écoutant
  `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, puis copiez le `whsec_...` dans
  `STRIPE_WEBHOOK_SECRET` et redéployez.
- **Portail de facturation** : activez-le sur
  https://dashboard.stripe.com/settings/billing/portal pour que
  `/account` fonctionne.
- Mettez à jour `NEXT_PUBLIC_APP_URL` avec l'URL définitive si vous
  ajoutez un domaine personnalisé.
