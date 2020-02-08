import * as express from 'express';
import {IRequest} from '../interface/IRequest';
import * as Debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as bluebird from 'bluebird';
import * as MediaDownloader from '../utils/MediaDownloader';

import {APP, MEDIA_DIRECTORY} from '../constants';

const youtubedl = require('@microlink/youtube-dl');
const debug = Debug('PL:YouTubeService');

/**
 * Download HQ Audio using URL
 */
export const downloadAudioHQ: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    if (params.type !== 'audio') {
        // debug('Return from media type. Current Value ', params.type);
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
        return next();
    }

    const driveDirectory = path.join(MEDIA_DIRECTORY.AUDIO, params.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    await bluebird.map(req.youTubePlaylistStore.items, async (item: any) => {
        try {
            const response = await MediaDownloader.downloadAudio(req.youTubePlaylistStore, item, driveDirectory);
            debug('AUDIO download complete ', response);
        } catch (error) {
            debug('downloadAudioHQ error ', error);
            debug('downloadAudioHQ error item', item);
        }
    }, {concurrency: APP.DOWNLOAD_AUDIO_CONCURRENCY});
    req.youTubeStore = {message: true};
    return next();
};

/**
 * Download HQ Video using URL
 */
export const downloadVideoHQ: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    if (params.type !== 'video') {
        // debug('Return from media type. Current Value ', params.type);
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
        return next();
    }

    const driveDirectory = path.join(MEDIA_DIRECTORY.VIDEO, params.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    await bluebird.map(req.youTubePlaylistStore.items, async (item: any) => {
        try {
            const response = await MediaDownloader.downloadVideoExec(req.youTubePlaylistStore, item, driveDirectory);
            debug('response  ', response);
        } catch (error) {
            debug('downloadVideoHQ error ', error);
            debug('downloadVideoHQ error item', item);
        }
    }, {concurrency: APP.DOWNLOAD_VIDEO_CONCURRENCY});
    req.youTubeStore = {message: true};
    return next();
};

/**
 * Download HQ Video using URL
 */
export const downloadSingleVideoHQ: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    // const url = 'https://www.youtube.com/watch?v=F4zfneNCrqo';
    const url = 'https://www.youtube.com/watch?v=pRpeEdMmmQ0';
    const options = ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio', '--ffmpeg-location', APP.FFPROBE_PATH];
    youtubedl.exec(url, options, {}, (error: any, output: any) => {
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
export const downloadSingleAudioHQ: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    const item = {
        'id': 'g7PP_gkcdgE',
        'url': 'https://www.youtube.com/watch?v=g7PP_gkcdgE&index=15&list=PLV4x9RCRiG1Bsrpcm4Y5ezVzMIkuSRi0e&t=0s',
        'url_simple': 'https://www.youtube.com/watch?v=g7PP_gkcdgE',
        'title': 'Bom Diggy Diggy (Video Song/Lyric Video) | Zack Knight | Jasmin Walia | Sonu Ke Titu Ki Sweety',
        'thumbnail': 'https://i.ytimg.com/vi/g7PP_gkcdgE/hqdefault.jpg',
        'duration': '3:19',
        'author': {
            'name': 'TuneJar Music',
            'ref': 'https://www.youtube.com/channel/UCTIJ16pIuGCsElfr_Qy3mwg'
        }
    };
    const driveDirectory = path.join(MEDIA_DIRECTORY.AUDIO, params.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
        fs.mkdirSync(driveDirectory);
    }
    try {
        const media: any = await MediaDownloader.downloadAudio({}, item, driveDirectory);
        req.youTubeStore = media;
        return next();
    } catch (error) {
        return next(error);
    }
};