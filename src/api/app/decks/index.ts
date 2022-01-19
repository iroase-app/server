import express from 'express';
import getDecks from './get';

const decks = express.Router();

decks.use('/', getDecks);

export default decks;
