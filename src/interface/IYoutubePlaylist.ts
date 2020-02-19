
interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
}

interface Default {
    url: string;
    width: number;
    height: number;
}

interface Medium {
    url: string;
    width: number;
    height: number;
}

interface High {
    url: string;
    width: number;
    height: number;
}

interface Standard {
    url: string;
    width: number;
    height: number;
}

interface Maxres {
    url: string;
    width: number;
    height: number;
}

interface Thumbnails {
    default: Default;
    medium: Medium;
    high: High;
    standard: Standard;
    maxres: Maxres;
}

interface ResourceId {
    kind: string;
    videoId: string;
}

interface Snippet {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails;
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: ResourceId;
}

export interface IYoutubePlaylistItem {
    kind: string;
    etag: string;
    id: string;
    snippet: Snippet;
}

export interface IYoutubePlaylist {
    kind: string;
    etag: string;
    nextPageToken: string;
    pageInfo: PageInfo;
    items: IYoutubePlaylistItem[];
}
