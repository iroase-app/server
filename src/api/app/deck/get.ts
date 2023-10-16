import express from 'express';
import db from '../../../db';

const get = express.Router();

// List the cards in a deck and get deck metadata.
get.get('/:id', async (req, res) => {
  if (!req.params.id.match(/^[0-9]+$/)) {
    res.status(400).send({ error: 'invalidId' });
    return;
  }
  const deck = await db.query(/* sql */ `
  SELECT "name", "course", "public", "user_decks"."deck_id" FROM "decks"
  JOIN "user_decks" ON "decks"."deck_id" = "user_decks"."deck_id"
  WHERE "user_decks"."deck_id" = $1 AND "user_decks"."user_id" = $2;
  `, [req.params.id, req.user!.id]);

  if (!deck.rows[0]) {
    res.status(404).send({ error: 'deckNotFound' }); return;
  }
  const cards = (await db.query(/* sql */ `
    SELECT "front", "back", "card_id" FROM "user_decks"
    JOIN "cards" ON "user_decks"."deck_id" = "cards"."deck_id"
    WHERE "user_decks"."deck_id" = $1 AND "user_decks"."user_id" = $2
    
    `, [req.params.id, req.user!.id])).rows;
  res.status(200).send({ cards, deck: deck.rows[0] });
});

export default get;
