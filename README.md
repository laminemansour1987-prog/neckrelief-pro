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

## À personnaliser avant mise en ligne

- **Important** : remplacer `WHATSAPP_NUMBER` dans `assets/script.js` par votre vrai numéro
  (format international sans "+" ni espaces, ex: `213555123456`) — tous les boutons
  "Discuter sur WhatsApp" en dépendent.
- Remplacer `CONTACT_EMAIL` dans `assets/script.js` par votre vraie adresse email.
- Adapter les tarifs, textes et exemples de la démo (`Boutique Nadia`) à votre offre réelle.
- Les mentions Yalidine / ZR Express / Maystro Delivery (FAQ et réassurance sous les tarifs)
  sont à ajuster selon les transporteurs que vous intégrez réellement.
