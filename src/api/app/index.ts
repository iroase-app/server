import express from 'express';
import verifySession from '../_common/authMiddleware/verifySession';
import deck from './deck';
import session from './session';

const app = express.Router();
app.use(verifySession);

app.use('/session', session);
app.use('/deck', deck);

export default app;
