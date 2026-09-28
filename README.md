# binggge

Un suivi de séries : chercher une série, l'ajouter à sa liste, cocher les épisodes vus.

## Démarrer

```bash
docker compose up -d
cd api && npm install && npm start
```

L'API écoute sur le port 3000 par défaut, surchargeable avec la variable d'environnement `PORT`.

## Base de données

PostgreSQL 16 tourne dans un conteneur décrit par `docker-compose.yml`. Le volume `pgdata` garde les
données entre un `docker compose down` et un `docker compose up`.

Le schéma est versionné dans `api/db/schema.sql`. PostgreSQL l'applique tout seul à la création du volume.
Pour l'appliquer à un volume existant :

```bash
docker compose exec -T db psql -U postgres binggge < api/db/schema.sql
docker compose exec db psql -U postgres binggge -c "\dt"
```

## Routes existantes

- `GET /health` : état du service, `{ "status": "ok" }`.
- `GET /shows?q=` : recherche une série via TVMaze, renvoie une liste allégée (id, titre, année, image).
- `GET /watchlist` : renvoie la watchlist. Pour l'instant, toujours un tableau vide.

## Ce qui n'existe pas encore

- Authentification : aucune inscription, aucune identité.
- Watchlist en base : les tables existent, les routes ne les utilisent pas encore.
- Interface web.
- Déploiement.

## Tests

```bash
cd api && npm test
```

Les tests de la séance 2 sont pour l'instant à l'état `todo` : ils n'échouent pas mais ne vérifient rien encore.
