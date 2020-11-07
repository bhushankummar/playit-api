import { YOUTUBE } from '../constants';
import * as ytpl from 'ytpl';
import * as _ from 'lodash';
import { IYtplPlaylist } from '../interface/IYtplPlaylist';

const youtubedl = require('youtube-dl');

/**
 * Get the File Metadata
 */
export const findPlaylistItems = (playlistId: string): Promise<IYtplPlaylist> => {
    return new Promise((resolve: any, reject: any) => {
        const options: any = { limit: 10000 };
        ytpl(playlistId, options, (error: any, documents: IYtplPlaylist) => {
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
export const findMetadata = (url: string, options: any) => {
    return new Promise((resolve: any, reject: any) => {
        youtubedl.getInfo(url, options, (error: any, info: any) => {
            if (error) {
                reject(error);
            }
            resolve(info);
        });
    });
};

export const prepareFileName = (item: any, extension: string) => {
    let fileName = cleanFileName(item.title);
    let youtubeId = item.urlId;
    if (_.isEmpty(youtubeId)) {
        youtubeId = item.id;
    }
    fileName = fileName.concat(YOUTUBE.ID_SEPARATOR, youtubeId, '.', extension);
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
        'Lyrical Video:',
        'Official:',
        'Full Video:'
    ];
    fileName = fileName.split(/'/g).join(' ');
    fileName = fileName.toString().replace(/"/g, '\\"');
    fileName = fileName.replace(/\/\//g, '');
    cleanWords.forEach((word: string) => {
        fileName = fileName.split(word).join(' ');
        fileName = fileName.split(word.toLowerCase()).join(' '); // Lowercase
        fileName = fileName.split(word.toUpperCase()).join(' '); // Uppercase
        fileName = fileName.trim();
    });
    fileName = fileName.replace(/ +(?= )/g, '');
    return fileName;
};
