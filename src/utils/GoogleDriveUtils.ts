import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as GoogleUtils from './GoogleUtils';
// import * as Debug from 'debug';
import { google } from 'googleapis';

// const debug = Debug('PL:GoogleDrive');

export const createFolder = (parentFolderId: string, folderName: string, googleCredentials: any) => {
  return new Promise((resolve: any, reject: any) => {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(googleCredentials);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }
    const params = {
      resource: fileMetadata,
      fields: 'id, name, parents, mimeType, modifiedTime'
    };
    drive.files.create(params, (error: any, response: any) => {
      if (error && error.errors) {
        // debug('uploadFile error ', error);
        return reject(error.errors);
      } else if (error) {
        return reject(error);
      }
      return resolve(response);
    });
  });
};

export const uploadFile = (driveParentFolderId: string, localFilePath: string, googleCredentials: any) => {
  return new Promise((resolve: any, reject: any) => {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(googleCredentials);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata = {
      name: path.basename(localFilePath),
      parents: [driveParentFolderId]
    };
    const media = {
      mimeType: 'audio/mpeg',
      body: fs.createReadStream(localFilePath)
    };
    const params = {
      resource: fileMetadata,
      media: media,
      fields: 'id, name, parents, mimeType, modifiedTime'
    };
    drive.files.create(params, (error: any, response: any) => {
      if (error && error.errors) {
        // debug('uploadFile error ', error);
        return reject(error.errors);
      } else if (error) {
        return reject(error);
      }
      return resolve(response);
    });
  });
};

export const removeFile = (googleCredentials: any, fileId: string) => {
  return new Promise((resolve: any, reject: any) => {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(googleCredentials);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    if (_.isEmpty(fileId)) {
      return reject({ message: 'fileId is empty.' });
    }
    const data = {
      'fileId': fileId
    };
    drive.files.delete(data, (error: any, response: any) => {
      if (error && error.errors) {
        // debug('removeFile error ', error);
        return reject(error.errors);
      } else if (error) {
        // debug('removeFile error ', error);
        return reject(error);
      }
      return resolve(response);
    });
  });
};

export const searchIntoFolderRecursive = (googleCredentials: any, folderId: string, pageToken: string) => {
  return new Promise((resolve: any, reject: any) => {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(googleCredentials);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
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
    if (_.isEmpty(pageToken) === false) {
      params.pageToken = pageToken;
    }

    drive.files.list(params, (error: any, response: any) => {
      if (error && error.errors) {
        // debug('searchIntoFolder error ', error);
        return reject(error.errors);
      } else if (error) {
        // debug('searchIntoFolder error ', error);
        return reject(error);
      }
      return resolve(response);
    });
  });
};

export const searchFolderByName = (googleCredentials: any, query: string) => {
  return new Promise((resolve: any, reject: any) => {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(googleCredentials);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const params = {
      // parents: [folderId],
      includeRemoved: false,
      spaces: 'drive',
      trashed: false,
      fields: 'nextPageToken, files(id, name, parents, mimeType, description, trashed)',
      q: query,
      // q: `'name = "${folderName}"'`,
      // q: 'name = "DriveSyncFiles"',
      pageToken: '',
      pageSize: 100
    };

    drive.files.list(params, (error: any, response: any) => {
      if (error && error.errors) {
        // debug('searchIntoFolder error ', error);
        return reject(error.errors);
      } else if (error) {
        // debug('searchIntoFolder error ', error);
        return reject(error);
      }
      return resolve(response);
    });
  });
};
