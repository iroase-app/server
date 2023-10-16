import express from 'express';
import db from '../../../db';

const del = express.Router();

del.delete('/:deck_id/:card_id', async (req, res) => {
  if (!req.params.deck_id.match(/^[0-9]+$/) || !req.params.card_id.match(/^[0-9]+$/)) {
    res.status(400).send({ error: 'invalidId' });
    return;
  }
  const deck = await db.query(/* sql */ `
  SELECT "deck_id" FROM "user_decks"
  WHERE "deck_id" = $1 AND "user_id" = $2;
  `, [req.params.deck_id, req.user!.id]);
  if (!deck.rows[0]) {
    res.status(404).send({ error: 'deckNotFound' });
    return;
  }
  const card = await db.query(/* sql */ `
  SELECT "card_id" FROM "cards"
  WHERE "card_id" = $1 AND "deck_id" = $2;
  `, [req.params.card_id, req.params.deck_id]);
  if (!card.rows[0]) {
    res.status(404).send({ error: 'cardNotFound' });
    return;
  }
  await db.query(/* sql */ `
  DELETE FROM "cards"
  WHERE "card_id" = $1;
  `, [req.params.card_id]);
  res.status(204).send();
});

export default del;
