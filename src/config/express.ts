import express from 'express';
import cors from 'cors';
import rootRoute from '@routes/index';
import errorHandler from './expressError';
import expressNotFound from './expressNotFound';
import expressLogger from './expressLogger';
// import cookieParser from 'cookie-parser';

const createServer = () => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(expressLogger);
  app.use(cors());
  app.use(express.json());
  app.disable('x-powered-by');
  // app.use(cookieParser());
  app.use('/', rootRoute);
  app.use(expressNotFound);
  app.use(errorHandler);
  return app;
};

export { createServer };
