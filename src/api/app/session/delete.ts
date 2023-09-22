import express from 'express';
import db from '../../../db';

const logout = express.Router();

logout.delete('/', async (req, res) => {
  /*
    * We can trust the authorization is valid
    * because we already checked it in the middleware.
    * See ./src/api/_common/authMiddleware/verifySession.ts
  */
  const token = req.cookies.session;
  await db.query(/* sql */ `
  DELETE FROM sessions WHERE token = $1
  `, [token]);
  res.status(204).send();
});

export default logout;
