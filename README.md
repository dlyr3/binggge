# binggge

Un suivi de séries : chercher une série, l'ajouter à sa liste, cocher les épisodes vus.

## Démarrer

```bash
cp .env.example .env && docker compose up -d
cd api && npm install && npm start
```

L'API écoute sur le port 3000 par défaut, surchargeable avec la variable d'environnement `PORT`.
Elle joint la base via `DATABASE_URL`, lue dans le fichier `.env` à la racine (jamais versionné).

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
- `POST /register` : crée un utilisateur à partir de `{ "login": "..." }`. `409` si le login existe déjà.
- `GET /watchlist` : renvoie la watchlist de l'utilisateur. `401` sans en-tête `X-User`.
- `POST /watchlist` : ajoute `{ "show_id": 44778, "title": "Severance" }` à la watchlist de l'utilisateur.

## Authentification

Pas d'authentification réelle, l'en-tête `X-User` tient lieu d'identité : ni mot de passe, ni hash, ni jeton.
C'est volontaire. Le cours porte sur la façon dont l'application arrive en production, pas sur la sécurité,
et l'en-tête suffit à ce que `/watchlist` puisse refuser une requête : sans refus, il n'y a aucun cas de
refus à tester. N'importe qui peut donc se faire passer pour n'importe quel login.

```bash
curl -X POST localhost:3000/register -H 'content-type: application/json' -d '{"login":"olivia"}'
curl -X POST localhost:3000/watchlist -H 'X-User: olivia' -H 'content-type: application/json' -d '{"show_id":44778,"title":"Severance"}'
curl localhost:3000/watchlist   # sans en-tête : 401
```

## Ce qui n'existe pas encore

- Authentification réelle (voir plus haut).
- Cocher une série comme vue.
- Interface web.
- Déploiement.

## Tests

```bash
cd api && npm test
```

Les tests de la séance 2 sont pour l'instant à l'état `todo` : ils n'échouent pas mais ne vérifient rien encore.
