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
export const listPlaylistItems: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        // debug('CRITICAL : Return from empty req.playlistStore');
        return next();
    } else if (_.isEmpty(req.playlistStore._id)) {
        debug('CRITICAL : Return from req.playlistStore._id');
        return next();
    } else if (_.isEmpty(req.userStore)) {
        return next();
    }
    try {
        const documents: IYtplPlaylist = await YtplUtils.findPlaylistItems(req.playlistStore.urlId);
        // debug('documents ', documents);
        req.youTubePlaylistStore = documents;
        if (APP.IS_SANDBOX === true) {
            req.youTubePlaylistStore.items = _.take(documents.items, 1);
        }
        // debug('req.youTubePlaylistStore.items  ', JSON.stringify(req.youTubePlaylistStore.items, undefined, 2));
        debug('Total songs in YouTube  ', req.youTubePlaylistStore.items.length);
        return next();
    } catch (error) {
        debug('listPlaylistItems YtplUtils error ', error);
        const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
        oauth2Client.setCredentials(req.userStore.google);
        const youtubeClient = google.youtube({ version: 'v3', auth: oauth2Client });
        const playListItemsData = {
            part: 'snippet',
            playlistId: req.playlistStore.urlId,
            pageToken: ''
        };
        let nextPageToken = '';
        let youtubePlaylistStoreData: Partial<IYoutubePlaylist> = {};
        let youtubePlaylistStoreItems: IYoutubePlaylistItem[] = [];
        do {
            playListItemsData.pageToken = _.clone(nextPageToken);
            nextPageToken = '';
            try {
                const response: any = await youtubeClient.playlistItems.list(playListItemsData);
                youtubePlaylistStoreData = response.data;
                // debug('youtubePlaylistStore ', JSON.stringify(response.data, undefined, 2));
                youtubePlaylistStoreItems = youtubePlaylistStoreItems.concat(response.data.items);
                if (response.data.nextPageToken) {
                    nextPageToken = _.clone(response.data.nextPageToken);
                }
            } catch (error) {
                debug('listPlaylistItems YouTubeUtils error ', error);
                return next(Boom.notFound(error));
            }
        } while (nextPageToken !== '');
        youtubePlaylistStoreData.items = youtubePlaylistStoreItems;
        const ytplPlaylistStore = YouTubeUtils.mapYouTubeResponse(youtubePlaylistStoreData);
        ytplPlaylistStore.id = req.playlistStore.urlId;
        debug('Total songs in YouTube ', ytplPlaylistStore.items.length);
        req.youTubePlaylistStore = ytplPlaylistStore;
        return next();
    }
};

/**
 * List all the Playlist Songs
 */
export const removeDuplicateItemsFromLocal: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.youTubePlaylistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
        return next();
    }
    // debug('params ', params);
    let availableInLocalDirectory = 0;
    const uniqueItems: any = [];
    let mediaDirectory = MEDIA_DIRECTORY.AUDIO;
    let extension = MEDIA_EXTENSION.AUDIO;
    if (req.playlistStore.type !== MEDIA_TYPE.AUDIO) {
        mediaDirectory = MEDIA_DIRECTORY.VIDEO;
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