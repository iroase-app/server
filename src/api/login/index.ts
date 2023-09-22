import argon2 from 'argon2';
import express from 'express';
import validate from '../_common/authMiddleware/validate';
import db from '../../db';
import randomBytesP from '../_common/randomBytesP';

const login = express.Router();

login.post('/', validate, async (req, res) => {
  const user = await db.query(/* sql */ `
    SELECT user_id, hashed_password FROM users WHERE username = $1;
    `,
  [req.body.username]);
  if (!user.rows[0]) {
    /*
      * If the user doesn't exist, we don't want to leak information.
      * We pretend that the user exists but the password is wrong.
      * We hash a dummy string for consistent execution time.
    */
    await argon2.hash('very real password');
    return res.status(400).send({ error: 'wrongCredentials' });
  }

  const isValid = await argon2.verify(user.rows[0].hashed_password, req.body.password);
  if (isValid) {
    const token = (await randomBytesP(64)).toString('hex');
    await db.query(/* sql */ `
          INSERT INTO sessions ("user_id", "token", device, created)
          VALUES ($1, $2, $3, $4);
          `,
    [user.rows[0].user_id, token, `${req.useragent?.os}: ${req.useragent?.browser}`, new Date()]);
    res.cookie('session', token, { secure: true, sameSite: 'strict' });
    return res.send({ username: req.body.username });
  }
  return res.status(400).send({ error: 'wrongCredentials' });
});

export default login;
