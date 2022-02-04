import express from 'express';
import db from '../../../db';

const updateDeck = express.Router();

updateDeck.patch('/:id', async (req, res) => {
  if (!req.body.name && !req.body.course && !req.body.public) return res.status(400).send({ error: 'noData' });
  const deck = await db.query(/* sql */ `
    SELECT * FROM user_decks WHERE deck_id = $1;
    `, [req.params.id]);
  if (!deck.rows[0]) return res.status(404).send({ error: 'deckNotFound' });
  if (deck.rows[0].user_id !== req.user!.id) return res.status(403).send({ error: 'notOwner' });
  // TODO: Actually update the deck info.
  return res.status(200).send({ error: deck.rows[0] });
});

export default updateDeck;
