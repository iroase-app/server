import * as db from '../db';

/**
 * Cleans the DB and creates a test user for our tests to use.
 * The user has the username 'TestUser' and the token 'testToken'.
 * This user has an id of 1.
 * The user is not a moderator.
 *
 * ---
 *
 * Another user is also created with the username 'someoneElse' and the id 999.
 * They do not have an associated session.
 *
 * Use this user to mock things that belong to other accounts that the test user
 * should not be able to access.
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

  // I know this is scuffed.
  await db.default.query(/* sql */ `
  INSERT INTO "users" ("user_id", "username", "hashed_password", "created", "is_moderator")
  OVERRIDING SYSTEM VALUE VALUES (999, 'someoneElse', 'this should be a hash', '2020-01-01', false);
`);

  return Promise.resolve();
}

export default setupAuth;
