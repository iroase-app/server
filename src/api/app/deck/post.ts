import express from 'express';
import db from '../../../db';

const createDeck = express.Router();

createDeck.post('/', async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ error: 'missingField' });
    return;
  }
  db.query(/* sql */ `
    INSERT INTO decks ("name", "public")
    VALUES ($1, $2);
  `, [req.body.name, false]);
  res.status(200).send('ok');
});

export default createDeck;
