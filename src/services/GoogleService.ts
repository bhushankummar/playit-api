import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
import { google } from 'googleapis';
import { GOOGLE_AUTH } from '../constants';
import * as GoogleUtils from '../utils/GoogleUtils';

const debug = Debug('PL:GoogleService');

/**
 * Generates oAuth URL
 */
export const generatesAuthUrlForRegister: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (!_.isEmpty(req.userStore)) {
    return next(Boom.conflict('User is already registered with same email'));
  }
  const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
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
    // debug('params.code ', params.code);
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    const { tokens } = await oauth2Client.getToken(params.code);
    debug('tokens ', tokens);
    req.googleStore = tokens;
    return next();
  } catch (error) {
    debug('retrieveAuthorizationCode error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Retrieve authorizationCode
 */
export const retrieveGoogleProfileFromOAuth2: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(req.googleStore);
    const people = google.people({
      version: 'v1',
      auth: oauth2Client,
    });
    const response = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });
    // debug('response ', response.data);
    req.googleProfileStore = response.data;
    return next();
  } catch (error) {
    debug('retrieveGoogleProfileFromOAuth2 error ', error);
    return next(error);
  }
};

/**
 * Generates oAuth URL
 */
export const generatesAuthUrlForLogin: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_AUTH.SCOPES
  });
  req.data = { url };
  return next();
};

/**
 * Retrieve Google Profile
 */
export const retrieveGoogleProfile: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.userStore)) {
    return next();
  }
  try {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(req.userStore);
    const people = google.people({
      version: 'v1',
      auth: oauth2Client,
    });
    const response = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });
    req.googleProfileStore = response.data;
    return next();
  } catch (error) {
    debug('retrieveGoogleProfile error ', error);
    return next(error);
  }
};
