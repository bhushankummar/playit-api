import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
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
    debug('CRITICAL : Return from empty req.playlistStore');
    return next();
  } else if (_.isEmpty(req.playlistStore.id)) {
    debug('CRITICAL : Return from empty req.playlistStore.id');
    return next();
  } else if (_.isEmpty(req.userStore)) {
    debug('CRITICAL : Return from empty req.userStore');
    return next();
  } else if (_.isEmpty(req.userStore.refresh_token)) {
    return next(Boom.notFound('No Refresh Token has been set.'));
  } else if (_.isEmpty(req.youTubePlaylistStore) === false) {
    return next();
  } else if (_.isEmpty(req.playlistStore.urlId) === true) {
    debug('CRITICAL : Return from empty req.playlistStore.urlId  ', req.playlistStore);
    return next(Boom.notFound('Empty req.playlistStore.urlId'));
  }
  try {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(req.userStore);
    const youtubeClient = google.youtube({ version: 'v3', auth: oauth2Client });
    const playListItemsData = {
      part: ['snippet'],
      playlistId: req.playlistStore.urlId,
      maxResults: 50,
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
        // debug('snippet.resourceId.videoId ', _.map(response.data.items, 'snippet.resourceId.videoId'));
        youtubePlaylistStoreData = response.data;
        // debug('youtubePlaylistStore ', JSON.stringify(response.data, undefined, 2));
        youtubePlaylistStoreItems = youtubePlaylistStoreItems.concat(response.data.items);
        // youtubePlaylistStoreItems = _.merge(youtubePlaylistStoreItems, response.data.items);
        if (response.data.nextPageToken) {
          nextPageToken = _.clone(response.data.nextPageToken);
          // debug('nextPageToken ', nextPageToken);
        }
      } catch (error) {
        nextPageToken = '';
        if (error && error.errors
          && error.errors[0]
          && error.errors[0].reason
          && error.errors[0].reason === 'quotaExceeded') {
          return next(error);
        } else {
          debug('listPlaylistItems error req.playlistStore ', req.playlistStore);
          debug('listPlaylistItems error playListItemsData ', playListItemsData);
          debug('listPlaylistItems error ', error);
        }
      }
    } while (nextPageToken !== '');
    // debug('youtubePlaylistStoreData ', youtubePlaylistStoreData);
    youtubePlaylistStoreData.items = youtubePlaylistStoreItems || [];
    // debug('ytplPlaylistStore ', youtubePlaylistStoreData.items);
    // debug('youtubePlaylistStoreData.items.length ---- ', youtubePlaylistStoreData.items.length);
    // debug('ytplPlaylistStore ', _.map(youtubePlaylistStoreData.items, 'snippet.resourceId.videoId'));
    const ytplPlaylistStore = YouTubeUtils.mapYouTubeResponse(youtubePlaylistStoreData);
    // debug('ytplPlaylistStore ', _.map(ytplPlaylistStore.items, 'id'));
    ytplPlaylistStore.id = req.playlistStore.urlId;
    debug(`Total songs in YouTube - ${req.playlistStore.title} - ${ytplPlaylistStore.items.length}`);
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
    debug('CRITICAL : Return from empty params.playlistUrl');
    return next();
  } else if (_.isEmpty(req.youTubePlaylistStore) === false) {
    return next();
  }
  try {
    // debug('params.playlistUrl ', params.playlistUrl);
    const youTubePlaylistStore = await YouTubeUtils.searchPlaylist(
      params.playlistUrl, req.userStore);
    // debug('youTubePlaylistStore ', youTubePlaylistStore);
    req.youTubePlaylistStore = youTubePlaylistStore;
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
    const youTubePlaylistStore = await YouTubeUtils.searchPlaylist(req.playlistStore.urlId, req.userStore);
    // debug('youTubePlaylistStore ', youTubePlaylistStore);
    req.youTubePlaylistStore = youTubePlaylistStore;
    return next();
  } catch (error) {
    if (error && error.errors
      && error.errors[0]
      && error.errors[0].reason
      && error.errors[0].reason === 'quotaExceeded') {
      return next(error);
    } else {
      debug('getPlaylistDetailUsingPlaylistUrl error ', error);
    }
    return next(error);
  }
};
