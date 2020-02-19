import * as _ from 'lodash';
import { IYtplPlaylist } from '../interface/IYtplPlaylist';
import { IYtplItem } from '../interface/IYtplItem';

export const mapYouTubeResponse = (youtubeItemStore: any): Partial<IYtplPlaylist> => {
    const ytplPlaylistStore: Partial<IYtplPlaylist> = {};
    ytplPlaylistStore.total_items = youtubeItemStore.pageInfo.totalResults;
    ytplPlaylistStore.id = youtubeItemStore.playlistId;
    ytplPlaylistStore.title = youtubeItemStore.channelTitle;
    ytplPlaylistStore.items = [];

    const items: Partial<IYtplItem>[] = [];
    _.each(youtubeItemStore.items, (value) => {
        const ytplItem: Partial<IYtplItem> = {};
        if (value.snippet) {
            ytplItem.title = value.snippet.title;
            ytplItem.id = `v=${value.snippet.resourceId.videoId}`;
            const url = `https://www.youtube.com/watch?${ytplItem.id}`;
            ytplItem.url = url;
            ytplItem.url_simple = url;
        }
        items.push(ytplItem);
    });
    ytplPlaylistStore.items = items;
    return ytplPlaylistStore;
};