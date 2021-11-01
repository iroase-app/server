import express from 'express';
import register from './api/register/register';

const app = express();
app.use(express.json());

app.use('/register', register);
export default app;
