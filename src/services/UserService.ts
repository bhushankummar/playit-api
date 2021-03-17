import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as Boom from 'boom';
import * as _ from 'lodash';
import { UserEntity } from '../entities/UserEntity';
import { getMongoRepository, ObjectID } from 'typeorm';

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
    const userModel = getMongoRepository(UserEntity);
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
    user.google = req.googleStore;
    const userModel = getMongoRepository(UserEntity);
    const document = await userModel.save(user);
    req.userStore = document;
    return next();
  } catch (error) {
    debug('registerUser error: %o ', error);
    return next(error);
  }
};

/**
 * Validate user login parameter
 */
export const validateLoginUserData: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.params, req.body);
  if (_.isEmpty(params.email)) {
    return next(Boom.notFound('Please enter email.'));
  }
  return next();
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
  const stateObjectId = new ObjectID(params.state);
  // debug('Inside updateGoogleToken stateObjectId', stateObjectId);
  // debug('req.googleStore ', req.googleStore);
  try {
    const whereCondition: Partial<UserEntity> = {
      _id: stateObjectId
    };
    const googleStore = _.merge(req.userStore.google, req.googleStore);
    // debug('merged googleStore ', googleStore);
    const userData = {
      google: googleStore
    };
    const userModel = getMongoRepository(UserEntity);
    await userModel.update(whereCondition, userData);
    // debug('response ', response);
    return next();
  } catch (error) {
    debug('updateGoogleToken error ', error);
    return next(error);
  }
};

/**
 * Search user by email
 * @param: email
 */
export const searchOneByState: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.params, req.body, req.query);
  if (_.isEmpty(params.state) === true) {
    return next();
  }

  const stateObjectId = new ObjectID(params.state);
  try {
    const whereCondition: Partial<UserEntity> = {
      _id: stateObjectId
    };
    const userModel = getMongoRepository(UserEntity);
    req.userStore = await userModel.findOne(whereCondition);
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Search user by Playlist
 * @param: email
 */
export const searchOneByPlaylistUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.playlistStore)) {
    debug('Empty req.playlistStore');
    return next();
  } else if (_.isEmpty(req.playlistStore.user)) {
    debug('Empty req.playlistStore.user');
    return next();
  } else if (_.isEmpty(req.playlistStore.user._id)) {
    debug('CRITICAL : req.playlistStore.user._id is empty %o ', req.playlistStore);
    return next();
  }
  try {
    const whereCondition: Partial<UserEntity> = {
      _id: req.playlistStore.user._id
    };
    const userModel = getMongoRepository(UserEntity);
    req.userStore = await userModel.findOne(whereCondition);
    // debug('req.userStore ', JSON.stringify(req.userStore, null, 2));
  } catch (error) {
    return next(error);
  }
  return next();
};

/**
 * Search user by Media Item
 * @param: email
 */
export const searchOneByMediaItemUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.mediaStore)) {
    return next();
  } else if (_.isEmpty(req.mediaStore.user)) {
    debug('CRITICAL : req.mediaStore.user is empty %o ', req.mediaStore.user);
    return next();
  } else if (_.isEmpty(req.mediaStore.user._id)) {
    debug('CRITICAL : req.mediaStore.user._id is empty %o ', req.mediaStore);
    return next();
  }
  try {
    const whereCondition: Partial<UserEntity> = {
      _id: req.mediaStore.user._id
    };
    const userModel = getMongoRepository(UserEntity);
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
      _id: req.userStore._id
    };
    const userData: Partial<UserEntity> = {
      googleDriveParentId: req.googleDriveFileStore.id
    };
    const userModel = getMongoRepository(UserEntity);
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
    const userModel = getMongoRepository(UserEntity);
    req.userStore = await userModel.findOne(whereCondition);
    return next();
  } catch (error) {
    return next(error);
  }
};