import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as find from 'find';
import * as Boom from 'boom';
import { APP, MEDIA_DIRECTORY, MEDIA_EXTENSION, YOUTUBE, MEDIA_TYPE } from '../constants';
import * as YtplUtils from '../utils/YtplUtils';
import * as GoogleUtils from '../utils/GoogleUtils';
import * as YouTubeUtils from '../utils/YouTubeUtils';
import { IYtplPlaylist } from '../interface/IYtplPlaylist';
import { google } from 'googleapis';
import { IYoutubePlaylist, IYoutubePlaylistItem } from '../interface/IYoutubePlaylist';

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
