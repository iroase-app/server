import express from 'express';
import create from './post';

const deck = express.Router();

deck.use('/', create);

export default deck;
