import { Pool } from 'pg';

const db = new Pool({
  user: 'iroase',
  database: process.env.PGUSER || 'iroase',
});

/**
 * Initialize the database.
 */
export async function init() {
  await db.query(/* sql */`
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

  CREATE TABLE IF NOT EXISTS decks (
    "deck_id" INT GENERATED ALWAYS AS IDENTITY,
    "name" varchar NOT NULL,
    "course" varchar,
    "public" boolean NOT NULL DEFAULT false,
    CONSTRAINT decks_pk PRIMARY KEY ("deck_id")
  );

  CREATE INDEX IF NOT EXISTS "deck_index" ON decks (
    "name", "course", "public"
  );

  CREATE TABLE IF NOT EXISTS user_decks (
    "user_id" INT NOT NULL,
    "deck_id" INT NOT NULL,
    CONSTRAINT "user_decks_pk" PRIMARY KEY ("user_id", "deck_id"),
    CONSTRAINT "user_id" FOREIGN KEY ("user_id") REFERENCES users("user_id") ON DELETE CASCADE,
    CONSTRAINT "deck_id" FOREIGN KEY ("deck_id") REFERENCES decks("deck_id") ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cards (
    "card_id" INT GENERATED ALWAYS AS IDENTITY,
    "front" text NOT NULL,
    "back" text NOT NULL,
    "deck_id" INT NOT NULL,
    "due" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pulled" INT NOT NULL DEFAULT 0,
    "forgotten" INT NOT NULL DEFAULT 0,
    CONSTRAINT "deck_id" FOREIGN KEY ("deck_id") REFERENCES decks("deck_id") ON DELETE CASCADE,
    CONSTRAINT "cards_pk" PRIMARY KEY ("card_id")
  );

  CREATE INDEX IF NOT EXISTS "card_index" ON cards (
    "front", "back", "deck_id", "due"
  );
  `);
}

/**
 * Reset the database. This should only be used to ensure a clean state for our tests.
 */
export async function reset() {
  await db.query(/* sql */ `
  DROP TABLE IF EXISTS "users" CASCADE;
  DROP TABLE IF EXISTS "sessions" CASCADE;
  DROP TABLE IF EXISTS "decks" CASCADE;
  DROP TABLE IF EXISTS "user_decks" CASCADE;
  DROP TABLE IF EXISTS "cards" CASCADE;
  DROP TABLE IF EXISTS "card_events" CASCADE;
  `);
}

export default db;
