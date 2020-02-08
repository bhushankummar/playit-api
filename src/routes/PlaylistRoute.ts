import * as express from 'express';
import * as UserService from '../services/UserService';
import * as PlaylistService from '../services/PlaylistService';
import * as PlaylistController from '../controllers/PlaylistController';

const playlistRoute: express.Router = express.Router();

/**
 * Add Playlist
 */
playlistRoute.post('/', [
    PlaylistService.validateNewPlaylist,
    UserService.searchOneByEmail,
    PlaylistService.searchOneByPlaylistIdAndUserId,
    PlaylistService.addPlaylist,
    PlaylistController.playlist
]);

/**
 * Remove Playlist
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
 */
playlistRoute.post('/search', [
    UserService.searchOneByEmail,
    PlaylistService.searchAllPlaylist,
    PlaylistController.playlistData
]);

export {playlistRoute};
