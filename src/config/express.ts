import express from 'express';
import cors from 'cors';
import rootRoute from '@routes/index';
import errorHandler from './expressError';
import expressNotFound from './expressNotFound';
import expressLogger from './expressLogger';
//import passport from 'passport';
import session from 'express-session';
import passport from '@server/config/passport';
// import cookieParser from 'cookie-parser';

const createServer = () => {
  const app = express();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.urlencoded({ extended: true }));
  app.use(expressLogger);
  app.use(cors());
  app.use(express.json());
  app.disable('x-powered-by');
  // app.use(cookieParser());
  app.use(session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/', rootRoute);
  app.use(expressNotFound);
  app.use(errorHandler);
  app.use(express.static(__dirname + '/public'));
  return app;
};

export { createServer };
