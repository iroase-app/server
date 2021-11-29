import express from 'express';

const createDeck = express.Router();

createDeck.post('/', (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ error: 'missingField' });
    return;
  }
  res.status(200).send('ok');
});

export default createDeck;
