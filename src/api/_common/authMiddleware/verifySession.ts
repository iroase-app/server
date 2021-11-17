import { Request, Response } from 'express';
import db from '../../../db';

/**
 * Middleware to check if the user is logged in.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next callback.
*/
export default async function verifySession(req: Request, res: Response, next: Function) {
  if (!req.headers.authorization) return res.status(401).send({ error: 'unauthorized' });
  const user = await db.query(`
    SELECT (sessions.user_id, sessions.token, users.user_id, users.is_moderator)
    FROM sessions
    INNER JOIN users ON sessions.user_id = users.user_id
    WHERE sessions.token = $1,
  `,
  [req.headers.authorization]);
  if (!user) return res.status(401).send({ error: 'unauthorized' });
  req.user = {
    id: user.rows[0].user_id,
    isModerator: user.rows[0].is_moderator,
    username: user.rows[0].username,
  };
  return next();
}
