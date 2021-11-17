import express from 'express';

const whoami = express.Router();

whoami.get('/', (req, res) => {
  res.status(200).send({ username: req.user?.username, isModerator: req.user?.isModerator });
});

export default whoami;
