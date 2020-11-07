import * as express from 'express';
import * as passport from 'passport';
import * as PlaylistService from '../services/PlaylistService';
import * as UserService from '../services/UserService';
import * as GoogleDriveService from '../services/GoogleDriveService';
import * as YtplService from '../services/YtplService';
import * as YouTubeService from '../services/YouTubeService';
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
    UserService.updateRootDirectory,
    YtplService.fetchPlaylistDetailByUrlId,
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
    PlaylistService.removePlaylist,
    PlaylistController.playlist
]);

export { playlistRoute };
