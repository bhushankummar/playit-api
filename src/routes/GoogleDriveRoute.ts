import * as express from 'express';
import * as GoogleDriveService from '../services/GoogleDriveService';
import * as GoogleController from '../controllers/GoogleController';
import * as UserService from '../services/UserService';
import * as GoogleService from '../services/GoogleService';

const googleDriveRoute: express.Router = express.Router();

/**
 * Upload Media File to Google Drive
 * This API is call from the Cron Job
 */
googleDriveRoute.post('/crone/upload/:type', [
    UserService.searchOneByEmail,
    GoogleService.setCredentials,
    GoogleDriveService.prepareAudioFilesForTheUpload,
    GoogleDriveService.uploadToDrive,
    GoogleController.googleDriveDetail
]);

/**
 * Clear Trash Google Drive
 * This API is call from the Cron Job
 */
googleDriveRoute.post('/crone/empty/trash', [
    UserService.searchOneByEmail,
    GoogleService.setCredentials,
    GoogleDriveService.cleanTrash,
    GoogleController.googleDriveDetail
]);

export {googleDriveRoute};
