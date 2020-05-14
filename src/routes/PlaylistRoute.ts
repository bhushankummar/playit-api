import * as express from 'express';
import * as passport from 'passport';
import * as UserService from '../services/UserService';
import * as PlaylistService from '../services/PlaylistService';
import * as PlaylistController from '../controllers/PlaylistController';

const playlistRoute: express.Router = express.Router();

/**
 * Add Audio Playlist or Add Video Playlist
 * This API can be call to add the YouTube playlist.
 * Once Playlist added it will download the Media Files into the Google Drive
 */
playlistRoute.post('/', [
    PlaylistService.validateNewPlaylist,
    UserService.searchOneByEmail,
    PlaylistService.searchOneByPlaylistIdAndUserId,
    PlaylistService.addPlaylist,
    PlaylistController.playlist
]);

/**
 * Remove Audio Playlist or Remove Video Playlist
 */
playlistRoute.delete('/', [
    PlaylistService.validateNewPlaylist,
    UserService.searchOneByEmail,
    PlaylistService.searchOneByPlaylistIdAndUserId,
    PlaylistService.removePlaylist,
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

export { playlistRoute };
