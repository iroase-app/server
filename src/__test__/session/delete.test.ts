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
