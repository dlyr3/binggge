import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app, { db } from '../src/server.js';

const login = `test-${Date.now()}`;

after(async () => {
  await db.query('DELETE FROM watchlist WHERE user_id IN (SELECT id FROM users WHERE login = $1)', [login]);
  await db.query('DELETE FROM users WHERE login = $1', [login]);
  await db.end();
});

test('/health répond 200', async () => {
  const r = await request(app).get('/health');
  assert.equal(r.status, 200);
});

test("une inscription crée bien l'utilisateur", async () => {
  const r = await request(app).post('/register').send({ login });
  assert.equal(r.status, 201);
  const { rows } = await db.query('SELECT login FROM users WHERE login = $1', [login]);
  assert.equal(rows.length, 1);
});

test('ajouter une série la fait apparaître dans /watchlist', async () => {
  await request(app).post('/watchlist').set('X-User', login).send({ show_id: 44778, title: 'Severance' }).expect(201);
  const r = await request(app).get('/watchlist').set('X-User', login);
  assert.deepEqual(r.body.map((s) => s.title), ['Severance']);
});

test('/watchlist sans en-tête renvoie 401', async () => {
  const r = await request(app).get('/watchlist');
  assert.equal(r.status, 401);
});

test.todo('un titre vide est refusé');
