import { Request, Response } from 'express';
import db from '../../../db';

/**
 * Middleware to check if the user is logged in.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next callback.
*/
export default async function verifySession(req: Request, res: Response, next: Function) {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization?.split(' ')[1];
  } else {
    token = null;
  }
  if (!token) res.status(401).send({ error: 'noBearer' });
  else {
    const user = await db.query(/* sql */ `
    SELECT users.user_id, username, "token", is_moderator
    FROM users INNER JOIN sessions ON (users.user_id = sessions.user_id)
    WHERE "token" = $1;
  `,
    [token]);

    if (!user.rows[0]) res.status(401).send({ error: 'unauthorized' });
    else {
      req.user = {
        id: user.rows[0].user_id,
        isModerator: user.rows[0].is_moderator,
        username: user.rows[0].username,
      };
      next();
    }
  }
}
