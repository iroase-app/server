import express from 'express';
import register from './api/register';
import login from './api/login';
import app from './api/app';

const loader = express();
loader.use(express.json());

loader.use('/register', register);
loader.use('/login', login);
loader.use('/app', app);

export default loader;
