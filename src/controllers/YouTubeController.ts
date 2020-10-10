import * as express from 'express';
import * as Debug from 'debug';
import { IRequest } from '../interface/IRequest';

Debug('PL:YouTubeController');

/**
 * YouTube Details
 */
export const youtubeData: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    req.data = {
        mediaItemsStore: req.mediaItemsStore
    };
    return next();
};