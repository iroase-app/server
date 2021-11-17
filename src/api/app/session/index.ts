import express from 'express';
import logout from './delete';
import whoami from './get';

const session = express.Router();

session.use('/', logout);
session.use('/', whoami);

export default session;
