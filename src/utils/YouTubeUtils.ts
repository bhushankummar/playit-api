import * as _ from 'lodash';
import { IYtplPlaylist } from '../interface/IYtplPlaylist';
import { IYtplItem } from '../interface/IYtplItem';
import { IYoutubePlaylist } from '../interface/IYoutubePlaylist';
import * as GoogleUtils from './GoogleUtils';
import * as Debug from 'debug';
import { google } from 'googleapis';
import { reject } from 'bluebird';

const debug = Debug('PL:YouTubeUtils');

export const mapYouTubeResponse = (youtubeItemStore: Partial<IYoutubePlaylist>): Partial<IYtplPlaylist> => {
  const ytplPlaylistStore: Partial<IYtplPlaylist> = {};
  ytplPlaylistStore.total_items = 0;
  if (youtubeItemStore && youtubeItemStore.pageInfo && youtubeItemStore.pageInfo.totalResults) {
    ytplPlaylistStore.total_items = youtubeItemStore.pageInfo.totalResults;
  }
  ytplPlaylistStore.items = [];

  const items: Partial<IYtplItem>[] = [];
  _.each(youtubeItemStore.items, (value) => {
    const ytplItem: Partial<IYtplItem> = {};
    if (value.snippet) {
      ytplItem.title = value.snippet.title;
      ytplItem.id = `${value.snippet.resourceId.videoId}`;
      const url = `https://www.youtube.com/watch?v=${value.snippet.resourceId.videoId}`;
      ytplItem.url = url;
      ytplItem.url_simple = url;
    }
    items.push(ytplItem);
  });
  ytplPlaylistStore.items = items;
  return ytplPlaylistStore;
};

export const mapYouTubePlaylistResponse = (youtubeItemStore: any): Partial<IYtplPlaylist> => {
  const ytplPlaylistStore: Partial<IYtplPlaylist> = {};
  ytplPlaylistStore.id = youtubeItemStore.id;
  if (youtubeItemStore.snippet) {
    ytplPlaylistStore.title = youtubeItemStore.snippet.title;
    const url = `https://www.youtube.com/playlist?list=${youtubeItemStore.id}`;
    ytplPlaylistStore.url = url;
  }
  return ytplPlaylistStore;
};

export const searchPlaylist = async (playlistUrl: string, googleCredentials: any) => {
  try {
    const oauth2Client = GoogleUtils.getOAuth2ClientInstance();
    oauth2Client.setCredentials(googleCredentials);
    const youtubeClient = google.youtube({ version: 'v3', auth: oauth2Client });
    const playListItemsData = {
      part: ['snippet'],
      id: [playlistUrl]
    };
    // debug('playListItemsData ', playListItemsData);
    const response: any = await youtubeClient.playlists.list(playListItemsData);
    if (response && response.data && response.data.items && response.data.items[0]) {
      // debug('response ', response.data);
      // debug('response ', response.data.items[0]);
      const playlist = response.data.items[0];
      // debug('playlist ', playlist);
      const youTubePlaylistStore = mapYouTubePlaylistResponse(playlist);
      // debug('youTubePlaylistStore ', youTubePlaylistStore);
      return youTubePlaylistStore;
    }
    return {};
  } catch (error) {
    debug('searchPlaylist error ', error);
    return reject(error);
  }
};