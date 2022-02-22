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
  const client = await db.connect();
  await client.query('BEGIN');
  try {
    // Update the fields if they are provided.
    if (req.body.name) {
      await client.query(/* sql */ `
        UPDATE decks SET name = $1 WHERE deck_id = $2;
        `, [req.body.name, req.params.id]);
    }
    if (req.body.course) {
      await client.query(/* sql */ `
        UPDATE decks SET course = $1 WHERE deck_id = $2;
        `, [req.body.course, req.params.id]);
    }
    if (req.body.public) {
      await client.query(/* sql */ `
        UPDATE decks SET public = $1 WHERE deck_id = $2;
        `, [req.body.public, req.params.id]);
    }
    await client.query('COMMIT');
    return res.send({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`Error updating deck: ${e}`);
    return res.status(500).send({ error: 'databaseError' });
  } finally {
    client.release();
  }
});

export default updateDeck;
