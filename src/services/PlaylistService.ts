import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as Boom from 'boom';
import * as _ from 'lodash';
import { getMongoRepository, FindOneOptions, FindManyOptions } from 'typeorm';
import { PlaylistEntity } from '../entities/PlaylistEntity';
import * as utils from '../utils';
import moment = require('moment');

const debug = Debug('PL:PlaylistService');

/**
 * Validate new playlist parameter
 */
export const validateNewPlaylist: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.params, req.body);
  if (_.isEmpty(params.playlistUrl)) {
    return next(Boom.notFound('Please enter playlistUrl.'));
  } else if (_.isEmpty(params.type)) {
    return next(Boom.notFound('Please enter type of the media playlist.'));
  } else if (['0', '1'].indexOf(params.type) === -1) {
    return next(Boom.notFound('Please enter valid type of the media playlist.'));
  }
  return next();
};

/**
 * Insert New Playlist
 * @param: userId
 * @param: type
 * @param: url
 */
export const addPlaylist: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  // debug('Inside addPlaylist');
  const params = _.merge(req.body, req.params);
  if (_.isEmpty(req.userStore)) {
    return next(Boom.notFound('Invalid User'));
  } else if (_.isEmpty(req.playlistStore) === false) {
    return next(Boom.notFound('This playlist has been already added.'));
  }

  try {
    if (_.isEmpty(req.youTubePlaylistStore)) {
      return next(Boom.notFound('This is not a valid playlist, Please try again.'));
    }

    const playlist: PlaylistEntity = new PlaylistEntity();
    playlist.url = req.youTubePlaylistStore.url;
    playlist.title = req.youTubePlaylistStore.title;
    playlist.urlId = req.youTubePlaylistStore.id;

    playlist.userId = req.userStore.id;
    playlist.type = params.type;
    playlist.driveFolderId = params.driveFolderId;
    if (_.isEmpty(params.driveFolderId)) {
      playlist.driveFolderId = req.googleDriveFileStore.id;
    } else {
      debug('driveFolderId : This will not create new folder.');
    }
    const playlistModel = getMongoRepository(PlaylistEntity);
    await playlistModel.save(playlist);
    req.playlistStore = playlist;
    return next();
  } catch (error) {
    debug('addPlaylist error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Search All Playlist Of Logged In User
 */
export const searchAllPlaylist: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next(Boom.notFound('Invalid User'));
  }
  // debug('userProfile ', userProfile);
  try {
    const whereCondition: Partial<PlaylistEntity> = {
      userId: req.userStore.id
    };
    const options: FindManyOptions<PlaylistEntity> = {
      where: whereCondition,
      order: {
        title: 'ASC'
      }
    };
    const playlistModel = getMongoRepository(PlaylistEntity);
    req.playlistItemStore = await playlistModel.find(options);
    return next();
  } catch (error) {
    debug('searchAllPlaylist error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Search Playlist using UserId & Playlist UrlId
 */
export const searchOneByPlaylistUrlIdAndUserId: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.body, req.params);
  if (_.isEmpty(req.userStore)) {
    return next(Boom.notFound('Invalid User'));
  }
  const playlistModel = getMongoRepository(PlaylistEntity);
  try {
    const whereCondition: Partial<PlaylistEntity> = {
      userId: req.userStore.id,
      urlId: params.playlistUrl
    };
    // debug('whereCondition ', whereCondition);
    req.playlistStore = await playlistModel.findOne(whereCondition);
    // debug('req.playlistStore ', req.playlistStore);
    return next();
  } catch (error) {
    debug('searchOneByPlaylistUrlIdAndUserId error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Search Playlist using UserId & PlaylistId
 */
export const searchOneByPlaylistIdAndUserId: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.body, req.params);
  if (_.isEmpty(req.userStore)) {
    return next(Boom.notFound('Invalid User'));
  }
  try {
    const playlistModel = getMongoRepository(PlaylistEntity);
    const playlistIdObjectId = utils.toObjectId(params.playlistId);
    const whereCondition: Partial<PlaylistEntity> = {
      userId: req.userStore.id,
      id: playlistIdObjectId
    };
    // debug('whereCondition ', whereCondition);
    req.playlistStore = await playlistModel.findOne(whereCondition);
    // debug('req.playlistStore ', req.playlistStore);
    return next();
  } catch (error) {
    debug('searchOneByPlaylistIdAndUserId error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Remove Playlist
 */
export const removePlaylist: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next(Boom.notFound('Invalid User'));
  } else if (_.isEmpty(req.playlistStore)) {
    return next(Boom.notFound('This playlist does not exits.'));
  }
  try {
    const playlistModel = getMongoRepository(PlaylistEntity);
    const whereCondition: Partial<PlaylistEntity> = {
      id: req.playlistStore.id
    };
    await playlistModel.deleteOne(whereCondition);
    // debug('response ', response);
    // debug('req.playlistStore ', req.playlistStore);
    return next();
  } catch (error) {
    debug('removePlaylist error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Search One Playlist Last Sync
 */
export const searchOneByLastSyncTimeStamp: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const playlistModel = getMongoRepository(PlaylistEntity);
    // const whereCondition = {
    //   $or: [
    //     {
    //       lastSyncTimeStamp: {
    //         $lt: moment().subtract(2, 'minutes').toISOString()
    //       }
    //     },
    //     {
    //       lastSyncTimeStamp: undefined
    //     }
    //   ]
    // };
    const options: FindOneOptions<PlaylistEntity> = {
      // where: whereCondition,
      order: {
        lastSyncTimeStamp: 'ASC'
      }
    };
    req.playlistStore = await playlistModel.findOne(options);
    // debug('req.playlistStore ', req.playlistStore);
    return next();
  } catch (error) {
    debug('searchOneByLastSyncTimeStamp error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Search One Playlist Last Sync
 */
export const updateLastSyncTimeStamp: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.playlistStore)) {
    return next();
  }
  try {
    const playlistModel = getMongoRepository(PlaylistEntity);
    const whereCondition: Partial<PlaylistEntity> = {
      id: req.playlistStore.id
    };
    const updateData: Partial<PlaylistEntity> = {
      lastSyncTimeStamp: moment().toDate()
    };
    await playlistModel.update(whereCondition, updateData);
    return next();
  } catch (error) {
    debug('updateLastSyncTimeStamp error ', error);
    return next(Boom.notFound(error));
  }
};

/**
 * Update Playlist
 * @param: userId
 * @param: type
 * @param: url
 */
export const updatePlaylistDriveFolder: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.playlistStore)) {
    return next();
  } else if (_.isEmpty(req.googleDriveFileStore)) {
    return next();
  } else if (_.isEmpty(req.youTubePlaylistStore)) {
    return next(Boom.notFound('This is not a valid playlist, Please try again.'));
  }
  try {
    const playlistModel = getMongoRepository(PlaylistEntity);
    const whereCondition: Partial<PlaylistEntity> = {
      id: req.playlistStore.id
    };

    const updateData: Partial<PlaylistEntity> = {
      url: req.youTubePlaylistStore.url,
      title: req.youTubePlaylistStore.title,
      urlId: req.youTubePlaylistStore.id,
      driveFolderId: req.googleDriveFileStore.id
    };
    await playlistModel.update(whereCondition, updateData);
    return next();
  } catch (error) {
    debug('updatePlaylistDriveFolder error ', error);
    return next(Boom.notFound(error));
  }
};
