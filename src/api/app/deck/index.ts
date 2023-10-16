import express from 'express';
import create from './post';
import patch from './patch';
import get from './get';
import del from './delete';

const deck = express.Router();

deck.use('/', create);
deck.use('/', patch);
deck.use('/', get);
deck.use('/', del);

export default deck;
