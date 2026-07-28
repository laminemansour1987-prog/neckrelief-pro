# Steady Press

Une ligne de **carnets de suivi imprimables** (douleur, migraine, posture, kiné, préparation de rendez-vous médical) vendue en téléchargement instantané sur Etsy.

Tout est déjà construit dans ce dépôt : les 6 produits finis en PDF, les images de fiches produit, et le texte des annonces prêt à coller.

---

## L'idée en 30 secondes

Tu vends un fichier PDF. Il n'y a pas de stock, pas d'expédition, pas de service client, pas de coût par vente. La marge est de l'ordre de 75 %.

Et surtout : **tu ne fais pas le marketing, Etsy le fait.** Les gens tapent « pain tracker printable » dans la barre de recherche d'Etsy et tombent sur ta fiche. C'est le seul montage qui satisfait vraiment ta contrainte « faible besoin marketing » — parce que le trafic est loué à une marketplace au lieu d'être construit.

Une fois les 7 annonces en ligne, il n'y a plus rien à faire pour qu'une vente ait lieu.

---

## Ce qui est déjà fait

| Dossier | Contenu |
|---|---|
| `dist/<produit>/*.pdf` | Les produits finis, en A4 **et** US Letter |
| `dist/<produit>/images/` | Les photos de fiche produit, `hero.png` en premier |
| `dist/complete-relief-bundle.zip` | Le lot des 6 produits, 12 PDF |
| `listings/*.md` | Titre, 13 tags, prix, description — à coller tel quel dans Etsy |
| `src/` | Le moteur qui génère tout ça |

67 pages uniques réparties sur 6 produits. Rien à dessiner, rien à rédiger.

**La suite est décrite pas à pas dans [BUSINESS-PLAN.md](BUSINESS-PLAN.md)** — économie unitaire réelle, plan de lancement sur 30 jours, projection de revenu honnête, et les démarches côté France.

---

## Régénérer les fichiers

```bash
npm run build      # PDF (A4 + US Letter) + images + ZIP du lot
npm run listings   # textes des annonces
npm run preview    # images seules, plus rapide quand on itère sur le design
```

Playwright et Chromium doivent être installés. Aucune autre dépendance.

## Ajouter un produit

Les produits sont des **données**, pas du code. Un produit est un objet dans `src/products.mjs` : un titre, une accroche, un prix, et une liste de pages faites de blocs (`table`, `checklist`, `scale`, `grid`, `lines`, `bodymap`…). Le moteur s'occupe de la mise en page, de la pagination, du sommaire et des deux formats papier.

C'est là qu'est le vrai levier : **une fois le moteur écrit, un nouveau produit coûte une heure au lieu d'une semaine.** C'est ce qui rend viable la seule stratégie qui marche sur Etsy — beaucoup d'annonces bien ciblées.

---

## Honnêteté sur ce que ça rapporte

Ce n'est pas une machine à 10 000 € par mois, et il faut le dire tout de suite.

« Revenu rapide + faible effort + faible marketing » plafonne mécaniquement le résultat : tu ne peux pas gagner beaucoup sans travailler beaucoup **ou** sans faire de marketing. Ce montage choisit délibérément le plafond bas et l'effort quasi nul.

Ordre de grandeur réaliste : quelques dizaines d'euros le premier mois, **150 à 400 € par mois vers le sixième mois** si tu étends le catalogue à une trentaine d'annonces. Le détail du calcul est dans le plan.

## Avertissement

Ces documents sont des outils de **suivi personnel**. Ils ne diagnostiquent rien et ne constituent pas un avis médical. Cette mention figure sur une page dédiée dans chaque PDF et dans chaque description d'annonce — ce n'est pas une formalité, c'est ce qui garde la boutique du bon côté des règles d'Etsy sur les produits de santé.
