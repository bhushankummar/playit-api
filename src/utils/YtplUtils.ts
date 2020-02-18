import { YOUTUBE } from '../constants';
import * as ytpl from 'ytpl';
import { IYouTubePlaylist } from '../interface/IYouTubePlaylist';

const youtubedl = require('@microlink/youtube-dl');

/**
 * Get the File Metadata
 */
export const findPlaylistItems = (playlistId: string): Promise<IYouTubePlaylist> => {
    return new Promise((resolve: any, reject: any) => {
        const options: any = { limit: 10000 };
        ytpl(playlistId, options, (error: any, documents: IYouTubePlaylist) => {
            if (error) {
                reject(error);
            }
            resolve(documents);
        });
    });
};

/**
 * Get the File Metadata
 */
export const findMetadata = (url: string) => {
    return new Promise((resolve: any, reject: any) => {
        const options: any = [];
        youtubedl.getInfo(url, options, (error: any, info: any) => {
            if (error) {
                reject(error);
            }
            resolve(info);
        });
    });
};

export const prepareFileName = (item: any, extension: string) => {
    let fileName = this.cleanFileName(item.title);
    fileName = fileName.concat(YOUTUBE.ID_SEPARATOR, item.id, '.', extension);
    return fileName;
};

export const cleanFileName = (fileName: string) => {
    const cleanWords = [
        '/r',
        '/',
        '\\',
        '"',
        '_',
        '-',
        'lyrical:',
        'Lyrical :',
        'Lyrical:',
        'Full Song:',
        'Full Audio:',
        'Full Video:'
    ];
    fileName = fileName.split(/'/g).join(' ');
    cleanWords.forEach((word: string) => {
        fileName = fileName.split(word).join(' ');
        fileName = fileName.split(word.toLowerCase()).join(' ');
        fileName = fileName.split(word.toUpperCase()).join(' ');
        fileName = fileName.trim();
    });
    fileName = fileName.replace(/  +/g, ' ');
    fileName = fileName.replace(/  +/g, ' ');
    fileName = fileName.replace(/  +/g, ' ');
    fileName = fileName.replace(/  +/g, ' ');
    fileName = fileName.replace(/  +/g, ' ');
    fileName = fileName.trim();
    return fileName;
};
