# Agent IA Plomberie

Application web autonome qui gere de bout en bout les demandes de plomberie :
un agent conversationnel diagnostique la panne, evalue son urgence, donne une
estimation tarifaire et prend rendez-vous, tandis qu'un tableau de bord admin
permet de suivre et traiter toutes les demandes recues.

## Fonctionnalites

- **Diagnostic automatique** : l'agent reconnait les pannes les plus
  courantes (fuite, canalisation bouchee, chauffe-eau/chaudiere en panne,
  baisse de pression, mauvaises odeurs, installation sanitaire, etc.).
- **Evaluation de l'urgence** : classement en 4 niveaux (urgente, rapide,
  normale, planifiable) avec delai d'intervention recommande et consignes de
  securite immediates (ex : couper l'eau en cas de degat des eaux).
- **Devis indicatif instantane** pour chaque type de panne.
- **Prise de rendez-vous conversationnelle** : nom, telephone, adresse,
  creneau souhaite, avec generation d'une reference de suivi.
- **Tableau de bord admin** : liste des demandes, filtres par statut et
  urgence, mise a jour du statut (nouveau, confirme, en cours, termine,
  annule).
- **Reponses enrichies par Claude (optionnel)** : si une cle
  `ANTHROPIC_API_KEY` est fournie, les reponses de l'agent sont reformulees
  de maniere plus naturelle par Claude, tout en restant fondees sur les
  faits calcules cote serveur (aucune information inventee). Sans cle, des
  reponses pre-redigees de qualite sont utilisees.

## Demarrage

```bash
npm install
cp .env.example .env   # puis ajustez les valeurs si besoin
npm start
```

L'application est disponible sur `http://localhost:3000` :

- `/` : chat client pour decrire un probleme de plomberie
- `/admin.html` : tableau de bord (jeton defini par `ADMIN_TOKEN`, `changeme`
  par defaut)

## Architecture

```
server.js               Serveur Express + routes API
src/plumbingKnowledge.js Base de connaissances des pannes (urgence, prix, conseils)
src/agent.js             Agent conversationnel (machine a etats de la conversation)
src/llm.js               Reformulation optionnelle des reponses via l'API Claude
src/store.js             Persistance des rendez-vous (fichier JSON)
public/                  Interface client (chat) et interface admin
```

## API

- `POST /api/chat` `{ sessionId, message }` -> `{ reply, appointment, issue, step }`
- `GET /api/appointments` (header `x-admin-token`) -> liste des demandes
- `PATCH /api/appointments/:id` `{ status }` (header `x-admin-token`) -> met a
  jour le statut d'une demande

## Limites connues (prototype)

- Les conversations sont conservees en memoire process (pas de scalabilite
  multi-instance) ; les rendez-vous sont persistes dans `data/appointments.json`.
- Le tableau de bord utilise un jeton partage simple, adapte a un usage
  interne/prototype plutot qu'a une authentification multi-utilisateurs.
