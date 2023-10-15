import express from 'express';
import db from '../../../db';

const create = express.Router();

// Create a new deck.
create.post('/', async (req, res) => {
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

// Create a new card in a deck.
create.post('/:id', async (req, res) => {
  if (!req.params.id.match(/^[0-9]+$/)) {
    res.status(400).send({ error: 'invalidId' });
    return;
  }
  if (!req.body.front || !req.body.back) {
    res.status(400).send({ error: 'missingField' });
    return;
  }
  if (req.body.front.length > 1000 || req.body.back.length > 1000) {
    res.status(400).send({ error: 'fieldTooLong' });
    return;
  }
  if (req.body.front.length < 1 || req.body.back.length < 1) {
    res.status(400).send({ error: 'fieldTooShort' });
    return;
  }

  // Can the user access this deck, or does it even exist?
  const deck = await db.query(/* sql */ `
    SELECT * FROM user_decks WHERE deck_id = $1 AND user_id = $2;
    `, [req.params.id, req.user!.id]);
  if (!deck.rows[0]) {
    res.status(404).send({ error: 'deckNotFound' });
    return;
  }

  // Create the card.
  const card = await db.query(/* sql */ `
    INSERT INTO cards ("front", "back", "deck_id")
    VALUES ($1, $2, $3)
    RETURNING card_id;
    `, [req.body.front, req.body.back, req.params.id]);
  res.status(201).send({ card_id: card.rows[0].card_id });
});

export default create;
