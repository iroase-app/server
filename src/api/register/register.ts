import argon2 from 'argon2';
import express from 'express';
import * as useragent from 'express-useragent';
import { DatabaseError } from 'pg-protocol';
import db from '../../db';
import randomBytesP from '../_common/randomBytesP';
import validate from '../_common/auth/validate';

const register = express.Router();
register.use(useragent.express());

register.post('/', validate, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const user = await client.query(`
      INSERT INTO users (username, hashed_password, created, is_moderator) 
      VALUES ($1, $2, $3, $4) 
      RETURNING user_id;
      `,
    [req.body.username, await argon2.hash(req.body.password), new Date(), false]);

    const token = (await randomBytesP(64)).toString('hex');
    await client.query(`
      INSERT INTO sessions ("user_id", "token", device, created)
      VALUES ($1, $2, $3, $4);
      `,
    [user.rows[0].user_id, token, `${req.useragent?.os}: ${req.useragent?.browser}`, new Date()]);

    await client.query('COMMIT');

    res.status(201).send({ session: token, username: req.body.username });
  } catch (e) {
    if (e instanceof DatabaseError && e.code === '23505') res.status(409).send({ error: 'usernameCollision' });
    else {
      res.status(500).send({ error: 'internalError' });
      console.error(`DB failure!! \n${e}`);
    }
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
});

export default register;
