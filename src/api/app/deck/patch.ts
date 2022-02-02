import express from 'express';
import db from '../../../db';

const updateDeck = express.Router();

updateDeck.patch('/:id', async (req, res) => {
  const deckId = req.params.id;
  const deck = await db.query(/* sql */ `
  UPDATE "decks"
  SET "decks"."name" = $1, "decks"."course" = $2, "decks"."public" = $3
  JOIN "user_decks" ON "user_decks"."deck_id" = "decks"."deck_id"
  WHERE "decks"."deck_id" = $4 AND "user_decks"."user_id" = $5;
  `,
  [req.body.name, req.body.course, req.body.public, deckId, req.user!.id]);
  res.send(deck);
});

export default updateDeck;
