import express from 'express';
import verifySession from '../_common/authMiddleware/verifySession';
import logout from './session/delete';

const app = express.Router();
app.use(verifySession);

app.use('/logout', logout);

export default app;
