import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as GoogleDrive from '../utils/GoogleDriveUtils';
import * as YtplUtils from '../utils/YtplUtils';
import * as Boom from 'boom';
import { IGoogleDriveFileStore } from '../interface/IGoogleDriveFileStore';
const debug = Debug('PL:GoogleDriveService');

/**
 * This function will Create Root Folder If Not Exits
 */
export const createRootFolderIfNotExits: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.userStore.access_token)) {
    debug('CRITICAL : req.userStore.google is empty %o ', req.userStore);
    return next(Boom.notFound('Google oAuth is empty.'));
  } else if (_.isEmpty(req.userStore.refresh_token)) {
    return next(Boom.notFound('Refresh Token is empty.'));
  }
  try {
    const query = 'name = "DriveSyncFiles"';
    // const query = 'name = "DriveSyncFiles" in parents and trashed=false';
    const folderResponse: any = await GoogleDrive.searchFolderByName(req.userStore, query);
    if (folderResponse && folderResponse.data) {
      // debug('folderResponse.data ', folderResponse);
      // debug('folderResponse.data ', folderResponse.data);
      const folder = _.find(folderResponse.data.files, (value) => {
        if (value.trashed === false) {
          return value;
        }
      });
      // debug('folder ', folder);
      req.googleDriveFileStore = folder;
      if (_.isEmpty(folder) === false) {
        return next();
      }
    }
    const response: any = await GoogleDrive.createFolder('', 'DriveSyncFiles', req.userStore);
    if (response && response.data) {
      req.googleDriveFileStore = response.data;
    }
    // debug('Folder has been created ', req.googleDriveFileStore);
    return next();
  } catch (error) {
    debug('createRootFolder error ', error);
    return next(error);
  }
};

/**
 * This function will upload Audio files to the drive
 */
export const uploadToDriveUsingPath: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.mediaStore)) {
    return next();
  } else if (_.isEmpty(req.userStore)) {
    debug('CRITICAL : req.userStore is empty %o ', req.userStore);
    return next();
  } else if (_.isEmpty(req.userStore.access_token)) {
    debug('CRITICAL : req.userStore.google is empty %o ', req.userStore);
    return next();
  } else if (_.isEmpty(req.userStore.refresh_token)) {
    return next();
  }
  try {
    if (fs.existsSync(req.mediaStore.localFilePath) === false) {
      debug('CRITICAL: This file does not exits %o ', req.mediaStore);
      req.mediaStore.localFilePath = '';
      return next();
    }
    debug('## Start uploading %o ', req.mediaStore.title);
    const response: any = await GoogleDrive.uploadFile(req.mediaStore.driveFolderId, req.mediaStore.localFilePath, req.userStore);
    if (response && response.data) {
      req.googleDriveFileStore = response.data;
      // try {
      //   fs.unlinkSync(req.mediaStore.localFilePath);
      // } catch (error) {
      //   // debug('error *******fs.unlinkSync %o ', req.mediaStore);
      // }
    }
    // debug('Files has been uploaded ', req.googleDriveFileStore);
    debug('## Upload complete %o ', req.mediaStore.title);
    return next();
  } catch (error) {
    debug('## Upload failed %o ', req.mediaStore.title);
    debug('uploadToDrive error ', error);
    debug('uploadToDrive error %o ', req.userStore);
    return next();
  }
};

/**
 * This function will search Audio files to the drive
 */
export const searchAllFiles: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.userStore.access_token)) {
    return next();
  } else if (_.isEmpty(req.userStore.refresh_token)) {
    return next();
  } else if (_.isEmpty(req.playlistStore)) {
    debug('CRITICAL : Empty req.playlistStore');
    return next();
  }
  try {
    const folderId = req.playlistStore.driveFolderId;
    let nextPageToken = '';
    let files: Partial<IGoogleDriveFileStore>[] = [];
    do {
      const response: any = await GoogleDrive.searchIntoFolderRecursive(
        req.userStore, folderId, nextPageToken
      );
      if (response && response.data) {
        // debug('response.data.nextPageToken ', response.data.nextPageToken);
        nextPageToken = response.data.nextPageToken || '';
      }
      files = files.concat(response.data.files);
      // files = _.merge(files, response.data.files);
      // debug('files ', files.length);
    } while (nextPageToken !== '');
    const filteredFiles: any = _.filter(files, {
      trashed: false
    });
    debug(`Total files in GoogleDrive - ${req.playlistStore.title} - ${filteredFiles.length}`);
    req.googleDriveFileItemsStore = filteredFiles;
    return next();
  } catch (error) {
    debug('searchAllFiles error ', error);
    return next(error);
  }
};

/**
 * This function will Create a playlist folder into Google Drive
 */
export const createPlaylistFolder: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.body, req.params);
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(params.driveFolderId) === false) {
    return next();
  } else if (_.isEmpty(req.youTubePlaylistStore)) {
    return next(Boom.notFound('Failed to fetch the Playlist data.'));
  }
  // debug('req.youTubePlaylistStore ', req.youTubePlaylistStore);
  try {
    const cleanFolderName = YtplUtils.prepareFolderName(req.youTubePlaylistStore.title);
    const query = `name = "${cleanFolderName}"`;
    const folderResponse: any = await GoogleDrive.searchFolderByName(req.userStore, query);
    if (folderResponse && folderResponse.data) {
      // debug('folderResponse.data ', folderResponse);
      // debug('folderResponse.data ', folderResponse.data);
      const folder = _.find(folderResponse.data.files, (value) => {
        if (value.trashed === false) {
          return value;
        }
      });
      // debug('folder ', folder);
      req.googleDriveFileStore = folder;
      if (_.isEmpty(folder) === false) {
        debug('Google Drive Folder with same name found.');
        return next();
      }
    }
    const responseNewGoogleFolder: any = await GoogleDrive.createFolder(
      req.userStore.googleDriveParentId,
      cleanFolderName,
      req.userStore
    );
    if (responseNewGoogleFolder && responseNewGoogleFolder.data) {
      req.googleDriveFileStore = responseNewGoogleFolder.data;
    }
    // debug('Folder has been created ', req.googleDriveFileStore);
    return next();
  } catch (error) {
    debug('createPlaylistFolder error ', error);
    return next(error);
  }
};

/**
 * This function will Remove Folder from to the drive
 */
export const removeFolder: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.userStore.access_token)) {
    return next();
  } else if (_.isEmpty(req.playlistStore)) {
    debug('CRITICAL : Empty req.playlistStore');
    return next();
  }
  try {
    const folderId = req.playlistStore.driveFolderId;
    const response: any = await GoogleDrive.removeFile(req.userStore, folderId);
    if (response && response.data) {
      // debug('response.data ', response.data);
      req.googleDriveStore = response.data;
    }
    return next();
  } catch (error) {
    debug('removeFolder error ', error);
    return next(error);
  }
};