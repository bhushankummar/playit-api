import * as express from 'express';
import * as Debug from 'debug';
import {IRequest} from '../interface/IRequest';

Debug('PL:MediaItemController');

/**
 * Media Item Details
 */
export const mediaItemData: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    req.data = req.mediaItemsStore || [];
    return next();
};