import { IYtplItem } from './IYtplItem';

export interface IYtplPlaylist {
    id?: string;
    url: string;
    title: string;
    visibility: string;
    description: string;
    total_items: number;
    views: string;
    last_updated: string;
    author: {
        id: string;
        name: string;
        avatar: string;
        user: string;
        channel_url: string;
        user_url: string;
    };
    items: Partial<IYtplItem>[];
}