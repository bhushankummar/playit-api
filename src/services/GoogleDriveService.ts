import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as GoogleDrive from '../utils/GoogleDrive';
import * as utils from '../utils';
const debug = Debug('PL:GoogleDriveService');

/**
 * This function will upload Audio files to the drive
 */
export const uploadToDriveUsingPath: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.mediaItemStore)) {
        return next();
    } else if (_.isEmpty(req.userStore)) {
        return next();
    }
    try {
        if (fs.existsSync(req.mediaItemStore.localFilePath) === false) {
            debug('CRITICAL: This file does not exits. %o ', req.mediaItemStore);
            req.mediaItemStore.localFilePath = '';
            return next();
        }
        debug('Start uploading %o ', req.mediaItemStore.title);
        const response: any = await GoogleDrive.uploadFile(req.mediaItemStore.driveFolderId, req.mediaItemStore.localFilePath, req.userStore.google);
        if (response && response.data) {
            fs.unlinkSync(req.mediaItemStore.localFilePath);
            req.googleDriveFileStore = response.data;
        }
        // debug('Files has been uploaded ', req.googleDriveFileStore);
        debug('Upload complete %o ', req.mediaItemStore.title);
        await utils.wait(0.1);
    } catch (error) {
        debug('uploadToDrive error ', error);
        await utils.wait(1);
    }
    return next();
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
