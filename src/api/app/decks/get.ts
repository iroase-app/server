import express from 'express';
import verifySession from '../../_common/authMiddleware/verifySession';

const getDecks = express.Router();

getDecks.get('/', verifySession, (req, res) => {
  // TODO: Implement the route. This just makes the test pass.
  res.status(200).send({
    decks: [
      {
        id: 1,
        name: 'foobar',
        public: false,
        course: null,
      },
    ],
  });
});

export default getDecks;
