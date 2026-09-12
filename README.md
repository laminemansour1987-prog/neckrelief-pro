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
- **Prise de rendez-vous 100% automatique et sans double-booking** : l'agent
  calcule lui-meme les prochains creneaux reellement disponibles (horaires
  de travail configurables, capacite du/des technicien(s), delai minimum
  selon l'urgence) et les propose au client sous forme de boutons a un clic.
  Un creneau choisi dans la liste est confirme immediatement, sans aucune
  validation manuelle. Un horaire tape librement est marque "a confirmer"
  pour ne solliciter le plombier que sur les cas reellement ambigus.
- **Notifications automatiques** : des qu'une demande arrive, le tableau de
  bord admin l'affiche en temps reel (flux SSE, sans rafraichissement
  manuel) avec un signal sonore et une notification navigateur. Si les
  identifiants sont configures, un email est aussi envoye automatiquement
  au plombier et un SMS de confirmation au client.
- **Tableau de bord admin** : compteurs en un coup d'oeil (total, du jour,
  urgentes, a confirmer), liste des demandes, filtres par statut et
  urgence, mise a jour du statut (nouveau, a confirmer, confirme, en cours,
  termine, annule).
- **Reponses enrichies par Claude (optionnel)** : si une cle
  `ANTHROPIC_API_KEY` est fournie, les reponses de l'agent sont reformulees
  de maniere plus naturelle par Claude, tout en restant fondees sur les
  faits calcules cote serveur (aucune information inventee). Sans cle, des
  reponses pre-redigees de qualite sont utilisees.

Objectif : le plombier n'a rien a faire tant que le creneau propose convient
au client — il n'intervient que pour les demandes marquees "a confirmer" ou
pour passer un rendez-vous en "en cours"/"termine" une fois le travail fait.

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
server.js               Serveur Express + routes API + flux temps reel (SSE)
src/plumbingKnowledge.js Base de connaissances des pannes (urgence, prix, conseils)
src/calendar.js          Calcul des creneaux disponibles (anti double-booking)
src/agent.js             Agent conversationnel (machine a etats de la conversation)
src/llm.js               Reformulation optionnelle des reponses via l'API Claude
src/notify.js            Notifications temps reel + email admin + SMS client
src/store.js             Persistance des rendez-vous (fichier JSON)
public/                  Interface client (chat) et interface admin
```

## API

- `POST /api/chat` `{ sessionId, message }` -> `{ reply, appointment, issue, step, quickReplies }`
- `GET /api/appointments` (header `x-admin-token`) -> liste des demandes
- `PATCH /api/appointments/:id` `{ status }` (header `x-admin-token`) -> met a
  jour le statut d'une demande
- `GET /api/stats` (header `x-admin-token`) -> compteurs (total, du jour, par
  statut, par urgence)
- `GET /api/events?token=...` -> flux SSE emettant un evenement `appointment`
  a chaque nouvelle demande (utilise par le tableau de bord)

## Automatisation complete (pour ne plus rien faire manuellement)

1. Renseignez `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `ADMIN_EMAIL` dans
   `.env` pour recevoir un email a chaque nouvelle demande, meme sans avoir
   le tableau de bord ouvert (compatible avec la plupart des boites mail,
   y compris Gmail via un mot de passe d'application).
2. Renseignez `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER`
   pour que le client recoive un SMS de confirmation automatique des que son
   creneau est valide.
3. Laissez le tableau de bord (`/admin.html`) ouvert dans un onglet : le son
   et la notification navigateur signalent toute nouvelle demande en direct.
4. Ajustez `WORK_START_HOUR`, `WORK_END_HOUR`, `SLOT_HOURS` et
   `MAX_CONCURRENT_JOBS` a votre organisation reelle : l'agent ne proposera
   et ne confirmera jamais plus de rendez-vous que vous ne pouvez en honorer.

## Limites connues (prototype)

- Les conversations sont conservees en memoire process (pas de scalabilite
  multi-instance) ; les rendez-vous sont persistes dans `data/appointments.json`.
- Le tableau de bord utilise un jeton partage simple, adapte a un usage
  interne/prototype plutot qu'a une authentification multi-utilisateurs.
- Sans configuration SMTP/Twilio, les notifications restent disponibles en
  temps reel dans le tableau de bord mais pas par email/SMS.
