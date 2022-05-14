import * as express from 'express';
import * as GoogleDriveService from '../services/GoogleDriveService';
import * as GoogleController from '../controllers/GoogleController';
import * as UserService from '../services/UserService';
import * as MediaItemService from '../services/MediaItemService';

const googleDriveRoute: express.Router = express.Router();

/**
 * Upload Media File to Google Drive
 * This API is call from the Cron Job
 */
googleDriveRoute.post('/crone/upload/:type', [
  MediaItemService.searchOneByIsDownloaded,
  UserService.searchOneByMediaItemUser,
  GoogleDriveService.uploadToDriveUsingPath,
  MediaItemService.updateUploadMedia,
  GoogleController.googleDriveUploadDetail
]);

export { googleDriveRoute };
