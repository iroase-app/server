import express from 'express';

const whoami = express.Router();

whoami.get('/', (req, res) => {
  const info = req.user;
  res.status(200).send({ info });
});

export default whoami;
