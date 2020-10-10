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
    }
    let rootDirector = MEDIA_DIRECTORY.VIDEO;
    let mediaType = 'mp4';
    const downloadOptionKey = 1;
    let downloadOption = VIDEO_DOWNLOAD_OPTIONS[downloadOptionKey];
    if (req.playlistStore.type === MEDIA_TYPE.AUDIO) {
        rootDirector = MEDIA_DIRECTORY.AUDIO;
        downloadOption = AUDIO_DOWNLOAD_OPTIONS[downloadOptionKey];
        mediaType = 'mp3';
    }
    const driveDirectory = path.join(rootDirector, req.playlistStore.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    const tempMediaItems = [];
    await bluebird.map(req.mediaItemsStore, async (item: MediaItemEntity) => {
        const updatedItem: any = JSON.parse(JSON.stringify(item));
        if (_.isEmpty(updatedItem.errors) || _.isNull(updatedItem.errors)) {
            updatedItem.errors = [];
        }
        try {
            if (_.isEmpty(item.playlistId)) {
                debug('CRITICAL : Skipping Audio Media Item which has not playlistId.');
                return;
            }
            const response: any = await MediaDownloader.downloadMedia(downloadOption, mediaType, item, driveDirectory);
            updatedItem.localFilePath = response.filePath;
            updatedItem.isDownloaded = true;
            // const response = await MediaDownloader.downloadAudio(req.playlistStore, item, driveDirectory, downloadOption);
            debug('AUDIO download complete ', response);
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
            updatedItem.errors.push(mediaError);
            // debug('item %o ', item);
        }
        tempMediaItems.push(updatedItem);
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
    await bluebird.map(req.mediaItemsStore, async (item: any) => {
        const updatedItem: any = JSON.parse(JSON.stringify(item));
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
            const response: any = await MediaDownloader.downloadVideo(item, driveDirectory, downloadOption);
            updatedItem.localFilePath = response.filePath;
            updatedItem.isDownloaded = true;
            debug('video response  ', response);
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
