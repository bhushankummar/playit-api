import * as express from 'express';
import * as passport from 'passport';
import * as PlaylistService from '../services/PlaylistService';
import * as UserService from '../services/UserService';
import * as GoogleDriveService from '../services/GoogleDriveService';
import * as YouTubeService from '../services/YouTubeService';
import * as MediaItemService from '../services/MediaItemService';
import * as PlaylistController from '../controllers/PlaylistController';

const playlistRoute: express.Router = express.Router();

/**
 * Add Audio Playlist or Add Video Playlist
 * This API can be call to add the YouTube playlist.
 */
playlistRoute.post('/', passport.authenticate('bearer'), [
    PlaylistService.validateNewPlaylist,
    PlaylistService.searchOneByPlaylistUrlIdAndUserId,
    GoogleDriveService.createRootFolder,
    // UserService.updateRootDirectory,
    YouTubeService.getPlaylistDetail,
    GoogleDriveService.createPlaylistFolder,
    PlaylistService.addPlaylist,
    PlaylistController.playlist
]);

/**
 * Search All Playlist
 * This API will return all the Playlist of the User
 */
playlistRoute.post('/search', passport.authenticate('bearer'), [
    PlaylistService.searchAllPlaylist,
    PlaylistController.playlistData
]);

/**
 * Remove Audio Playlist or Remove Video Playlist
 */
playlistRoute.delete('/:playlistId', passport.authenticate('bearer'), [
    PlaylistService.searchOneByPlaylistIdAndUserId,
    GoogleDriveService.removeFolder,
    PlaylistService.removePlaylist,
    // MediaItemService.searchAllByLoggedInUserPlaylistAndDriveFolderId,
    MediaItemService.removeMediaItems,
    PlaylistController.playlist
]);

playlistRoute.post('/crone/verify/drive-folder', [
    PlaylistService.searchOneByLastSyncTimeStamp,
    UserService.searchOneByPlaylistUser,
    GoogleDriveService.createRootFolder,
    YouTubeService.getPlaylistDetailUsingPlaylistUrl,
    GoogleDriveService.createPlaylistFolder,
    PlaylistService.updatePlaylistDriveFolder,
    PlaylistController.playlist
]);

export { playlistRoute };
