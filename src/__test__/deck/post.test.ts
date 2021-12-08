import supertest from 'supertest';
import db from '../../db';
import loader from '../../loader';
import setupAuth from '../setupAuth';

beforeEach(async () => {
  await setupAuth();
});

afterAll(async () => {
  await db.end();
});

describe('creating a deck', () => {
  it('should return 400 if no deck is provided', async () => {
    let res = await supertest(loader).post('/app/deck').send({}).set('Authorization', 'Bearer testToken');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('missingField');

    res = await supertest(loader).post('/app/deck').send({ name: '' }).set('Authorization', 'Bearer testToken');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('missingField');
  });

  it('should reject names that are too long', async () => {
    const res = await supertest(loader).post('/app/deck').send({ name: 'a'.repeat(101) }).set('Authorization', 'Bearer testToken');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('nameTooLong');
  });

  it('should save the created deck to the database', async () => {
    const res = await supertest(loader).post('/app/deck').send({ name: 'test' }).set('Authorization', 'Bearer testToken');
    expect(res.status).toBe(201);
    const deck = await db.query('SELECT * FROM decks WHERE name = $1', ['test']);
    expect(deck.rows[0].name).toBe('test');
    const userDeck = await db.query(/* sql */ `
    SELECT * FROM "user_decks"
    JOIN "users" ON "user_decks"."user_id" = "users"."user_id"
    WHERE "user_decks"."deck_id" = $1;
    `,
    [deck.rows[0].deck_id]);
    expect(userDeck.rowCount).toBe(1);
    expect(userDeck.rows[0].deck_id).toBe(res.body.deck.id);
    expect(deck.rows[0].name).toBe(res.body.deck.name);
  });
});
