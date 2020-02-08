import { MEDIA_DIRECTORY, YOUTUBE } from '../constants';
import * as fs from 'fs';
import * as ytpl from 'ytpl';
import { IYouTubePlaylist } from '../interface/IYouTubePlaylist';

const youtubedl = require('@microlink/youtube-dl');
const id3Writer = require('browser-id3-writer');

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

/**
 * Do not use this for the production purpose
 */
export const findThumbnails = (url: string) => {
    return new Promise((resolve: any, reject: any) => {
        const options = {
            all: false,
            cwd: MEDIA_DIRECTORY.THUMBNAIL,
        };
        youtubedl.getThumbs(url, options, (error: any, info: any) => {
            if (error) {
                reject(error);
            }
            resolve(info);
        });
    });
};

/**
 * Do not use this for the production purpose
 */
export const attachThumbnailToMedia = (thubnailPath: string, mediaPath: string) => {
    return new Promise((resolve: any, reject: any) => {

        const songBuffer = fs.readFileSync(mediaPath);
        const coverBuffer = fs.readFileSync(thubnailPath);

        const writer = new id3Writer(songBuffer);
        writer.setFrame('TIT2', 'Home')
            .setFrame('TPE1', ['Eminem', '50 Cent'])
            .setFrame('TALB', 'Friday Night Lights')
            .setFrame('TYER', 2004)
            .setFrame('TRCK', '6/8')
            .setFrame('TCON', ['Soundtrack'])
            .setFrame('TBPM', 128)
            .setFrame('WPAY', 'https://google.com')
            .setFrame('TKEY', 'Fbm')
            .setFrame('APIC', {
                type: 3,
                data: coverBuffer,
                description: 'Super picture'
            });
        writer.addTag();
        const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
        fs.writeFileSync('./1.mp3', taggedSongBuffer);
        resolve({ message: true });
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
    // Clean Additional Charters
    // fileName = fileName.split('/r').join(' ');
    // fileName = fileName.split('/').join(' ');
    // fileName = fileName.split('\\').join(' ');
    // fileName = fileName.split('"').join(' ');
    // fileName = fileName.split('_').join(' ');
    // fileName = fileName.split('-').join(' | ');
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