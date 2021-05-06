import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import { UserEntity } from '../entities/UserEntity';
import { getRepository } from 'typeorm';

const debug = Debug('PL:UserService');

/**
 * Search user by email
 * @param: email
 */
export const searchOneByEmail: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.params, req.body);
  if (_.isEmpty(params.email)) {
    return next();
  }
  try {
    const whereCondition: Partial<UserEntity> = {
      email: params.email
    };
    const userModel = getRepository(UserEntity);
    req.userStore = await userModel.findOne(whereCondition);
    // debug('req.userStore ', req.userStore);
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Add new user with Google Data
 */
export const registerUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  // debug('params.state ', params.state);
  if (_.isEmpty(req.userStore) === false) {
    return next();
  }
  try {
    const user: UserEntity = new UserEntity();
    user.email = req.googleProfileStore.emailAddresses[0].value;

    user.access_token = req.googleStore.access_token;
    user.expiry_date = req.googleStore.expiry_date;
    user.id_token = req.googleStore.id_token;
    user.refresh_token = req.googleStore.refresh_token;
    user.scope = req.googleStore.scope;
    user.token_type = req.googleStore.token_type;

    // const userModel = getRepository(UserEntity);
    const userModel = getRepository(UserEntity);
    const document = await userModel.save(user);
    req.userStore = document;
    return next();
  } catch (error) {
    debug('registerUser error: %o ', error);
    return next(error);
  }
};

/**
 * Update Google Token
 */
export const updateGoogleToken: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.params, req.body, req.query);
  if (_.isEmpty(req.userStore) === true) {
    return next();
  }
  // debug('Inside updateGoogleToken ', params.state);
  // debug('req.googleStore ', req.googleStore);
  try {

    const stateObjectId = params.state;
    // debug('Inside updateGoogleToken stateObjectId', stateObjectId);
    const whereCondition: Partial<UserEntity> = {
      id: stateObjectId
    };
    const updatedUserData = _.merge(req.userStore, req.googleStore);
    // debug('merged googleStore ', googleStore);
    const userData: Partial<UserEntity> = updatedUserData;
    const userModel = getRepository(UserEntity);
    await userModel.update(whereCondition, userData);
    // debug('response ', response);
    return next();
  } catch (error) {
    debug('updateGoogleToken error ', error);
    return next(error);
  }
};

/**
 * Search user by Playlist
 * @param: email
 */
export const searchOneByPlaylistUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.playlistStore)) {
    // debug('Empty req.playlistStore');
    return next();
  } else if (_.isEmpty(req.playlistStore.userId)) {
    debug('CRITICAL : req.playlistStore.user.id is empty %o ', req.playlistStore);
    return next();
  }
  try {
    const whereCondition: Partial<UserEntity> = {
      id: req.playlistStore.userId
    };
    const userModel = getRepository(UserEntity);
    req.userStore = await userModel.findOne(whereCondition);
    // debug('req.userStore ', JSON.stringify(req.userStore, null, 2));
    return next();
  } catch (error) {
    debug('searchOneByPlaylistUser error ', error);
    return next(error);
  }
};

/**
 * Search user by Media Item
 * @param: email
 */
export const searchOneByMediaItemUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.mediaStore)) {
    return next();
  } else if (_.isEmpty(req.mediaStore.userId)) {
    debug('CRITICAL : req.mediaStore.userId is empty %o ', req.mediaStore.userId);
    return next();
  }
  try {
    const whereCondition: Partial<UserEntity> = {
      id: req.mediaStore.userId
    };
    const userModel = getRepository(UserEntity);
    req.userStore = await userModel.findOne(whereCondition);
    return next();
  } catch (error) {
    debug('error ', error);
    return next(error);
  }
};

/**
 * Update Google Root Directory
 */
export const updateRootDirectory: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore) === true) {
    return next();
  }
  try {
    const whereCondition: Partial<UserEntity> = {
      id: req.userStore.id
    };
    const userData: Partial<UserEntity> = {
      googleDriveParentId: req.googleDriveFileStore.id
    };
    const userModel = getRepository(UserEntity);
    await userModel.update(whereCondition, userData);
    req.userStore.googleDriveParentId = req.googleDriveFileStore.id;
    return next();
  } catch (error) {
    debug('updateRootDirectory error ', error);
    return next(error);
  }
};

/**
 * Search user by email
 * @param: email
 */
export const searchOneByGoogleEmailAddress: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const whereCondition: any = {
      email: req.googleProfileStore.emailAddresses[0].value
    };
    const userModel = getRepository(UserEntity);
    req.userStore = await userModel.findOne(whereCondition);
    return next();
  } catch (error) {
    return next(error);
  }
};