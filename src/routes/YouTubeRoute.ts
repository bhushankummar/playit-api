import * as express from 'express';
import * as YouTubeController from '../controllers/YouTubeController';
const youtubeRoute: express.Router = express.Router();

/**
 * Download Audio File
 * Download Video File
 * This API Called from Crone Job
 * type : 0 = Audio ; 1 = Video
 */
youtubeRoute.post('/crone/download', [
  YouTubeController.youtubeData
]);

export { youtubeRoute };