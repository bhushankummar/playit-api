import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as GoogleUtils from '../utils/GoogleUtils';
import * as YouTubeUtils from '../utils/YouTubeUtils';
import { google } from 'googleapis';
import { IYoutubePlaylist, IYoutubePlaylistItem } from '../interface/IYoutubePlaylist';

const debug = Debug('PL:YouTubeService');

/**
 * List all the Playlist Songs
 */
export const listPlaylistItems: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.playlistStore)) {
    // debug('CRITICAL : Return from empty req.playlistStore');
    return next();
  } else if (_.isEmpty(req.playlistStore._id)) {
    debug('CRITICAL : Return from empty req.playlistStore._id');
    return next();
  } else if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.youTubePlaylistStore) === false) {
    return next();
  } else if (_.isEmpty(req.playlistStore.urlId) === true) {
    debug('CRITICAL : Return from empty req.playlistStore.urlId  ', req.playlistStore);
    return next();
  }
  try {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(req.userStore.google);
    const youtubeClient = google.youtube({ version: 'v3', auth: oauth2Client });
    const playListItemsData = {
      part: 'snippet',
      playlistId: req.playlistStore.urlId,
      pageToken: ''
    };
    let nextPageToken = '';
    let youtubePlaylistStoreData: Partial<IYoutubePlaylist> = {};
    let youtubePlaylistStoreItems: IYoutubePlaylistItem[] = [];
    do {
      playListItemsData.pageToken = _.clone(nextPageToken);
      nextPageToken = '';
      try {
        const response: any = await youtubeClient.playlistItems.list(playListItemsData);
        youtubePlaylistStoreData = response.data;
        // debug('youtubePlaylistStore ', JSON.stringify(response.data, undefined, 2));
        youtubePlaylistStoreItems = youtubePlaylistStoreItems.concat(response.data.items);
        if (response.data.nextPageToken) {
          nextPageToken = _.clone(response.data.nextPageToken);
        }
      } catch (error) {
        debug('listPlaylistItems error %o req.playlistStore %o playListItemsData %o', error, req.playlistStore, playListItemsData);
        // return next(Boom.notFound(error));
      }
    } while (nextPageToken !== '');
    youtubePlaylistStoreData.items = youtubePlaylistStoreItems || [];
    const ytplPlaylistStore = YouTubeUtils.mapYouTubeResponse(youtubePlaylistStoreData);
    ytplPlaylistStore.id = req.playlistStore.urlId;
    debug('Total songs in YouTube ', ytplPlaylistStore.items.length);
    req.youTubePlaylistStore = ytplPlaylistStore;
    return next();
  } catch (error) {
    debug('listPlaylistItems error ', error, req.playlistStore);
    return next(error);
  }
};

/**
 * List all the Playlist Songs
 */
export const getPlaylistDetail: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.body, req.params);
  if (_.isEmpty(params.playlistUrl)) {
    // debug('CRITICAL : Return from empty req.playlistStore');
    return next();
  } else if (_.isEmpty(req.youTubePlaylistStore) === false) {
    return next();
  }
  try {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(req.userStore.google);
    const youtubeClient = google.youtube({ version: 'v3', auth: oauth2Client });
    const playListItemsData = {
      part: 'snippet',
      id: params.playlistUrl
    };
    // debug('playListItemsData ', playListItemsData);
    const response: any = await youtubeClient.playlists.list(playListItemsData);
    if (response && response.data && response.data.items && response.data.items[0]) {
      // debug('response ', response.data);
      // debug('response ', response.data.items[0]);
      const playlist = response.data.items[0];
      // debug('playlist ', playlist);
      const youTubePlaylistStore = YouTubeUtils.mapYouTubePlaylistResponse(playlist);
      debug('youTubePlaylistStore ', youTubePlaylistStore);
      req.youTubePlaylistStore = youTubePlaylistStore;
    }
    return next();
  } catch (error) {
    debug('getPlaylistDetail error ', error);
    return next(error);
  }
};

/**
 * List all the Playlist Songs
 */
export const getPlaylistDetailUsingPlaylistUrl: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.playlistStore)) {
    // debug('CRITICAL : Return from empty req.playlistStore');
    return next();
  }
  try {
    const youTubePlaylistStore = await YouTubeUtils.searchPlaylist(req.playlistStore.urlId, req.userStore.google);
    // debug('youTubePlaylistStore ', youTubePlaylistStore);
    req.youTubePlaylistStore = youTubePlaylistStore;
    return next();
  } catch (error) {
    debug('getPlaylistDetailUsingPlaylistUrl error ', error);
    return next(error);
  }
};
