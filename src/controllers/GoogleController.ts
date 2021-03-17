import * as express from 'express';
import * as Debug from 'debug';
import { IRequest } from '../interface/IRequest';
import { APP } from '../constants';

const debug = Debug('PL:GoogleController');

/**
 * Get token details
 */
export const googleDetail: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  // debug('req.googleStore ', req.googleStore);
  req.data = req.googleStore;
  return next();
};

/**
 * Get token details
 */
export const redirectToOAuth: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  // debug('req.googleStore ', req.googleStore);
  req.data = req.googleStore;
  return next();
};

/**
 * Get token details
 */
export const redirectToHome: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  debug('Completed req.tokenStore.token ', req.tokenStore.token);
  const token = `token=${req.tokenStore.token}`;
  const frontEndUrl = APP.FRONT_END_URL;
  return res.redirect(`${frontEndUrl}/login?${token}`);
};

/**
 * Google Drive Details
 */
export const googleDriveDetail: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  req.data = req.googleDriveStore || [];
  return next();
};
/**
 * Google Profile Details
 */
export const googleProfileDetail: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  req.data = req.googleProfileStore || [];
  return next();
};