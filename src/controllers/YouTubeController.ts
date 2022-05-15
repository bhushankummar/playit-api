import * as express from 'express';
import * as Debug from 'debug';
import { IRequest } from '../interface/IRequest';
import * as MediaItemUtils from '../utils/MediaItemUtils';
import * as YouTubeMediaUtils from '../utils/YouTubeMediaUtils';
const debug = Debug('PL:YouTubeController');

/**
 * YouTube Details
 */
export const youtubeData: express.RequestHandler = async (
  request: IRequest,
  res: express.Response,
  next: express.NextFunction) => {
  try {
    let req: any = {};
    req = await MediaItemUtils.searchAllNotDownloaded(req);
    req = await YouTubeMediaUtils.downloadMediaHQUsingMediaItem(req);
    req = await MediaItemUtils.updateDownloadMedia(req);
    request.data = {
      mediaItemsStore: req.mediaItemsStore
    };
    return next();
  } catch (error) {
    debug('error ', error);
    return next(error);
  }
};