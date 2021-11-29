import * as db from '../db';

/**
 * Creates a test user for our tests to use.
 * The user has the username 'TestUser' and the token 'testToken'.
 * @returns {Promise<void>} A promise that resolves when everything is ready to go.
 */
async function setupAuth(): Promise<void> {
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
  return Promise.resolve();
}

export default setupAuth;
