import * as express from 'express';
import * as passport from 'passport';
import * as YouTubeMediaService from '../services/YouTubeMediaService';
import * as YouTubeService from '../services/YouTubeService';
import * as UserService from '../services/UserService';
import * as YouTubeController from '../controllers/YouTubeController';
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
    PlaylistService.searchOneByLastUploadTimeStamp,
    PlaylistService.updateLastUploadTimeStamp,
    UserService.searchOneByPlaylistUser,
    MediaItemService.searchByLoggedInUserPlaylistAndDriveFolderIdAndNotUpload,
    YouTubeMediaService.downloadAudioHQUsingMediaItem,
    YouTubeMediaService.downloadVideoHQUsingMediaItem,
    MediaItemService.updateDownloadTimeStamp,
    YouTubeController.youtubeData
]);

export { youtubeRoute };