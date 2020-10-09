import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as bluebird from 'bluebird';
import * as MediaDownloader from '../utils/MediaDownloader';

import { APP, AUDIO_DOWNLOAD_OPTIONS, MEDIA_DIRECTORY, MEDIA_TYPE, VIDEO_DOWNLOAD_OPTIONS } from '../constants';
import { MediaItemEntity, MediaError } from '../entities/MediaItemEntity';

const debug = Debug('PL:YouTubeService');

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
    const tempMediaItems = [];
    const downloadOptionKey = 1;
    const downloadOption = AUDIO_DOWNLOAD_OPTIONS[downloadOptionKey];
    await bluebird.map(req.mediaItemsStore, async (item: MediaItemEntity) => {
        try {
            if (_.isEmpty(item.playlistId)) {
                debug('CRITICAL : Skipping Audio Media Item which has not playlistId.');
                return;
            }
            const response = await MediaDownloader.downloadAudio(req.playlistStore, item, driveDirectory, downloadOption);
            item.isDownloaded = true;
            // debug('AUDIO download complete ', response);
        } catch (error) {
            item.isDownloaded = false;
            debug('downloadAudioHQUsingMediaItem error ', error);
            debug('downloadAudioHQUsingMediaItem error item', item);
            debug('downloadAudioHQUsingMediaItem error error.stderr ', error.stderr);
            const mediaError: MediaError = {
                message: error.stderr,
                downloadOptions: downloadOptionKey
            };
            // debug('item ', item);
            if (_.isEmpty(item.errors)) {
                item.errors = [];
            }
            item.errors.push(mediaError);
            // debug('item %o ', item);
        }
        tempMediaItems.push(item);
    }, { concurrency: APP.DOWNLOAD_AUDIO_CONCURRENCY });
    req.mediaItemsStore = tempMediaItems;
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

    let downloadOptionKey = 1;
    let downloadOption = VIDEO_DOWNLOAD_OPTIONS[downloadOptionKey];
    const tempMediaItems = [];
    await bluebird.map(req.mediaItemsStore, async (item: MediaItemEntity) => {
        const updatedItem: MediaItemEntity = JSON.parse(JSON.stringify(item));
        try {
            if (_.isEmpty(item.playlistId)) {
                debug('CRITICAL : Skipping Video Media Item which has not playlistId.');
                return;
            }
            if (_.isEmpty(item.errors) === false) {
                const lastError: MediaError = _.last(item.errors);
                downloadOptionKey = lastError.downloadOptions + 1;
                if (_.isEmpty(VIDEO_DOWNLOAD_OPTIONS[downloadOptionKey]) === false) {
                    downloadOption = VIDEO_DOWNLOAD_OPTIONS[downloadOptionKey];
                } else {
                    downloadOptionKey = 1;
                }
            }
            const response = await MediaDownloader.downloadVideo(item, driveDirectory, downloadOption);
            updatedItem.isDownloaded = true;
            // debug('response  ', response);
        } catch (error) {
            updatedItem.isDownloaded = false;
            debug('downloadVideoHQUsingMediaItem error ', error);
            debug('downloadVideoHQUsingMediaItem error item', item);
            debug('downloadVideoHQUsingMediaItem error error.stderr ---- ', error.stderr);
            debug('downloadVideoHQUsingMediaItem error downloadOptionKey ---- ', downloadOptionKey);
            const mediaError: MediaError = {
                message: error.stderr,
                downloadOptions: downloadOptionKey
            };
            // debug('item ', item);
            // debug('mediaError ', mediaError);
            if (_.isEmpty(updatedItem.errors)) {
                debug('Set the error empty');
                updatedItem.errors = [];
            }
            const errors = JSON.parse(JSON.stringify(updatedItem.errors));
            // debug('item.errors Before ', errors);
            errors.push(mediaError);
            updatedItem.errors = errors;
            // debug('item.errors after ', errors);
            // debug('item %o ', item);
        }
        tempMediaItems.push(updatedItem);
    }, { concurrency: APP.DOWNLOAD_VIDEO_CONCURRENCY });
    req.mediaItemsStore = tempMediaItems;
    req.youTubeStore = { message: true };
    return next();
};
