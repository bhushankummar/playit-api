import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as find from 'find';
import * as Boom from 'boom';
import { APP, MEDIA_DIRECTORY, MEDIA_EXTENSION, YOUTUBE } from '../constants';
import * as YtplUtils from '../utils/YtplUtils';
import * as GoogleUtils from '../utils/GoogleUtils';
import { IYouTubePlaylist } from '../interface/IYouTubePlaylist';
import { google } from 'googleapis';

const debug = Debug('PL:YouTubeService');

/**
 * List all the Playlist Songs
 */
export const listPlaylistItems: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    if (_.isEmpty(params.playlistId)) {
        return next();
    } else if (_.isEmpty(req.userStore)) {
        return next();
    }
    try {
        const documents: IYouTubePlaylist = await YtplUtils.findPlaylistItems(params.playlistId);
        // debug('documents ', documents);
        req.youTubePlaylistStore = documents;
        if (APP.IS_SANDBOX === true) {
            req.youTubePlaylistStore.items = _.take(documents.items, 1);
        }
        // debug('req.youTubePlaylistStore.items  ', JSON.stringify(req.youTubePlaylistStore.items, undefined, 2));
        debug('req.youTubePlaylistStore.items  ', req.youTubePlaylistStore.items.length);
        return next();
    } catch (error) {
        debug('listPlaylistItems YtplUtils error ', error);
        try {
            const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
            oauth2Client.setCredentials(req.userStore.google);
            const youtubeClient = google.youtube({ version: 'v3', auth: oauth2Client });
            const playListItemsData = {
                part: 'snippet',
                playlistId: params.playlistId
            };
            const response = await youtubeClient.playlistItems.list(playListItemsData);
            // const response = await YouTubeUtils.searchAllItemsRecursively(params.playlistId);
            debug('response ', JSON.stringify(response, undefined, 2));
        } catch (error) {
            debug('listPlaylistItems YouTubeUtils error ', error);
            return next(Boom.notFound(error));
        }
    }
};

/**
 * List all the Playlist Songs
 */
export const removeDuplicateItemsFromLocal: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    if (_.isEmpty(req.youTubePlaylistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
        return next();
    }
    // debug('params ', params);
    let availableInLocalDirectory = 0;
    const uniqueItems: any = [];
    let mediaDirectory = MEDIA_DIRECTORY.AUDIO;
    if (params.type !== 'audio') {
        mediaDirectory = MEDIA_DIRECTORY.VIDEO;
    }
    let extension = MEDIA_EXTENSION.AUDIO;
    if (params.type !== 'audio') {
        extension = MEDIA_EXTENSION.VIDEO;
    }
    // debug('extension ', extension);
    // debug('mediaDirectory ', mediaDirectory);
    const files = find.fileSync(mediaDirectory);

    req.youTubePlaylistStore.items.map(async (value: any) => {
        try {
            const searchName = YOUTUBE.ID_SEPARATOR.concat(value.id, extension);
            // debug('searchName ', searchName);
            const index = _.findIndex(files, (value) => {
                if (value.lastIndexOf(searchName) > -1) {
                    return true;
                }
            });
            if (index === -1) {
                uniqueItems.push(value);
            } else {
                availableInLocalDirectory = availableInLocalDirectory + 1;
                // debug('value ', value);
                /**
                 * Do not remove ths File, because it may still not uploaded
                 */
            }
        } catch (error) {
            debug('removeDuplicateItemsFromLocal error ', error);
            return next(error);
        }
    });
    // debug('After remove Duplicate From Local uniqueItems ', uniqueItems.length);
    // debug('available in Local Directory ', availableInLocalDirectory);
    req.youTubePlaylistStore.items = uniqueItems;
    return next();
};