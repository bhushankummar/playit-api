import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import * as bluebird from 'bluebird';
import * as moment from 'moment';
import { APP, MEDIA_DIRECTORY, MEDIA_EXTENSION, YOUTUBE, MEDIA_TYPE } from '../constants';
import * as find from 'find';
import * as GoogleDrive from '../utils/GoogleDrive';
import * as utils from '../utils';
import { getMongoRepository } from 'typeorm';
import { MediaItemEntity } from '../entities/MediaItemEntity';

const debug = Debug('PL:GoogleDriveService');

/**
 * This function will prepare files for the Upload
 */
export const prepareAudioFilesForTheUpload: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    let localMediaStore: any = [];
    if (params.type === 'audio') {
        localMediaStore = find.fileSync(/\.mp3$/, MEDIA_DIRECTORY.AUDIO);
    } else if (params.type === 'video') {
        localMediaStore = find.fileSync(/\.mp4$/, MEDIA_DIRECTORY.VIDEO);
    }
    debug('localMediaStore items ', localMediaStore.length);
    if (_.isEmpty(localMediaStore)) {
        return next();
    }
    const uniqueItems: any = [];
    await bluebird.map(localMediaStore, async (value: any) => {
        try {
            const folderId = path.basename(path.dirname(value));
            const fileDetail = fs.statSync(value);
            const fileLastModifiedTime = moment(fileDetail.mtime).add(4, 'minutes');
            const currentTimeObject = moment();
            if (currentTimeObject.isAfter(fileLastModifiedTime) === true) {
                let youTubeId: any = path.basename(value);
                youTubeId = youTubeId.split(YOUTUBE.ID_SEPARATOR);
                youTubeId = _.last(youTubeId);
                const searchName = YOUTUBE.ID_SEPARATOR.concat(youTubeId);
                const response: any = await GoogleDrive.searchIntoFolder(folderId, searchName);
                // debug('response.data.files ', response.data.files);
                if (response && response.data && response.data.files && response.data.files.length === 0) {
                    uniqueItems.push(value);
                } else {
                    if (response.data && response.data.files && response.data.files[ 0 ]) {
                        const modifiedTimeObject = moment(response.data.files[ 0 ].modifiedTime);
                        const currentTimeObject = moment().subtract(5, 'minutes');
                        if (currentTimeObject.isAfter(modifiedTimeObject) === true) {
                            fs.unlinkSync(value);
                        }
                    }
                }
            }
            await utils.wait(0.1);
        } catch (error) {
            debug('error prepareAudioFilesForTheUpload ', error.errors);
            await utils.wait(1);
        }
    });
    debug('Audio/Video Ready to Upload on Google Drive ', uniqueItems);
    req.localMediaStore = uniqueItems;
    return next();
};

/**
 * This function will upload Audio files to the drive
 */
export const uploadToDrive: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.localMediaStore)) {
        return next();
    }
    const items: any = [];
    await bluebird.map(req.localMediaStore, async (value: any) => {
        try {
            // debug('Start uploading %o ', path.basename(value));
            const folderId = path.basename(path.dirname(value));
            const response: any = await GoogleDrive.uploadFile(folderId, value);
            if (response && response.data) {
                fs.unlinkSync(value);
                items.push(response.data);
            }
            // debug('Upload complete %o ', path.basename(value));
            await utils.wait(0.1);
        } catch (error) {
            debug('uploadToDrive error ', error.errors);
            await utils.wait(1);
        }
    });
    debug('Files has been uploaded ', items);
    req.googleDriveStore = items;
    return next();
};

/**
 * This function will upload Audio files to the drive
 */
export const cleanTrash: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.userStore)) {
        return next();
    } else if (_.isEmpty(req.userStore.google)) {
        return next();
    }
    try {
        await GoogleDrive.emptyTrash(req.userStore.google);
        req.googleDriveStore = { message: true };
        return next();
    } catch (error) {
        debug('cleanTrash error ', error);
        return next(error);
    }
};

/**
 * This function will search Audio files to the drive
 */
export const searchAllFiles: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.userStore)) {
        return next();
    } else if (_.isEmpty(req.userStore.google)) {
        return next();
    } else if (_.isEmpty(req.playlistStore)) {
        debug('CRITICAL : Empty req.playlistStore');
        return next();
    }
    try {
        const folderId = req.playlistStore.driveFolderId;
        let nextPageToken = '';
        let files: any[] = [];
        do {
            const response: any = await GoogleDrive.searchIntoFolderRecursive(req.userStore.google, folderId, nextPageToken);
            if (response && response.data) {
                // debug('response.data.nextPageToken ', response.data.nextPageToken);
                nextPageToken = response.data.nextPageToken || '';
            }
            files = files.concat(response.data.files);
            // debug('files ', files.length);
        } while (nextPageToken !== '');
        debug('Total files in GoogleDrive ', files.length);
        req.googleDriveStore = files;
        return next();
    } catch (error) {
        debug('searchAllFiles error ', error);
        return next(error);
    }
};
