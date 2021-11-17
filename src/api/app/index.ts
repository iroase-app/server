import express from 'express';
import verifySession from '../_common/authMiddleware/verifySession';
import session from './session';

const app = express.Router();
app.use(verifySession);

app.use('/session', session);

export default app;
