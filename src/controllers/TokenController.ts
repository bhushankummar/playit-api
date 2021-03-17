import * as express from 'express';
import * as Debug from 'debug';
import {IRequest} from '../interface/IRequest';

Debug('PL:TokenController');

/**
 * Get token details
 */
export const tokens: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  req.data = req.tokenStore;
  return next();
};