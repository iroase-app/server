import supertest from 'supertest';
import * as db from '../../db';
import loader from '../../loader';
import setupAuth from '../setupAuth';

beforeEach(async () => {
  await setupAuth();
});

afterAll(async () => {
  await db.default.end();
});

describe('return meta information about the user', () => {
  it('should return the user meta information', async () => {
    const res = await supertest(loader)
      .get('/app/session')
      .set('Authorization', 'Bearer testToken');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      username: 'TestUser',
      isModerator: false,
    });
  });
  it('should reject if session is missing or invalid', async () => {
    let res = await supertest(loader)
      .get('/app/session')
      .set('Authorization', 'Bearer invalidToken');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');

    res = await supertest(loader)
      .get('/app/session')
      .set('Authorization', 'Bearer ');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('noBearer');
  });
});
