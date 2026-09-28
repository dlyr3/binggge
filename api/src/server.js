import express from 'express';
import pg from 'pg';

export const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/shows', async (req, res) => {
  const q = req.query.q || '';
  const r = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
  const results = await r.json();
  const shows = results.map(({ show }) => ({
    id: show.id,
    title: show.name,
    year: show.premiered ? show.premiered.slice(0, 4) : null,
    image: show.image ? show.image.medium : null,
  }));
  res.json(shows);
});

app.post('/register', async (req, res) => {
  const { login } = req.body ?? {};
  if (!login) return res.status(400).json({ error: 'login requis' });
  try {
    const { rows } = await db.query('INSERT INTO users(login) VALUES($1) RETURNING id, login', [login]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code !== '23505') throw e;
    res.status(409).json({ error: 'login déjà pris' });
  }
});

const user = async (req, res, next) => {
  const login = req.get('X-User');
  const { rows } = login ? await db.query('SELECT id FROM users WHERE login = $1', [login]) : { rows: [] };
  if (!rows.length) return res.status(401).json({ error: 'non authentifié' });
  req.userId = rows[0].id;
  next();
};

app.get('/watchlist', user, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, show_id, title, seen FROM watchlist WHERE user_id = $1 ORDER BY id',
    [req.userId],
  );
  res.json(rows);
});

app.post('/watchlist', user, async (req, res) => {
  const { show_id, title } = req.body ?? {};
  const { rows } = await db.query(
    'INSERT INTO watchlist(user_id, show_id, title) VALUES($1, $2, $3) RETURNING id, show_id, title, seen',
    [req.userId, show_id, title],
  );
  res.status(201).json(rows[0]);
});

if (import.meta.main) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`binggge api en écoute sur le port ${port}`));
}

export default app;
