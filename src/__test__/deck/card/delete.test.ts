import { QueryResult } from 'pg';
import supertest from 'supertest';
import db from '../../../db';
import loader from '../../../loader';
import setupAuth from '../../setupAuth';

const decks: QueryResult[] = [];
const notOurDecks: QueryResult[] = [];
const cards: QueryResult[] = [];
let token: string;
beforeEach(async () => {
  token = await setupAuth();
  decks[0] = await db.query(/* sql */ `
    INSERT INTO decks ("name", "public", "course")
    VALUES ($1, $2, $3)
    RETURNING deck_id;`,
  ['foobar', false, null]);

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
      (1, $1);`, // Our test user has an ID of 1.
  [decks[0].rows[0].deck_id]);

  await db.query(/* sql */ `
    INSERT INTO "user_decks" ("user_id", "deck_id")
    VALUES (999, $1);`, // This deck does not belong to our test user.
  [decks[1].rows[0].deck_id]);

  cards[0] = await db.query(/* sql */`
    INSERT INTO "cards" ("front", "back", "deck_id")
    VALUES ($1, $2, $3), ($4, $5, $6)
    RETURNING card_id;`,
  ['front', 'back', decks[0].rows[0].deck_id, 'front2', 'back2', decks[0].rows[0].deck_id]);
});

afterAll(async () => {
  await db.end();
});

describe('deleting cards from a deck', () => {
  it('should allow you to delete a card from a deck that belongs to you', async () => {
    // send a DELETE request to /app/deck/:deck_id/:card_id to delete a card from this deck.
    const res = await supertest(loader).delete(`/app/deck/${decks[0].rows[0].deck_id}/${cards[0].rows[0].card_id}`).set('Cookie', [`session=${token}`]);
    expect(res.status).toBe(204);

    // check that the card was deleted from the database.
    const card = await db.query(/* sql */ `
      SELECT * FROM cards WHERE card_id = $1;`,
    [cards[0].rows[0].card_id]);
    expect(card.rows[0]).toBe(undefined);
  });
});
