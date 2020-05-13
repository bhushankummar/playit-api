import * as express from 'express';
import * as YouTubeMediaService from '../services/YouTubeMediaService';
import * as YouTubeService from '../services/YouTubeService';
import * as GoogleDriveService from '../services/GoogleDriveService';
import * as UserService from '../services/UserService';
import * as YouTubeController from '../controllers/YouTubeController';
import * as GoogleService from '../services/GoogleService';
import * as MediaItemService from '../services/MediaItemService';
import * as PlaylistService from '../services/PlaylistService';

const youtubeRoute: express.Router = express.Router();

/**
 * Download Audio File
 * Download Video File
 * This API Called from Crone Job
 * type : 0 = Audio ; 1 = Video
 */
youtubeRoute.post('/crone/download', [
    PlaylistService.searchOneByLastSync,
    PlaylistService.updateLastSync,
    UserService.searchOneByPlaylistUser,
    MediaItemService.searchByLoggedInUserPlaylistAndDriveFolderIdAndNotUpload,
    MediaItemService.updateDownloadTimeStamp,
    YouTubeMediaService.downloadAudioHQUsingMediaItem,
    YouTubeController.youtubeData
]);

/**
 * Download Audio File
 * Download Video File
 * This API Called from Crone Job
 * type : 0 = Audio ; 1 = Video
 */
youtubeRoute.post('/crone/download/v1', [
    PlaylistService.searchOneByLastSync,
    PlaylistService.updateLastSync,
    UserService.searchOneByPlaylistUser,
    YouTubeService.listPlaylistItems,
    YouTubeService.removeDuplicateItemsFromLocal,
    MediaItemService.removeDuplicateItemsFromDatabaseAndCreate,
    GoogleService.setCredentials,
    GoogleDriveService.removeDuplicatesFromGoogleDrive,
    YouTubeMediaService.downloadAudioHQUsingYouTube,
    YouTubeMediaService.downloadVideoHQ,
    YouTubeController.youtubeData
]);

/**
 * List Playlist Items
 * List all the Media Items of Playlist from the YouTube
 */
youtubeRoute.get('/playlist/:playlistId', [
    YouTubeService.listPlaylistItems,
    YouTubeController.youtubeData
]);

export { youtubeRoute };
