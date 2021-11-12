import { Pool } from 'pg';

const db = new Pool({
  user: 'iroase',
  database: process.env.PGUSER || 'iroase',
});

/**
 * Initialize the database.
 */
export async function init() {
  await db.query(`
  CREATE TABLE IF NOT EXISTS users (
    "user_id" INT GENERATED ALWAYS AS IDENTITY,
    username varchar NOT NULL,
    hashed_password varchar NOT NULL,
    created timestamp NOT NULL,
    is_moderator boolean NOT NULL DEFAULT false,
    CONSTRAINT users_pk PRIMARY KEY ("user_id"),
    CONSTRAINT users_un UNIQUE (username)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    "session_id" INT GENERATED ALWAYS AS IDENTITY,
    "token" varchar NOT NULL,
    device varchar NOT NULL,
    created timestamp NOT NULL,
    "user_id" INT NOT NULL,
    CONSTRAINT sessions_pk PRIMARY KEY ("session_id"),
    CONSTRAINT "user_id" FOREIGN KEY ("user_id") REFERENCES users("user_id") ON DELETE CASCADE
  );
  `);
}

/**
 * Reset the database. This should only be used to ensure a clean state for our tests.
 */
export async function reset() {
  await db.query(`
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS sessions CASCADE;
  `);
}

export default db;
