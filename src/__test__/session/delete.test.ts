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

describe('logging out', () => {
  it('should delete a session', async () => {
    const res = await supertest(loader)
      .delete('/app/session')
      .set('Authorization', 'Bearer testToken')
      .send();

    expect(res.status).toBe(204);
    const sessions = await db.default.query(`
    SELECT * FROM sessions WHERE "token" = $1;
    `,
    ['testToken']);
    expect(sessions.rowCount).toBe(0);
  });
});
