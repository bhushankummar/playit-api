import * as express from 'express';
import * as UserService from '../services/UserService';
import * as GoogleDriveService from '../services/GoogleDriveService';
import * as MediaItemController from '../controllers/MediaItemController';
import * as GoogleService from '../services/GoogleService';
import * as MediaItemService from '../services/MediaItemService';
import * as YouTubeService from '../services/YouTubeService';

const mediaItemRoute: express.Router = express.Router();

/**
 * Search All Media List
 */
mediaItemRoute.post('/', [
    UserService.searchOneByEmail,
    MediaItemService.searchByLoggedInUser,
    MediaItemController.mediaItemData
]);

/**
 * Sync MediaItem with YouTube Playlist & Google Drive
 * This API called from the Cron Job
 * playlistId = Id of the YouTube Playlist
 * driveFolderId = Id of the Google Drive Folder
 */
mediaItemRoute.post('/sync/crone/youtube/:playlistId/:driveFolderId', [
    UserService.searchOneByEmail,
    GoogleService.setCredentials,
    GoogleDriveService.cleanTrash,
    MediaItemService.searchByLoggedInUserPlaylistAndDriveFolderId,
    YouTubeService.listPlaylistItems,
    GoogleDriveService.searchAllFiles,
    MediaItemService.identifySyncItemsForYouTube,
    MediaItemService.syncWithYouTube,
    GoogleDriveService.cleanTrash
]);

export {mediaItemRoute};
