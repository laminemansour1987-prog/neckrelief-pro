# DZ Automation IA

Site vitrine et démo pour un service d'intégration IA / automatisation destiné aux
entreprises et e-commerçants en Algérie (WhatsApp, chatbots service client,
confirmation de commande COD, automatisation de tâches internes).

## Structure

- `index.html` — page principale (services, démo interactive, tarifs, contact)
- `assets/style.css` — styles
- `assets/script.js` — logique de la démo de chat (simulation hors-ligne) et du formulaire de contact (envoi par mailto)

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier avec un serveur statique :

```bash
python3 -m http.server 8000
```

Puis aller sur `http://localhost:8000`.

## Identité visuelle

Palette "console d'exploitation" : fond noir chaud / papier crème, accent marigold,
pastilles vert de garde pour les statuts. Typographies : Fraunces (titres), Work Sans
(texte courant), IBM Plex Mono (prix, horodatages, tags) — chargées via Google Fonts,
avec repli sur les polices système si hors-ligne. Thèmes clair et sombre gérés via
variables CSS (`prefers-color-scheme` + bouton de bascule en haut à droite).

## Bilingue FR / AR

Le site bascule intégralement entre français (LTR) et arabe (RTL) via le bouton
en haut à droite de la navigation — layout, calculette, et démo de chat inclus
(le bot répond en arabe si la question est posée en arabe). Toutes les chaînes
sont centralisées dans l'objet `I18N` en tête de `assets/script.js` : chaque clé
a une paire `{ fr, ar }`. Pour ajouter un texte traduisible, ajoutez une entrée
dans `I18N` et un attribut `data-i18n="votre.clé"` sur l'élément HTML.

## Calculette de perte

Section `#calculateur` : à partir de 3 chiffres saisis par le visiteur (commandes
COD/mois, % d'annulation, panier moyen), elle affiche la perte mensuelle estimée.
C'est un calcul arithmétique direct sur les chiffres de l'utilisateur — aucun taux
de récupération n'est inventé ou promis.

## À personnaliser avant mise en ligne

- **Important** : remplacer `WHATSAPP_NUMBER` dans `assets/script.js` par votre vrai numéro
  (format international sans "+" ni espaces, ex: `213555123456`) — tous les boutons
  "Discuter sur WhatsApp" en dépendent.
- Remplacer `CONTACT_EMAIL` dans `assets/script.js` par votre vraie adresse email.
- Adapter les tarifs, textes et exemples de la démo (`Boutique Nadia`) à votre offre réelle.
- Les mentions Yalidine / ZR Express / Maystro Delivery (FAQ et réassurance sous les tarifs)
  sont à ajuster selon les transporteurs que vous intégrez réellement.
