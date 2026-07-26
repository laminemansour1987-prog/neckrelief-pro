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

## À personnaliser avant mise en ligne

- Remplacer `CONTACT_EMAIL` dans `assets/script.js` par votre vraie adresse email.
- Adapter les tarifs, textes et exemples de la démo (`Boutique Nadia`) à votre offre réelle.
