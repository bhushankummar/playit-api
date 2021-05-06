import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as Debug from 'debug';
import * as cors from 'cors';
import * as config from './config/AppConfig';
import * as passportConfig from './config/passport';
import { router } from './routes';
import * as database from './config/db';
import * as express from 'express';
import * as CroneJobs from './job';

const app = express();
const debug = Debug('PL:App');

const whitelist = ['http://localhost:3007', 'http://localhost:4200', 'https://playit-app.herokuapp.com'];
app.use(cors({ origin: whitelist }));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

passport.use(passportConfig.passport);

passport.serializeUser((user, callback) => {
  return callback(undefined, user);
});

passport.deserializeUser((user, callback) => {
  return callback(undefined, user);
});

app.use(config.trimParams);

app.get('/', (req, res) => {
  return res.json({ message: 'API is running!' });
});

app.get('/favicon.ico', (req, res) => {
  return res.json({ message: 'API is running!' });
});

/**
 *  This is our route middleware
 */
app.use('/api/v1', router);

/**
 *  Error handling
 */
app.use(config.handleError);

/**
 *  Handle response
 */
app.use(config.handleSuccess);

/**
 *  Handle 404 Requests
 */
app.use(config.handle404);

/**
 *  Server process
 */
app.set('PORT', process.env.PORT || 3007);
app.listen(app.get('PORT'), async () => {
  await database.init();
  CroneJobs.initAllJobs();
  debug(' Server has been started on PORT: %o', app.get('PORT'));
  return debug(`***************************** Server has been started on PORT ${app.get('PORT')}`);
});

process.on('uncaughtException', (err) => {
  debug('CRITICAL ERROR : Inside uncaughtException, it prevents server to get crashed.');
  debug(err);
});

export { app };