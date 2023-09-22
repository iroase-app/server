import { QueryResult } from 'pg';
import supertest from 'supertest';
import db from '../../db';
import loader from '../../loader';
import setupAuth from '../setupAuth';

const decks: QueryResult[] = [];
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

describe('updating deck info', () => {
  it('should allow you to change the info of decks that belong to you', async () => {
    const res = await supertest(loader)
      .patch(`/app/deck/${decks[0].rows[0].deck_id}`)
      .set('Cookie', [`session=${token}`])
      .send({ name: 'newName', course: '9ST0' });

    expect(res.status).toBe(200);

    const updatedDeck = await db.query(/* sql */ `
      SELECT * FROM decks WHERE deck_id = $1;`,
    [decks[0].rows[0].deck_id]);

    expect(updatedDeck.rows[0].name).toBe('newName');
    expect(updatedDeck.rows[0].course).toBe('9ST0');
    expect(updatedDeck.rows[0].public).toBe(false);
  });

  it('should not allow you to change the info of decks that do not belong to you', async () => {
    const res = await supertest(loader)
      .patch(`/app/deck/${decks[1].rows[0].deck_id}`)
      .set('Cookie', [`session=${token}`])
      .send({ name: 'newName', course: '9ST0' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('notOwner');

    const notUpdatedDeck = await db.query(/* sql */ `
      SELECT * FROM decks WHERE deck_id = $1;`,
    [decks[1].rows[0].deck_id]);
    expect(notUpdatedDeck.rows[0].name).toBe('foobar2');
    expect(notUpdatedDeck.rows[0].course).toBeNull();
  });

  it('should not allow you to change the info of decks that do not exist', async () => {
    const res = await supertest(loader)
      .patch('/app/deck/000')
      .set('Cookie', [`session=${token}`])
      .send({ name: 'newName', course: '9ST0' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('deckNotFound');
  });

  it('should not allow you to provide no data', async () => {
    const res = await supertest(loader)
      .patch(`/app/deck/${decks[0].rows[0].deck_id}`)
      .set('Cookie', [`session=${token}`])
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('noData');

    const notUpdatedDeck = await db.query(/* sql */ `
      SELECT * FROM decks WHERE deck_id = $1;`,
    [decks[0].rows[0].deck_id]);
    expect(notUpdatedDeck.rows[0].name).toBe('foobar');
    expect(notUpdatedDeck.rows[0].course).toBeNull();
  });
});
