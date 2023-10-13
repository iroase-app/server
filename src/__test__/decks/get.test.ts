import { QueryResult } from 'pg';
import supertest from 'supertest';
import db from '../../db';
import loader from '../../loader';
import setupAuth from '../setupAuth';

let ourDecks: QueryResult;
let otherDecks: QueryResult;
let token: string;

beforeEach(async () => {
  token = await setupAuth();

  // Decks we want to retrieve for our user
  ourDecks = await db.query(/* sql */ `
    INSERT INTO decks ("name", "public", "course")
    VALUES ($1, $2, $3)
    RETURNING deck_id;`,
  ['foobar', false, null]);

  await db.query(/* sql */ `
    INSERT INTO "user_decks" ("user_id", "deck_id")
    VALUES 
      (1, $1);`,
  [ourDecks.rows[0].deck_id]);

  // Decks for another user
  otherDecks = await db.query(/* sql */ `
    INSERT INTO decks ("name", "public", "course")
    VALUES ($1, $2, $3)
    RETURNING deck_id;`,
  ['notOurs', false, null]);

  await db.query(/* sql */ `
    INSERT INTO "user_decks" ("user_id", "deck_id")
    VALUES 
      (999, $1);`,
  [otherDecks.rows[0].deck_id]);
});

afterAll(async () => {
  await db.end();
});

describe('/decks', () => {
  it('should provide a list of a user\'s decks', async () => {
    const res = await supertest(loader)
      .get('/app/decks')
      .set('Cookie', [`session=${token}`])
      .expect(200);

    expect(res.body.decks).toHaveLength(1); // only foobar; not someone elses deck.
    expect(res.body.decks[0].name).toBe('foobar');
    expect(res.body.decks[0].public).toBe(false);
    expect(res.body.decks[0].course).toBeNull();
    expect(res.body.decks[0].deck_id).toBe(ourDecks.rows[0].deck_id);
  });
});
