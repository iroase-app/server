import express from 'express';
import verifySession from '../_common/authMiddleware/verifySession';
import deck from './deck';
import decks from './decks';
import session from './session';
import review from './review';

const app = express.Router();
app.use(verifySession);

app.use('/session', session);
app.use('/deck', deck);
app.use('/decks', decks);
app.use('/review', review);

export default app;
