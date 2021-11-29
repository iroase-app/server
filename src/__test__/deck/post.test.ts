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
});
