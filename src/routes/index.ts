import * as express from 'express';
import {userRoute} from './UserRoute';
import {tokenRoute} from './TokenRoute';
import {youtubeRoute} from './YouTubeRoute';
import {googleDriveRoute} from './GoogleDriveRoute';
import {playlistRoute} from './PlaylistRoute';
import {mediaItemRoute} from './MediaItemRoute';

const router: express.Router = express.Router();

/**
 * This route for token
 */
router.use('/token', tokenRoute);

/**
 * This route for Media Item
 */
router.use('/media-item', mediaItemRoute);

/**
 * This route for Playlist
 */
router.use('/playlist', playlistRoute);

/**
 * This route for user
 */
router.use('/user', userRoute);

/**
 * This route for YouTube
 */
router.use('/youtube', youtubeRoute);

/**
 * This route for Google Drive
 */
router.use('/google-drive', googleDriveRoute);

export {router};