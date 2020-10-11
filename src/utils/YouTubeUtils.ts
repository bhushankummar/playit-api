import * as _ from 'lodash';
import { IYtplPlaylist } from '../interface/IYtplPlaylist';
import { IYtplItem } from '../interface/IYtplItem';
import { IYoutubePlaylist } from '../interface/IYoutubePlaylist';

export const mapYouTubeResponse = (youtubeItemStore: Partial<IYoutubePlaylist>): Partial<IYtplPlaylist> => {
    const ytplPlaylistStore: Partial<IYtplPlaylist> = {};
    ytplPlaylistStore.total_items = youtubeItemStore.pageInfo.totalResults;
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