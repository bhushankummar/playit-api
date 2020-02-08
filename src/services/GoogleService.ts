import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
import { google } from 'googleapis';
import { GOOGLE_AUTH } from '../constants';
import { oauth2Client } from '../utils/Google';

const plus = google.plus({ version: 'v1' });

const debug = Debug('PL:GoogleService');

/**
 * Generates oAuth URL
 */
export const generatesAuthUrl: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (!_.isEmpty(req.userStore)) {
        return next(Boom.conflict('User is already registered with same email'));
    }
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GOOGLE_AUTH.SCOPES
    });
    req.googleStore = { url };
    return next();
};

/**
 * Retrieve authorizationCode
 */
export const retrieveAuthorizationCode: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.query);
    try {
        const { tokens } = await oauth2Client.getToken(params.code);
        oauth2Client.setCredentials(tokens);
        req.googleStore = tokens;
        return next();
    } catch (error) {
        debug('error ', error);
        return next(error);
    }
};

/**
 * set Credentials For LoggedIn Google User
 */
export const setCredentials: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.userStore)) {
        return next(Boom.conflict('User is not loggedIn.'));
    }
    try {
        oauth2Client.setCredentials(req.userStore.google);
        return next();
    } catch (error) {
        debug('error ', error);
        return next(error);
    }
};

/**
 * Retrieve authorizationCode
 */
export const retrieveGoogleProfile: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    try {
        plus.people.get({ userId: 'me', auth: oauth2Client }, (error: any, response: any) => {
            if (error) {
                debug('error ', error);
                return next(error);
            }
            // debug('response ', response.data);
            req.googleProfileStore = response.data;
            return next();
        });
    } catch (error) {
        debug('error ', error);
        return next(error);
    }
};

/**
 * Retrieve authorizationCode
 */
export const refreshToken: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.query);
    try {
        debug('req.userStore.google ', req.userStore.google);
        oauth2Client.setCredentials(req.userStore.google);
        const data = await oauth2Client.getRequestMetadata();
        debug('data ', data);
        const data1 = await oauth2Client.getAccessToken();
        debug('data1 ', data1);
        oauth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                // store the refresh_token in my database!
                debug('******************* Refresh Token ', tokens.refresh_token);
            }
            debug('******************* Access Token ', tokens.access_token);
        });
        return next();
    } catch (error) {
        debug('error ', error);
        return next(error);
    }
};