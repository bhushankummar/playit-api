import * as express from 'express';
import * as Debug from 'debug';
import {IRequest} from '../interface/IRequest';

Debug('PL:PlaylistController');

/**
 * Playlist Details
 */
export const playlistData: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  req.data = req.playlistItemStore || [];
  return next();
};

/**
 * Playlist Details
 */
export const playlist: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  req.data = req.playlistStore || [];
  return next();
};