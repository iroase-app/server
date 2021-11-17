import supertest from 'supertest';
import * as db from '../../db';
import loader from '../../loader';

beforeEach(async () => {
  await db.reset();
  await db.init();
  const user = await db.default.query(`
  INSERT INTO users (username, hashed_password, created, is_moderator) 
  VALUES ($1, $2, $3, $4)
  RETURNING user_id
  ;`,
  ['TestUser', 'this should be a hash', new Date(), false]);

  await db.default.query(`
  INSERT INTO sessions ("user_id", "token", device, created)
  VALUES ($1, $2, $3, $4);
  `,
  [user.rows[0].user_id, 'testToken', 'SAMSUNG Smart Toaster', new Date()]);
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
