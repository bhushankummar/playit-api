import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as Boom from 'boom';
import * as _ from 'lodash';
import * as mongodb from 'mongodb';
import * as YtplUtils from '../utils/YtplUtils';
import { getMongoRepository, FindOneOptions } from 'typeorm';
import { PlaylistEntity } from '../entities/PlaylistEntity';
import moment = require('moment');

const debug = Debug('PL:PlaylistService');

/**
 * Validate new playlist parameter
 */
export const validateNewPlaylist: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body);
    if (_.isEmpty(params.playlistId)) {
        return next(Boom.notFound('Please enter playlistId.'));
    } else if (_.isEmpty(params.driveFolderId)) {
        return next(Boom.notFound('Please enter Drive FolderId.'));
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
    const params = _.merge(req.body, req.params);
    if (_.isEmpty(req.userStore)) {
        return next(Boom.notFound('Invalid User'));
    } else if (!_.isEmpty(req.playlistStore)) {
        return next(Boom.notFound('This playlist has been already added.'));
    }
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    try {
        const playlistMetadata: any = await YtplUtils.findPlaylistItems(params.playlistId);
        const playlist: PlaylistEntity = new PlaylistEntity();
        playlist.user = userProfile;
        playlist.type = params.type;
        playlist.driveFolderId = params.driveFolderId;
        playlist.url = playlistMetadata.url;
        playlist.title = playlistMetadata.title;
        playlist.urlId = playlistMetadata.id;
        const playlistModel = getMongoRepository(PlaylistEntity);
        await playlistModel.save(playlist);
        req.playlistStore = playlist;
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
};

/**
 * Search All Playlist Of Logged In User
 */
export const searchAllPlaylist: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.userStore)) {
        return next(Boom.notFound('Invalid User'));
    }
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    try {
        const whereCondition = {
            user: userProfile
        };
        const playlistModel = getMongoRepository(PlaylistEntity);
        req.playlistItemStore = await playlistModel.find(whereCondition);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
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
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    try {
        const whereCondition = {
            user: userProfile,
            urlId: params.playlistId
        };
        // debug('whereCondition ', whereCondition);
        req.playlistStore = await playlistModel.findOne(whereCondition);
        // debug('req.playlistStore ', req.playlistStore);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
};

/**
 * Search Playlist using UserId & PlaylistId
 */
export const searchOneByPlaylistIdAndUserId: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    if (_.isEmpty(req.userStore)) {
        return next(Boom.notFound('Invalid User'));
    }
    const playlistModel = getMongoRepository(PlaylistEntity);
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    const playlistIdObjectId = new mongodb.ObjectID(params.playlistId);
    try {
        const whereCondition: any = {
            user: userProfile,
            _id: playlistIdObjectId
        };
        // debug('whereCondition ', whereCondition);
        req.playlistStore = await playlistModel.findOne(whereCondition);
        // debug('req.playlistStore ', req.playlistStore);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
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
    const playlistModel = getMongoRepository(PlaylistEntity);
    try {
        const whereCondition = {
            _id: req.playlistStore._id
        };
        const response = await playlistModel.deleteOne(whereCondition);
        // debug('response ', response);
        // debug('req.playlistStore ', req.playlistStore);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
};

/**
 * Search One Playlist Last Sync
 */
export const searchOneByLastSyncTimeStamp: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    try {
        const playlistModel = getMongoRepository(PlaylistEntity);
        const whereCondition = {
            $or: [
                {
                    lastSyncTimeStamp: {
                        '$lt': moment().subtract(5, 'minutes').toISOString()
                        // '$lt': moment().subtract(1, 'seconds').toISOString()
                    }
                },
                {
                    lastSyncTimeStamp: undefined
                }
            ]
        };
        const options: FindOneOptions<PlaylistEntity> = {
            where: whereCondition,
            order: {
                lastSyncTimeStamp: 'ASC'
            }
        };
        req.playlistStore = await playlistModel.findOne(options);
        // debug('req.playlistStore ', req.playlistStore);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
};

/**
 * Search One Playlist Last Sync
 */
export const searchOneByLastUploadTimeStamp: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    try {
        const playlistModel = getMongoRepository(PlaylistEntity);
        const whereCondition = {
            $or: [
                {
                    lastUploadTimeStamp: {
                        '$lt': moment().subtract(5, 'minutes').toISOString()
                        // '$lt': moment().subtract(1, 'seconds').toISOString()
                    }
                },
                {
                    lastUploadTimeStamp: undefined
                }
                // {
                //     // THis is for the development purpose only.
                //     // It should be playlist url
                //     // urlId: 'RDCLAK5uy_nbla9IlAw2OQmPRxOiBYdAl_jtWLDPH9Y'
                //     urlId: 'PLV4x9RCRiG1DGb_hwKXmsr3MIDEAl21ov'
                // }
            ]
        };
        const options: FindOneOptions<PlaylistEntity> = {
            where: whereCondition,
            order: {
                lastUploadTimeStamp: 'ASC'
            }
        };
        req.playlistStore = await playlistModel.findOne(options);
        debug('req.playlistStore ', req.playlistStore);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
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
        const whereCondition = {
            _id: req.playlistStore._id
        };
        const updateData = {
            lastSyncTimeStamp: moment().toISOString()
        };
        await playlistModel.update(whereCondition, updateData);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
};

/**
 * Search One Playlist Last Sync
 */
export const updateLastUploadTimeStamp: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        return next();
    }
    try {
        const playlistModel = getMongoRepository(PlaylistEntity);
        const whereCondition = {
            _id: req.playlistStore._id
        };
        const updateData = {
            lastUploadTimeStamp: moment().toISOString()
        };
        await playlistModel.update(whereCondition, updateData);
    } catch (error) {
        debug('error ', error);
        return next(Boom.notFound(error));
    }
    return next();
};
