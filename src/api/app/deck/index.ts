import express from 'express';
import create from './post';
import patch from './patch';

const deck = express.Router();

deck.use('/', create);
deck.use('/', patch);

export default deck;
