import * as YtplUtils from './YtplUtils';
import * as path from 'path';
import * as fs from 'fs';
import * as Debug from 'debug';
import { MediaItemEntity } from '../entities/MediaItemEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const youtubedl = require('youtube-dl');
// const youtubedl = require('youtube-dl-exec');
const debug = Debug('PL:MediaDownload');

export const downloadMedia = (options: any[], extension: string, item: MediaItemEntity, driveDirectory: any) => {
  return new Promise((resolve: any, reject: any) => {
    const mediaUrl = item.url;
    const media = youtubedl(mediaUrl, options);
    const mediaResponse = {
      message: true,
      filePath: '',
      fileName: ''
    };
    media.on('info', () => {
      const newFileName = YtplUtils.prepareFileName(item, extension, true);
      const filePath = path.join(driveDirectory, newFileName);
      mediaResponse.filePath = filePath;
      mediaResponse.fileName = newFileName;
      debug('Download started %o ', mediaResponse.fileName);
      media.pipe(fs.createWriteStream(filePath));
    });

    // Will be called if download was already completed and there is nothing more to download.
    media.on('complete', () => {
      debug(mediaResponse.fileName, ' already downloaded.');
      resolve(mediaResponse);
    });

    media.on('end', () => {
      debug('** Finished downloading %o ', mediaResponse.fileName);
      resolve(mediaResponse);
    });

    media.on('error', (error: any) => {
      debug('error occurs in downloadMedia item %o ', item);
      debug('error occurs in downloadMedia mediaResponse %o ', mediaResponse);
      debug('error in downloadMedia %o ', error);
      reject(error);
    });
  });
};
