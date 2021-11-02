import express from 'express';

const register = express.Router();

register.post('/', (req, res) => {
  if (!(req.body.username && req.body.password)) res.status(400).send({ error: 'fieldMissing' });
  if (!(req.body.username as string).match(/^[A-Za-z0-9]*$/g)) res.status(400).send({ error: 'illegalCharacters' });
  if (req.body.username.length > 24) res.status(400).send({ error: 'usernameTooLong' });
  if (req.body.username.length < 3) res.status(400).send({ error: 'usernameTooShort' });
  if (req.body.password.length > 128) res.status(400).send({ error: 'passwordTooLong' });
  if (req.body.password.length < 8) res.status(400).send({ error: 'passwordTooShort' });
});

export default register;
