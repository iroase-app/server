import express from 'express';
import db from '../../../db';

const createDeck = express.Router();

createDeck.post('/', async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ error: 'missingField' });
    return;
  }
  if (req.body.name.length > 100) {
    res.status(400).send({ error: 'nameTooLong' });
    return;
  }
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const deck = await client.query(/* sql */ `
      INSERT INTO "decks" ("name", "public")
      VALUES ($1, $2)
      RETURNING "deck_id";
      ;
    `, [req.body.name, false]);
    await client.query(/* sql */ `
      INSERT INTO "user_decks" ("user_id", "deck_id")
      VALUES ($1, $2);
    `, [req.user!.id, deck.rows[0].deck_id]);
    await client.query('COMMIT');
    res.status(201).send({ deck: { id: deck.rows[0].deck_id, name: req.body.name } });
  } catch (e) {
    res.status(500).send({ error: 'internalError' });
    await client.query('ROLLBACK');
    console.error(`DB failure!! \n${e}`);
  } finally {
    client.release();
  }
});

export default createDeck;
