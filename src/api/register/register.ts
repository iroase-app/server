import express from 'express';

const register = express.Router();

register.post('/', (req, res) => {
  if (!(req.body.username && req.body.password)) res.status(400).send({ error: 'fieldMissing' });
  if (!(req.body.username as string).match(/^[A-Za-z0-9]{3,24}$/g)) res.status(400).send({ error: 'illegalCharacters' });
});

export default register;
