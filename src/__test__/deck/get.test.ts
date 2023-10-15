import { QueryResult } from 'pg';
import supertest from 'supertest';
import db from '../../db';
import loader from '../../loader';
import setupAuth from '../setupAuth';

const decks: QueryResult[] = [];
const notOurDecks: QueryResult[] = [];
let token: string;
beforeEach(async () => {
  token = await setupAuth();
  decks[0] = await db.query(/* sql */ `
    INSERT INTO decks ("name", "public", "course")
    VALUES ($1, $2, $3)
    RETURNING deck_id;`,
  ['foobar', false, null]);

  await db.query(/* sql */ `
    INSERT INTO "cards" ("front", "back", "deck_id")
    VALUES ($1, $2, $3), ($4, $5, $6);`,
  ['front', 'back', decks[0].rows[0].deck_id, 'front2', 'back2', decks[0].rows[0].deck_id]);

  decks[1] = await db.query(/* sql */ `
    INSERT INTO decks ("name", "public", "course")
    VALUES ($1, $2, $3)
    RETURNING deck_id;`,
  ['foobar2', false, null]);

  notOurDecks[0] = await db.query(/* sql */ `
    INSERT INTO decks ("name", "public", "course")
    VALUES ($1, $2, $3)
    RETURNING deck_id;`,
  ['notOurs', false, null]);

  await db.query(/* sql */ `
    INSERT INTO "user_decks" ("user_id", "deck_id")
    VALUES 
      (1, $1), (1, $2);`, // Our test user has an ID of 1.
  [decks[0].rows[0].deck_id, decks[1].rows[0].deck_id]);

  await db.query(/* sql */ `
    INSERT INTO "user_decks" ("user_id", "deck_id")
    VALUES (999, $1);`, // This deck does not belong to our test user.
  [decks[1].rows[0].deck_id]);
});

afterAll(async () => {
  await db.end();
});

describe('getting a deck', () => {
  it('should return a deck that belongs to you', async () => {
    let res = await supertest(loader)
      .get(`/app/deck/${decks[0].rows[0].deck_id}`)
      .set('Cookie', [`session=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.deck.name).toBe('foobar');
    expect(res.body.cards).toHaveLength(2);
    expect(res.body.cards[0].front).toBe('front');
    expect(res.body.cards[0].back).toBe('back');
    expect(res.body.cards[1].front).toBe('front2');
    expect(res.body.cards[1].back).toBe('back2');

    res = await supertest(loader)
      .get(`/app/deck/${decks[1].rows[0].deck_id}`)
      .set('Cookie', [`session=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.deck.name).toBe('foobar2');
    expect(res.body.cards).toHaveLength(0);
  });
  it('should not return a deck that does not belong to you', async () => {
    const res = await supertest(loader)
      .get(`/app/deck/${notOurDecks[0].rows[0].deck_id}`)
      .set('Cookie', [`session=${token}`]);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('deckNotFound');
  });
  it('should not return a deck that does not exist', async () => {
    const res = await supertest(loader)
      .get('/app/deck/999999')
      .set('Cookie', [`session=${token}`]);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('deckNotFound');
  });
  it('should reject non integer deck IDs', async () => {
    const res = await supertest(loader)
      .get('/app/deck/foobar')
      .set('Cookie', [`session=${token}`]);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalidId');
  });
});
