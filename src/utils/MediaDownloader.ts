import * as YouTube from './YouTube';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as Debug from 'debug';
import { APP } from '../constants';

const youtubedl = require('@microlink/youtube-dl');
const debug = Debug('PL:MediaDownloader');

export const downloadMedia = (options: any[], type: string, playlist: any, item: any, driveDirectory: any) => {
    return new Promise((resolve: any, reject: any) => {
        const audio = youtubedl(item.url_simple, options);
        const success = {
            message: true,
            filePath: '',
            fileName: ''
        };
        audio.on('info', () => {
            const newFileName = YouTube.prepareFileName(item, type);
            const filePath = path.join(driveDirectory, newFileName);
            success.filePath = filePath;
            success.fileName = newFileName;
            debug('Download started %o ', success.fileName);
            audio.pipe(fs.createWriteStream(filePath));
        });

        // Will be called if download was already completed and there is nothing more to download.
        audio.on('complete', (info: any) => {
            debug(success.fileName, ' already downloaded.');
            resolve(success);
        });

        audio.on('end', () => {
            debug('** Finished downloading %o ', success.fileName);
            resolve(success);
        });

        audio.on('error', (error: any) => {
            debug('error occurs in ', item);
            debug('error occurs in ', success);
            debug('error ', error);
            reject(error);
        });
    });
};

export const downloadAudio = (playlist: any, item: any, driveDirectory: any) => {
    const options = [ '-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'mp3' ];
    return downloadMedia(options, 'mp3', playlist, item, driveDirectory);
};

export const downloadVideoExec = (playlist: any, item: any, driveDirectory: any) => {
    return new Promise(async (resolve: any, reject: any) => {
        const success = {
            message: true,
            filePath: '',
            fileName: ''
        };
        const options = [ '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio', '--ffmpeg-location', APP.FFPROBE_PATH ];

        const metaData: any = await YouTube.findMetadata(item.url_simple);
        const oldFileName = metaData._filename;
        const newFileName = YouTube.prepareFileName(item, 'mp4');
        success.fileName = newFileName;

        // debug('Download started %o ', success.fileName);
        youtubedl.exec(item.url_simple, options, {}, async (error: any, output: any) => {
            if (error) {
                debug('error occurs in item ', item);
                debug('error occurs in ', success);
                debug('error ', error);
                return reject(error);
            }
            debug('** Finished downloading %o ', success.fileName);
            success.filePath = path.join(driveDirectory, newFileName);
            fse.moveSync(oldFileName, success.filePath);
            resolve(success);
        });
    });
};
