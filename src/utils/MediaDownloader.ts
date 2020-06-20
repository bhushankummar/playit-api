import * as YouTube from './YtplUtils';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as Debug from 'debug';
import * as _ from 'lodash';
import { APP } from '../constants';
import { MediaItemEntity } from '../entities/MediaItemEntity';

const youtubedl = require('youtube-dl');
const debug = Debug('PL:MediaDownloader');

export const downloadMedia = (options: any[], type: string, item: MediaItemEntity, driveDirectory: any) => {
    return new Promise((resolve: any, reject: any) => {
        const mediaUrl = item.url;
        const media = youtubedl(mediaUrl, options);
        const mediaResponse = {
            message: true,
            filePath: '',
            fileName: ''
        };
        media.on('info', () => {
            const newFileName = YouTube.prepareFileName(item, type);
            const filePath = path.join(driveDirectory, newFileName);
            mediaResponse.filePath = filePath;
            mediaResponse.fileName = newFileName;
            debug('Download started %o ', mediaResponse.fileName);
            media.pipe(fs.createWriteStream(filePath));
        });

        // Will be called if download was already completed and there is nothing more to download.
        media.on('complete', (info: any) => {
            debug(mediaResponse.fileName, ' already downloaded.');
            resolve(mediaResponse);
        });

        media.on('end', () => {
            debug('** Finished downloading %o ', mediaResponse.fileName);
            resolve(mediaResponse);
        });

        media.on('error', (error: any) => {
            debug('error occurs in downloadMedia item %o ', item);
            debug('error occurs in downloadMedia mediaResponse %0 ', mediaResponse);
            debug('error in downloadMedia %o ', error);
            reject(error);
        });
    });
};

export const downloadAudio = (playlist: any, item: any, driveDirectory: any) => {
    const options = [ '-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'mp3' ];
    return downloadMedia(options, 'mp3', item, driveDirectory);
};

export const downloadVideo = (item: MediaItemEntity, localDirectory: any) => {
    const options = [
        `--format=136`
    ];
    return downloadMedia(options, 'mp4', item, localDirectory);
};

export const downloadVideoExec = (item: MediaItemEntity, driveDirectory: any) => {
    return new Promise(async (resolve: any, reject: any) => {
        const mediaResponse = {
            message: true,
            filePath: '',
            fileName: ''
        };
        const options = [
            '-f',
            'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio',
            '--ffmpeg-location',
            APP.FFPROBE_PATH
        ];
        const mediaUrl = item.url;
        // const metaData: any = await YouTube.findMetadata(mediaUrl, options);
        // const oldFileName = metaData._filename;
        const oldFileName = item.title.concat('.mp4');
        const newFileName = YouTube.prepareFileName(item, 'mp4');
        mediaResponse.fileName = newFileName;
        debug('oldFileName ', oldFileName);
        // debug('Download started %o ', mediaResponse.fileName);
        youtubedl.exec(mediaUrl, options, {}, async (error: any, output: any) => {
            if (error) {
                debug('error occurs in item ', item);
                debug('error occurs in ', mediaResponse);
                debug('error ', error);
                return reject(error);
            }
            debug('** Finished downloading video %o ', mediaResponse.fileName);
            mediaResponse.filePath = path.join(driveDirectory, newFileName);
            try {
                // debug('oldFileName ', oldFileName);
                // debug('mediaResponse.filePath ', mediaResponse.filePath);
                fse.moveSync(oldFileName, mediaResponse.filePath, { overwrite: true });
            } catch (error) {
                debug('error youtubedl.exec %o ', mediaResponse);
                debug('error youtubedl.exec oldFileName : %o ', oldFileName);
                debug('error youtubedl.exec output : %o ', output);
                reject(error);
            }
            resolve(mediaResponse);
        });
    });
};
