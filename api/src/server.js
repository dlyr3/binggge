import express from 'express';

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

app.get('/watchlist', (req, res) => {
  res.json([]);
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`binggge api en écoute sur le port ${port}`));
}

export default app;
