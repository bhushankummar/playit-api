export interface IYtplItem {
    id: string;
    url: string;
    url_simple: string;
    title: string;
    thumbnail: string;
    duration: string;
    author: {
        id: string;
        name: string;
        user: string;
        channel_url: string;
        user_url: string;
    };
}
