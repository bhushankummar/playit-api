import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as YtplUtils from '../utils/YtplUtils';
import { IYtplPlaylist } from '../interface/IYtplPlaylist';


const debug = Debug('PL:YouTubeService');

/**
 * List all the Playlist Songs
 */
export const fetchPlaylistItems: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        // debug('CRITICAL : Return from empty req.playlistStore');
        return next();
    } else if (_.isEmpty(req.playlistStore._id)) {
        debug('CRITICAL : Return from req.playlistStore._id');
        return next();
    }
    try {
        const documents: IYtplPlaylist = await YtplUtils.findPlaylistItems(req.playlistStore.urlId);
        // debug('documents ', documents);
        req.youTubePlaylistStore = documents;
        // debug('req.youTubePlaylistStore.items  ', JSON.stringify(req.youTubePlaylistStore.items, undefined, 2));
        debug('Total songs in YouTube  ', req.youTubePlaylistStore.items.length);
        return next();
    } catch (error) {
        debug('fetchPlaylistItems YtplUtils error ', error);
        return next();
    }
};

/**
 * List Playlist detail by URL Id
 */
export const fetchPlaylistDetailByUrlId: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    if (_.isEmpty(params.playlistUrl)) {
        // debug('CRITICAL : Return from empty req.playlistStore');
        return next();
    }
    try {
        const documents: IYtplPlaylist = await YtplUtils.findPlaylistItems(params.playlistUrl);
        // debug('documents ', documents);
        req.youTubePlaylistStore = documents;
        // debug('req.youTubePlaylistStore.items  ', JSON.stringify(req.youTubePlaylistStore.items, undefined, 2));
        debug('YouTube Playlist detail  ', req.youTubePlaylistStore);
        return next();
    } catch (error) {
        debug('fetchPlaylistDetailByUrlId YtplUtils error ', error);
        // Do not throw error so it can fetch playlist data from next function
        return next();
    }
};
