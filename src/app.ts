import express from 'express';
import register from './api/register';
import login from './api/login';

const app = express();
app.use(express.json());

app.use('/register', register);
app.use('/login', login);
export default app;
