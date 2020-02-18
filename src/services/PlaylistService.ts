import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as Boom from 'boom';
import * as _ from 'lodash';
import * as YtplUtils from '../utils/YtplUtils';
import { getMongoRepository } from 'typeorm';
import { PlaylistEntity } from '../entities/PlaylistEntity';

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
    } else if ([ '0', '1' ].indexOf(params.type) === -1) {
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
        debug('error: %o ', error);
        return next(error);
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
        return next(error);
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
    try {
        const whereCondition = {
            user: userProfile,
            urlId: params.playlistId
        };
        req.playlistStore = await playlistModel.findOne(whereCondition);
        // debug('req.playlistStore ', req.playlistStore);
    } catch (error) {
        return next(error);
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
        return next(error);
    }
    return next();
};
