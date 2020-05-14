import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as bluebird from 'bluebird';
import * as MediaDownloader from '../utils/MediaDownloader';

import { APP, MEDIA_DIRECTORY, MEDIA_TYPE } from '../constants';

const debug = Debug('PL:YouTubeService');

/**
 * Download HQ Audio using URL
 */
export const downloadAudioHQUsingYouTube: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        return next();
    } else if (req.playlistStore.type !== MEDIA_TYPE.AUDIO) {
        // debug('Return from media type. Current Value ', params.type);
        return next();
    }

    const driveDirectory = path.join(MEDIA_DIRECTORY.AUDIO, req.playlistStore.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    await bluebird.map(req.youTubePlaylistStore.items, async (item: any) => {
        try {
            const response = await MediaDownloader.downloadAudio(req.youTubePlaylistStore, item, driveDirectory);
            // debug('AUDIO download complete ', response);
        } catch (error) {
            debug('downloadAudioHQ error ', error);
            debug('downloadAudioHQ error item', item);
        }
    }, { concurrency: APP.DOWNLOAD_AUDIO_CONCURRENCY });
    req.youTubeStore = { message: true };
    return next();
};

/**
 * Download HQ Video using URL
 */
export const downloadVideoHQUsingYouTube: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        return next();
    } else if (req.playlistStore.type !== MEDIA_TYPE.VIDEO) {
        // debug('Return from media type. Current Value ', params.type);
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
        return next();
    }

    const driveDirectory = path.join(MEDIA_DIRECTORY.VIDEO, req.playlistStore.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    await bluebird.map(req.youTubePlaylistStore.items, async (item: any) => {
        try {
            const response = await MediaDownloader.downloadVideoExec(item, driveDirectory);
            // debug('response  ', response);
        } catch (error) {
            debug('downloadVideoHQ error ', error);
            debug('downloadVideoHQ error item', item);
        }
    }, { concurrency: APP.DOWNLOAD_VIDEO_CONCURRENCY });
    req.youTubeStore = { message: true };
    return next();
};

/**
 * Download HQ Audio using URL
 */
export const downloadAudioHQUsingMediaItem: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        return next();
    } else if (req.playlistStore.type !== MEDIA_TYPE.AUDIO) {
        // debug('Return from media type. Current Value ', params.type);
        return next();
    }

    const driveDirectory = path.join(MEDIA_DIRECTORY.AUDIO, req.playlistStore.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    await bluebird.map(req.mediaItemsStore, async (item: any) => {
        try {
            if (_.isEmpty(item.playlistId)) {
                debug('CRITICAL : Skipping Audio Media Item which has not playlistId.');
                return;
            }
            const response = await MediaDownloader.downloadAudio(req.playlistStore, item, driveDirectory);
            // debug('AUDIO download complete ', response);
        } catch (error) {
            debug('downloadAudioHQUsingMediaItem error ', error);
            debug('downloadAudioHQUsingMediaItem error item', item);
        }
    }, { concurrency: APP.DOWNLOAD_AUDIO_CONCURRENCY });
    req.youTubeStore = { message: true };
    return next();
};

/**
 * Download HQ Video using URL
 */
export const downloadVideoHQUsingMediaItem: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        return next();
    } else if (req.playlistStore.type !== MEDIA_TYPE.VIDEO) {
        // debug('Return from media type. Current Value ', params.type);
        return next();
    }

    const driveDirectory = path.join(MEDIA_DIRECTORY.VIDEO, req.playlistStore.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    await bluebird.map(req.mediaItemsStore, async (item: any) => {
        try {
            if (_.isEmpty(item.playlistId)) {
                debug('CRITICAL : Skipping Video Media Item which has not playlistId.');
                return;
            }
            const response = await MediaDownloader.downloadVideoExec(item, driveDirectory);
            // debug('response  ', response);
        } catch (error) {
            debug('downloadVideoHQUsingMediaItem error ', error);
            debug('downloadVideoHQUsingMediaItem error item', item);
        }
    }, { concurrency: APP.DOWNLOAD_VIDEO_CONCURRENCY });
    req.youTubeStore = { message: true };
    return next();
};
