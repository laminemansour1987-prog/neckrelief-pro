# neckrelief-pro

## Predicteur de produits gagnants (France)

Outil pour reperer quel produit a des chances de « faire fureur » en France
**avant** qu'il n'explose vraiment, en combinant deux signaux :

1. **Google Trends France** — detecte une acceleration precoce des recherches
   (un produit qui commence a monter alors qu'il n'est pas encore sature),
   et remonte les recherches "en hausse" liees a une niche pour trouver des
   idees emergentes avant tout le monde.
2. **Scorecard « produit gagnant »** — grille d'evaluation manuelle (probleme
   resolu, effet wahou, marge, saturation, logistique, preuve sociale...)
   pour juger un produit meme sans historique de recherche.

Les deux signaux sont combines en un score final /100 avec une classification
(🔥 Fort potentiel / 🟡 A surveiller / 🟠 Incertain / ⚪ Faible potentiel).

### Installation

```bash
pip install -r requirements.txt
```

### Dashboard (interface web)

```bash
streamlit run app.py
```

Onglets disponibles :
- **Analyse d'un produit** : score complet (Trends + scorecard) + graphique
  de la courbe de recherche sur 12 mois.
- **Scorecard seul** : evaluation rapide sans appel reseau.
- **Analyse en masse (CSV)** : importe une liste de produits (`sample_products.csv`
  fournit un exemple) et exporte les resultats tries par score.
- **Idees emergentes** : entre une niche large (ex. "douleur cervicale") pour
  voir les recherches associees qui montent en ce moment en France.

### Ligne de commande

```bash
python batch_analyze.py sample_products.csv --out resultats.csv
```

### Notes

- Google Trends n'exige pas de cle API mais peut occasionnellement bloquer les
  requetes automatisees (quota, IP). Si Google Trends est indisponible,
  l'outil bascule automatiquement sur le scorecard manuel et l'indique
  clairement dans les resultats.
- Le score n'est qu'une aide a la decision : valide toujours un produit avec
  un vrai test (petite campagne pub, precommandes...) avant d'investir en
  stock.
