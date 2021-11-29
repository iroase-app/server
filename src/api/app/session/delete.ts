import express from 'express';
import db from '../../../db';

const logout = express.Router();

logout.delete('/', async (req, res) => {
  /*
    * We can trust the authorization header is valid
    * because we already checked it in the middleware.
    * See ./src/api/_common/authMiddleware/verifySession.ts
  */
  const token = req.headers.authorization!.split(' ')[1];
  await db.query(/* sql */ `
  DELETE FROM sessions WHERE token = $1
  `, [token]);
  res.status(204).send();
});

export default logout;
