import * as express from 'express';
import * as UserService from '../services/UserService';
import * as GoogleDriveService from '../services/GoogleDriveService';
import * as MediaItemController from '../controllers/MediaItemController';
import * as MediaItemService from '../services/MediaItemService';
import * as PlaylistService from '../services/PlaylistService';
import * as YouTubeService from '../services/YouTubeService';

const mediaItemRoute: express.Router = express.Router();

/**
 * Search All Media List
 * This API will return all the Medias of User
 */
mediaItemRoute.post('/', [
    UserService.searchOneByEmail,
    MediaItemService.searchByLoggedInUser,
    MediaItemController.mediaItemData
]);

/**
 * Sync MediaItem with YouTube Playlist & Google Drive
 * Adds New File if new found
 * Updates the Update Status if file is already uploaded
 * Removes the document & google drive file if Media is not in the YouTube Playlist
 * This API called from the Cron Job
 */
mediaItemRoute.post('/sync/crone/youtube', [
    PlaylistService.searchOneByLastSync,
    PlaylistService.updateLastSync,
    UserService.searchOneByPlaylistUser,
    GoogleDriveService.cleanTrash,
    MediaItemService.searchByLoggedInUserPlaylistAndDriveFolderId,
    GoogleDriveService.searchAllFiles,
    YouTubeService.listPlaylistItems,
    MediaItemService.identifySyncItemsForYouTube,
    MediaItemService.syncWithYouTube,
    GoogleDriveService.cleanTrash
]);

export { mediaItemRoute };
