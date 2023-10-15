import { QueryResult } from 'pg';
import supertest from 'supertest';
import db from '../../../db';
import loader from '../../../loader';
import setupAuth from '../../setupAuth';

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
});

afterAll(async () => {
  await db.end();
});

describe('adding a card to a deck', () => {
  it('should allow you to add a card to a deck that belongs to you', async () => {
    // send a POST request to /app/deck/:deck_id to add a card to this deck.
    const res = await supertest(loader).post(`/app/deck/${decks[0].rows[0].deck_id}`).send({
      front: 'front',
      back: 'back',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body).toHaveProperty('card_id');
    expect(res.status).toBe(201);

    // check that the card was added to the database.
    const card = await db.query(/* sql */ `
      SELECT * FROM cards WHERE card_id = $1;`,
    [res.body.card_id]);
    expect(card.rows[0].front).toBe('front');
    expect(card.rows[0].back).toBe('back');
    expect(card.rows[0].deck_id).toBe(decks[0].rows[0].deck_id);
    expect(card.rows[0].card_id).toBe(res.body.card_id);
  });

  it('should not allow you to add a card to a deck that does not belong to you', async () => {
    const res = await supertest(loader).post(`/app/deck/${notOurDecks[0].rows[0].deck_id}`).send({
      front: 'front',
      back: 'back',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body.error).toBe('deckNotFound');
    expect(res.status).toBe(404);

    // check that the card was not added to the database.
    const card = await db.query(/* sql */ `
      SELECT * FROM cards WHERE deck_id = $1;`,
    [notOurDecks[0].rows[0].deck_id]);
    expect(card.rows).toHaveLength(0);
  });

  it('should not allow you to add a card to a deck that does not exist', async () => {
    const res = await supertest(loader).post('/app/deck/999').send({
      front: 'front',
      back: 'back',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body.error).toBe('deckNotFound');
    expect(res.status).toBe(404);

    // check that the card was not added to the database.
    const card = await db.query(/* sql */ `
      SELECT * FROM cards WHERE deck_id = $1;`,
    [999]);
    expect(card.rows).toHaveLength(0);
  });

  it('should not allow you to add a card to a deck without a front or back', async () => {
    let res = await supertest(loader).post(`/app/deck/${decks[0].rows[0].deck_id}`).send({
      front: 'front',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body.error).toBe('missingField');
    expect(res.status).toBe(400);

    res = await supertest(loader).post(`/app/deck/${decks[0].rows[0].deck_id}`).send({
      back: 'back',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body.error).toBe('missingField');
    expect(res.status).toBe(400);

    // check that the card was not added to the database.
    const card = await db.query(/* sql */ `
      SELECT * FROM cards WHERE deck_id = $1;`,
    [decks[0].rows[0].deck_id]);
    expect(card.rows).toHaveLength(0);
  });

  it('should reject badly formatted non-numeric ids', async () => {
    let res = await supertest(loader).post('/app/deck/999a').send({
      front: 'front',
      back: 'back',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body.error).toBe('invalidId');
    expect(res.status).toBe(400);

    res = await supertest(loader).post('/app/deck/999.1').send({
      front: 'front',
      back: 'back',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body.error).toBe('invalidId');
    expect(res.status).toBe(400);

    res = await supertest(loader).post('/app/deck/999/0').send({
      front: 'front',
      back: 'back',
    }).set('Cookie', [`session=${token}`]);
    expect(res.body.error).toBe('invalidId');
    expect(res.status).toBe(400);

    // check that the card was not added to the database.
    const card = await db.query(/* sql */ `
      SELECT * FROM cards WHERE deck_id = $1;`,
    [999]);
    expect(card.rows).toHaveLength(0);
  });
});
