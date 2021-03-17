import * as express from 'express';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
import {IRequest} from '../interface/IRequest';

Debug('PL:UserController');

/**
 * Get user register details
 */
export const userDetail: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const userStore = req.userStore;
  if (_.isEmpty(userStore)) {
    return next(Boom.notFound('Please try again'));
  }
  req.data = userStore;
  return next();
};

/**
 * Get user login details
 */
export const userLoginDetail: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const userStore = req.userStore;
  const tokenStore = req.tokenStore;
  if (_.isEmpty(userStore)) {
    return next(Boom.notFound('Please try again'));
  } else if (_.isEmpty(tokenStore)) {
    return next(Boom.notFound('Please try again'));
  }
  // eslint-disable-next-line spellcheck/spell-checker
  req.data = {user: userStore, tokPL: tokenStore};
  return next();
};

/**
 * Get user details
 */
export const me: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const userStore = req.user;
  if (_.isEmpty(userStore)) {
    return next(Boom.notFound('Session has been expired'));
  }
  req.data = userStore;
  return next();
};

/**
 * For logout user
 */
export const logout: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const tokenStore = req.tokenStore;
  if (_.isEmpty(tokenStore)) {
    return next(Boom.notFound('Please try again'));
  }
  req.data = {message: true};
  return next();
};