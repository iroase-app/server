import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import register from './api/register';
import login from './api/login';
import app from './api/app';

const loader = express();
loader.use(express.json());
loader.use(cookieParser());

const headers = (req: Request, res: Response, next: Function) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
};

loader.use(headers);
loader.use(cors({
  origin: process.env.FRONTEND || '*',
}));

loader.use('/register', register);
loader.use('/login', login);
loader.use('/app', app);

export default loader;
