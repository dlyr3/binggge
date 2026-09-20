# binggge

Un suivi de séries : chercher une série, l'ajouter à sa liste, cocher les épisodes vus.

## Démarrer

```bash
cd api && npm install
npm start
```

L'API écoute sur le port 3000 par défaut, surchargeable avec la variable d'environnement `PORT`.

## Routes existantes

`GET /health` — état du service.

`GET /shows?q=` — recherche une série via TVMaze, renvoie une liste allégée (id, titre, année, image).

`GET /watchlist` — renvoie la watchlist. Pour l'instant, toujours un tableau vide.

## Ce qui n'existe pas encore

- Base de données : la watchlist ne survit pas encore à un redémarrage.
- Authentification : aucune, pas d'inscription ni de connexion.
- Ajouter ou cocher une série dans la watchlist.
- Interface web.
- Déploiement.

## Tests

```bash
cd api && npm test
```

Les tests de la séance 2 sont pour l'instant à l'état `todo`, ils n'échouent pas mais ne vérifient rien encore.
