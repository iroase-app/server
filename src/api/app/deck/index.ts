import express from 'express';
import create from './post';
import updateDeck from './patch';

const deck = express.Router();

deck.use('/', create);
deck.use('/', updateDeck);

export default deck;
