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

### Installation

```bash
pip install -r requirements.txt
```

Optionnel — analyse qualitative par IA :

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Sans cette variable, l'outil fonctionne normalement, simplement sans le
commentaire IA.

### Dashboard (interface web)

```bash
streamlit run app.py
```

Onglets disponibles :
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
  fil du temps.

### Ligne de commande

```bash
python batch_analyze.py sample_products.csv --out resultats.csv
python batch_analyze.py sample_products.csv --international --ai --out resultats.csv
```

### Tests

```bash
pytest tests/
```

Verifie la logique de scoring (vitesse de recherche, signal international,
projection, scorecard, historique) avec des donnees synthetiques, sans
dependre du reseau.

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
