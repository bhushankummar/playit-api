import * as express from 'express';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
import * as utils from '../utils/index';
import {IRequest} from '../interface/IRequest';

const debug = Debug('PL:Config');

export const trimParams: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    debug('START : %o', utils.url(req) + req.url);
    debug('req.method : %o ', req.method);
    if (req.method === 'OPTIONS') {
        req.data = {message: true};
    }
    // Trim query and post parameters
    _.each(req.body, (value, key) => {
        if ((_.isString(value) && !_.isEmpty(value))) {
            req.body[key] = value.trim();
        }
    });

    _.each(req.query, (value, key) => {
        if ((_.isString(value) && !_.isEmpty(value))) {
            req.query[key] = value.trim();
        }
    });
    debug('req.body : %o ', req.body);

    utils.setBaseUrl(req);
    return next();
};

export const handleError = (err: any, req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (!err) {
        return next();
    }
    let errorResponse: any = {};
    if (err.output && err.output.payload) {
        errorResponse = {
            stack: err.stack,
            message: err.output.payload.message,
            error: err.output.payload.error,
            statusCode: err.output.payload.statusCode || 404
        };
    } else {
        errorResponse = {
            stack: err.stack,
            error: err.error || err.type || err.message,
            message: err.message,
            statusCode: err.statusCode || 404
        };
    }

    debug('Error :: ');
    debug(errorResponse);
    debug('END : %o', utils.url(req) + req.url);
    res.status(errorResponse.statusCode).json(errorResponse);
    res.end();
    debug('----------------------------------------------------------------------------------- ');
};

export const handleSuccess: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (req.data === undefined) {
        // debug('Return from undefined req.data ');
        return next();
    }

    const resObject = req.data || [];
    // debug('Success response :: ----------------------------------------------------------------------------------- ');
    debug('END : %o', utils.url(req) + req.url);
    return res.json(resObject);
};

export const handle404 = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    return next(Boom.notFound('Invalid request ' + utils.url(req) + req.url));
};