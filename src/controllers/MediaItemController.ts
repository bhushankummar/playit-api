import * as express from 'express';
import * as Debug from 'debug';
import * as _ from 'lodash';
import { IRequest } from '../interface/IRequest';

Debug('PL:MediaItemController');

/**
 * Media Item Details
 */
export const mediaItemData: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    req.data = {
        data: req.mediaItemsStore || [],
        length: req.mediaItemsStore.length
    };
    return next();
};

/**
 * Media Item Details
 */
export const mediaItemSync: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        req.data = {
            message: 'Their is no pending playlist for the sync.'
        };
    }
    return next();
};