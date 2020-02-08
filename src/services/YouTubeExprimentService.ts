import * as express from 'express';
import {IRequest} from '../interface/IRequest';
import * as Debug from 'debug';
import * as fs from 'fs';

const youtubedl = require('@microlink/youtube-dl');
const debug = Debug('PL:YouTubeService');

/**
 * Download Video using URL
 */
export const downloadVideoStream: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const video = youtubedl('http://www.youtube.com/watch?v=qWnzMwT6SKo',
      // Optional arguments passed to youtube-dl.
      ['-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'mp3'],
      // Additional options can be given for calling `child_process.execFile()`.
      {cwd: __dirname});

// Will be called when the download starts.
    video.on('info', (info: any) => {
        debug('Download started');
        debug('filename: ' + info._filename);
        debug('size: ' + info.size);
        let newFileName = info._filename;
        newFileName = newFileName.split('.').slice(0, -1).join('.').concat('.mp3');
        debug('newFileName ', newFileName);
        video.pipe(fs.createWriteStream(newFileName));
    });

    // Will be called if download was already completed and there is nothing more to download.
    video.on('complete', (info: any) => {
        debug('filename: ' + info._filename + ' already downloaded.');
        req.youTubeStore = {message: true};
        return next();
    });

    video.on('end', () => {
        debug('finished downloading!');
        req.youTubeStore = {message: true};
        return next();
    });
};

/**
 * Download Audio in Basic output using URL
 */
export const downloadAudioStream: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const url = 'http://www.youtube.com/watch?v=qWnzMwT6SKo';
    youtubedl.exec(url, ['-x', '--audio-format', 'mp3'], {}, (error: any, output: any) => {
        if (error) {
            debug('error ', error);
            return next(error);
        }
        console.log(output.join('\n'));
    });
};

/**
 * Download HQ Video using URL
 */
export const downloadVideoHQ: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const url = 'http://www.youtube.com/watch?v=qWnzMwT6SKo';
    youtubedl.exec(url, ['-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'mp3'], {}, (error: any, output: any) => {
        if (error) {
            debug('error ', error);
            return next(error);
        }
        debug(output.join('\n'));
        req.youTubeStore = {message: true};
        return next();
    });
};

/**
 * Download HQ Video using URL
 */
export const downloadAudioHQ: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const url = 'http://www.youtube.com/watch?v=qWnzMwT6SKo';
    youtubedl.exec(url, ['-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'mp3'], {}, (error: any, output: any) => {
        if (error) {
            debug('error ', error);
            return next(error);
        }
        debug(output.join('\n'));
        req.youTubeStore = {message: true};
        return next();
    });
};