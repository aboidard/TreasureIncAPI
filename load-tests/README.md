# Test de charge

Simule des joueurs simultanés sur l'API avec [k6](https://k6.io), lancé via Docker (`grafana/k6`).
Il vise **uniquement la stack Docker locale** : il crée un compte par joueur simulé et écrit des données de jeu.

Depuis Git Bash, à la racine du dépôt, la stack étant démarrée :

```bash
bash load-tests/run.sh <joueurs> [durée du palier, 5m par défaut]
THINK=1 bash load-tests/run.sh 1000
```

Variables : `THINK` (pause moyenne entre deux actions, 5 s), `RAMP` (durée de la montée en charge).

- `player-journey.js` : le parcours d'un joueur et les seuils (95 % des requêtes sous 500 ms, moins de 1 % d'erreurs).
- `run.sh` : contrôles préalables, lancement de k6, CPU et mémoire des conteneurs, erreurs dans les logs.
- `results/` : un dossier par lancement, non versionné.

Le script peut réussir (seuils respectés) alors que des requêtes échouent ou que les logs signalent des erreurs : lire le
rapport en entier.
