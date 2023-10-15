import express from 'express';
import create from './post';
import patch from './patch';
import get from './get';

const deck = express.Router();

deck.use('/', create);
deck.use('/', patch);
deck.use('/', get);

export default deck;
