import { QueryResult } from 'pg';
import supertest from 'supertest';
import db from '../../db';
import loader from '../../loader';
import setupAuth from '../setupAuth';

let decks: QueryResult;

beforeEach(async () => {
  await setupAuth();
  decks = await db.query(/* sql */ `
    INSERT INTO decks ("name", "public", "course")
    VALUES ($1, $2, $3)
    RETURNING deck_id;`,
  ['foobar', false, null]);

  await db.query(/* sql */ `
    INSERT INTO "user_decks" ("user_id", "deck_id")
    VALUES 
      (1, $1);`,
  [decks.rows[0].deck_id]);
});

afterAll(async () => {
  await db.end();
});

describe('/decks', () => {
  it('should provide a list of a user\'s decks', async () => {
    const res = await supertest(loader)
      .get('/app/decks')
      .set('Authorization', 'Bearer testToken')
      .expect(200);

    expect(res.body.decks).toHaveLength(1); // only foobar; not someone elses deck.
    expect(res.body.decks[0].name).toBe('foobar');
    expect(res.body.decks[0].public).toBe(false);
    expect(res.body.decks[0].course).toBeNull();
  });
});
