import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import {oauth2Client} from './Google';
import * as Debug from 'debug';
import {google} from 'googleapis';

const drive = google.drive({version: 'v3', auth: oauth2Client});

const debug = Debug('PL:GoogleDrive');

export const uploadFile = (folderId: string, filePath: string) => {
    return new Promise((resolve: any, reject: any) => {
        const fileMetadata = {
            name: path.basename(filePath),
            parents: [folderId]
        };
        const media = {
            mimeType: 'audio/mpeg',
            body: fs.createReadStream(filePath)
        };
        const params = {
            resource: fileMetadata,
            media: media,
            fields: 'id, name, parents, mimeType, modifiedTime'
        };
        drive.files.create(params, (error: any, response: any) => {
            if (error) {
                return reject(error);
            }
            return resolve(response);
        });
    });
};

export const emptyTrash = () => {
    return new Promise((resolve: any, reject: any) => {
        drive.files.emptyTrash((error: any, response: any) => {
            if (error) {
                // debug('emptyTrash error ', error);
                return reject(error);
            }
            return resolve(response);
        });
    });
};

export const removeFile = (fileId: string) => {
    return new Promise((resolve: any, reject: any) => {
        if (_.isEmpty(fileId)) {
            return reject({message: 'fileId is empty.'});
        }
        const data = {
            'fileId': fileId
        };
        drive.files.delete(data, (error: any, response: any) => {
            if (error) {
                // debug('emptyTrash error ', error);
                return reject(error);
            }
            return resolve(response);
        });
    });
};

export const searchIntoFolder = (folderId: string, searchFileName: string) => {
    return new Promise((resolve: any, reject: any) => {
        const separator = '"';
        const q = separator.concat(folderId, separator, ' in parents ', ' and'
            , 'name contains ', separator, searchFileName, separator);
        const params = {
            parents: [folderId],
            trashed: false,
            fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
            q: q,
            pageSize: 1
        };

        drive.files.list(params, (error: any, response: any) => {
            if (error) {
                // debug('searchIntoFolder error ', error);
                return reject(error);
            }
            return resolve(response);
        });
    });
};
export const searchIntoFolderRecursive = (folderId: string, pageToken?: string) => {
    return new Promise((resolve: any, reject: any) => {
        const separator = '"';
        const q = separator.concat(folderId, separator, ' in parents ');
        const params = {
            parents: [folderId],
            trashed: false,
            fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
            q: q,
            pageToken: '',
            pageSize: 100
        };
        if (pageToken) {
            params.pageToken = pageToken;
        }

        drive.files.list(params, (error: any, response: any) => {
            if (error) {
                // debug('searchIntoFolder error ', error);
                return reject(error);
            } else if (error && error.errors) {
                // debug('searchIntoFolder error ', error);
                return reject(error.errors);
            }
            return resolve(response);
        });
    });
};