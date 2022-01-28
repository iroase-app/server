import express from 'express';
import db from '../../../db';

const getDecks = express.Router();

getDecks.get('/', async (req, res) => {
  const decks = await db.query(/* sql */ `
  SELECT "decks"."deck_id", "decks"."name", "decks"."course", "decks"."public" FROM "decks", "user_decks"
  JOIN "users" ON "user_decks"."user_id" = "users"."user_id"
  WHERE "user_decks"."user_id" = $1`,
  [req.user!.id]);
  res.status(200).send({ decks: decks.rows });
});

export default getDecks;
