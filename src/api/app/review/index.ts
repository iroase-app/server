import express from 'express';
import db from '../../../db';

const review = express.Router();

review.get('/:deck', async (req, res) => {
  const cards = await db.query(/* sql */ `
    SELECT "front", "back", "card_id", "due", "pulled", "forgotten" FROM "user_decks"
    JOIN "cards" ON "user_decks"."deck_id" = "cards"."deck_id"
    WHERE "user_decks"."deck_id" = $1 AND "user_decks"."user_id" = $2
    AND "due" <= CURRENT_TIMESTAMP;
    `, [req.params.deck, req.user!.id]);
  if (cards.rows.length === 0) {
    res.status(204).send();
    return;
  }
  const pulledCard = cards.rows[Math.floor(Math.random() * cards.rows.length)];
  const difficulty = pulledCard.forgotten / (pulledCard.pulled + pulledCard.forgotten + 1);
  // Harder challenge = smaller number.
  let challengeType: 'easy' | 'hard' = difficulty < 0.5 ? 'hard' : 'easy';
  if (pulledCard.pulled === 0) challengeType = 'easy';
  res.status(200).send({
    card: {
      front: pulledCard.front,
      back: pulledCard.back,
      card_id: pulledCard.card_id,
    },
    challengeType,
  });
});

review.patch('/:deck/:card/', async (req, res) => {
  console.log(req.body);
  if (!req.params.deck.match(/^[0-9]+$/ || !req.params.card.match(/^[0-9]+$/))) {
    res.status(400).send({ error: 'invalidId' });
    return;
  }

  if (!('deltaT' in req.body) || typeof req.body.deltaT !== 'number' || req.body.deltaT < 0 || !('forgotten' in req.body) || typeof req.body.forgotten !== 'boolean') {
    res.status(400).send({ error: 'invalidBody' });
    return;
  }

  const card = await db.query(/* sql */ `
    SELECT "due", "pulled", "forgotten" FROM "user_decks"
    JOIN "cards" ON "user_decks"."deck_id" = "cards"."deck_id"
    WHERE "user_decks"."deck_id" = $1 AND "user_decks"."user_id" = $2
    AND "due" <= CURRENT_TIMESTAMP
    AND "card_id" = $3;
  `, [req.params.deck, req.user!.id, req.params.card]);

  if (card.rows.length === 0) {
    res.status(404).send({ error: 'pullNotFound' });
    return;
  }

  const q = db.query(/* sql */ `
    UPDATE "cards"
    SET "pulled" = "pulled" + 1,
      "due" = CURRENT_TIMESTAMP + ($2 * INTERVAL '1 second'),
      "forgotten" = "forgotten" + $3
    WHERE "card_id" = $1;
    `, [req.params.card, req.body.deltaT, req.body.forgotten ? 1 : 0])
    .then(async () => {
      res.status(204).send();
      console.log(await q);
    })
    .catch(() => res.status(500).send({ error: 'internalError' }));
});

export default review;
