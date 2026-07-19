# neckrelief-pro

## Predicteur de produits gagnants (France)

Outil pour reperer quel produit a des chances de « faire fureur » en France
**avant** qu'il n'explose vraiment, en combinant trois signaux :

1. **Google Trends France** — detecte une acceleration precoce des recherches
   (un produit qui commence a monter alors qu'il n'est pas encore sature), et
   projette la courbe sur les prochaines semaines (regression lineaire avec
   indice de confiance).
2. **Signal international** — beaucoup de produits explosent d'abord aux
   Etats-Unis / Royaume-Uni / Allemagne avant d'arriver en France. L'outil
   compare la France a ces marches, detecte quand un produit est deja en
   forte hausse a l'etranger pendant que la France est encore plate, et
   estime le decalage (en semaines) via une correlation croisee.
3. **Scorecard « produit gagnant »** — grille d'evaluation manuelle (probleme
   resolu, effet wahou, marge, saturation, logistique, preuve sociale...)
   pour juger un produit meme sans historique de recherche.

Les trois signaux sont combines (poids ajustables) en un score final /100 avec
une classification (🔥 Fort potentiel / 🟡 A surveiller / 🟠 Incertain /
⚪ Faible potentiel). Chaque analyse est enregistree dans un historique local
(`watchlist.db`) pour suivre l'evolution du score dans le temps — le vrai
signal se confirme souvent sur plusieurs semaines.

Une analyse qualitative optionnelle par IA (Claude) peut aussi generer, pour
chaque produit, une conclusion honnete sur son potentiel et un angle
marketing concret a tester.

Le dashboard est un **service par abonnement multi-clients** : chaque
personne cree un compte (14 jours d'essai gratuit). Chaque client ne voit que
ses propres analyses.

### Installation

```bash
pip install -r requirements.txt
```

### Faire payer tes clients — la methode simple (rien a configurer)

Tu n'as besoin de RIEN configurer pour commencer a vendre l'acces des
aujourd'hui :

1. Le client va sur le dashboard et cree son compte (14 jours d'essai
   gratuit automatique).
2. Il te paie comme tu veux (virement, especes, Lydia, autre outil...).
3. Tu tapes une seule commande pour lui donner l'acces :

```bash
python manage_clients.py list                              # voir tous les clients
python manage_clients.py activer client@example.com         # lui donner l'acces apres paiement
python manage_clients.py prolonger client@example.com --jours 30   # offrir plus d'essai gratuit
python manage_clients.py desactiver client@example.com      # couper l'acces
```

C'est tout. Pas de compte Stripe, pas de serveur de webhook, rien.

### (Optionnel, plus tard) Automatiser les paiements avec Stripe

Si un jour tu veux que le paiement et l'activation se fassent tout seuls
(carte bancaire, prelevement automatique), tu peux configurer Stripe. C'est
une etape a faire toi-meme (compte Stripe = identite legale/bancaire du
vendeur, cet outil ne peut pas la creer a ta place) :

0. `cp .env.example .env` puis remplis les cles au fur et a mesure des
   etapes suivantes.
1. Cree un compte sur [dashboard.stripe.com](https://dashboard.stripe.com).
2. Dans **Produits**, cree un produit "Predicteur de produits gagnants" avec
   un prix recurrent mensuel et/ou annuel. Copie les **Price ID**
   (`price_...`) dans `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_YEARLY`.
3. Dans **Developpeurs > Cles API**, copie la cle secrete dans
   `STRIPE_SECRET_KEY`.
4. Lance le serveur de webhook (voir ci-dessous), puis dans
   **Developpeurs > Webhooks**, ajoute un endpoint vers
   `https://ton-domaine/stripe/webhook` ecoutant :
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copie le "Signing secret" dans
   `STRIPE_WEBHOOK_SECRET`.
5. En local, teste sans domaine public avec le
   [Stripe CLI](https://stripe.com/docs/stripe-cli) :
   `stripe listen --forward-to localhost:8000/stripe/webhook`.

```bash
# le dashboard (les clients l'utilisent)
streamlit run app.py

# le serveur de webhook (recoit les evenements Stripe, a heberger separement,
# accessible depuis Internet en production)
uvicorn webhook_server:app --host 0.0.0.0 --port 8000
```

Sans cles Stripe, l'app fonctionne quand meme : les comptes profitent de leur
essai gratuit de 14 jours, puis l'ecran d'abonnement affiche un message
indiquant que le paiement n'est pas encore configure.

Optionnel — analyse qualitative par IA : renseigne `ANTHROPIC_API_KEY` dans
`.env`. Sans cette variable, l'outil fonctionne normalement, simplement sans
le commentaire IA.

### Dashboard (interface web)

```bash
streamlit run app.py
```

La premiere visite demande de se connecter ou de creer un compte. Une fois
connecte (essai gratuit ou abonnement actif), onglets disponibles :
- **Analyse d'un produit** : score complet (Trends France + signal
  international + scorecard, poids ajustables), projection a 4 semaines,
  graphique France vs pays de comparaison, et analyse IA optionnelle.
- **Scorecard seul** : evaluation rapide sans appel reseau.
- **Analyse en masse (CSV)** : importe une liste de produits
  (`sample_products.csv` fournit un exemple) et exporte les resultats tries
  par score.
- **Radar d'opportunites** : entre plusieurs niches (une par ligne) et
  plusieurs pays, l'outil remonte les recherches "en hausse" associees —
  souvent les futurs produits gagnants, avant meme qu'ils soient recherches
  en masse en France.
- **Historique** : suit l'evolution du score de chaque produit analyse au
  fil du temps (prive a chaque compte client).

La barre laterale affiche le statut du compte (essai/abonnement, jours
restants) avec un lien vers le portail Stripe pour gerer/annuler
l'abonnement, et un bouton de deconnexion.

### Ligne de commande

Le script CLI est independant des comptes clients (usage interne, pas de
notion d'abonnement) :

```bash
python batch_analyze.py sample_products.csv --out resultats.csv
python batch_analyze.py sample_products.csv --international --ai --out resultats.csv
```

### Tests

```bash
pytest tests/
```

Verifie la logique de scoring (vitesse de recherche, signal international,
projection, scorecard, historique) et la gestion des comptes clients
(inscription, connexion, essai gratuit, statut d'abonnement) avec des
donnees synthetiques, sans dependre du reseau ni de Stripe.

### Notes

- Google Trends n'exige pas de cle API mais peut occasionnellement bloquer les
  requetes automatisees (quota, IP). Si Google Trends est indisponible,
  l'outil bascule automatiquement sur le scorecard manuel et l'indique
  clairement dans les resultats.
- Le signal international multiplie les requetes reseau (une par pays) : sur
  l'analyse en masse, il est desactive par defaut pour rester rapide.
- Le score n'est qu'une aide a la decision : valide toujours un produit avec
  un vrai test (petite campagne pub, precommandes...) avant d'investir en
  stock.
- La connexion est geree par session Streamlit (pas de cookie persistant) :
  un client doit se reconnecter s'il ferme completement son onglet/navigateur.
- `webhook_server.py` doit tourner en continu (a cote du dashboard) pour que
  les paiements Stripe activent automatiquement les comptes ; sans lui, un
  client qui paie ne sera jamais marque comme abonne.
