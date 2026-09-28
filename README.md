# binggge

Un suivi de séries : chercher une série, l'ajouter à sa liste, cocher les épisodes vus.

## Démarrer

```bash
cp .env.example .env            # choisir un DB_PASS long, le reporter dans DATABASE_URL
docker compose up -d --build    # l'API répond sur http://localhost:3000
```

Deux conteneurs : `api` (image construite depuis `api/Dockerfile`, Node 24) et `db` (PostgreSQL 16).
L'API joint la base par le nom de service `db`, pas par `localhost`.

Le mot de passe de la base vient du fichier `.env` (`DB_PASS`), jamais versionné. `.env.example` montre
les variables attendues.

`docker-compose.yml` ne publie aucun port : sur le serveur, Traefik joint le conteneur sur le réseau Docker.
En local, `docker-compose.override.yml`, lu automatiquement par `docker compose`, publie l'API sur 3000 et
la base sur 5432. Le serveur l'ignore en lançant `docker compose -f docker-compose.yml`.

Pour lancer l'API hors conteneur : `cd api && npm install && npm start` (elle lit `DATABASE_URL` dans `.env`).

## Base de données

Le volume `pgdata` garde les données entre un `docker compose down` et un `docker compose up`.

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
docker compose up -d
cd api && npm install && npm test
```

Les tests joignent la base du conteneur via `DATABASE_URL` (fichier `.env`) et nettoient ce qu'ils créent.
Ils vérifient que `/health` répond 200, qu'une inscription crée l'utilisateur, qu'une série ajoutée apparaît
dans `/watchlist`, et que `/watchlist` sans en-tête renvoie 401.
