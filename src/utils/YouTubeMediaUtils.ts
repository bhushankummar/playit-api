import Bluebird = require('bluebird');
import * as Debug from 'debug';
import * as fs from 'fs';
import _ = require('lodash');
import moment = require('moment');
import path = require('path');
import { getRepository } from 'typeorm';
import { APP, AUDIO_DOWNLOAD_OPTIONS, MEDIA_DIRECTORY, MEDIA_TYPE, VIDEO_DOWNLOAD_OPTIONS } from '../constants';
import { MediaErrorEntity, MediaItemEntity } from '../entities/MediaItemEntity';
import * as MediaDownloadUtils from '../utils/MediaDownloadUtils';
const debug = Debug('PL:YouTubeMediaUtils');

export const downloadMediaHQUsingMediaItem = async (req) => {
  if (_.isEmpty(req.mediaItemsStore)) {
    return req;
  }
  const tempMediaItems: Partial<MediaItemEntity>[] = [];
  await Bluebird.map(req.mediaItemsStore, async (updatedItem: Partial<MediaItemEntity>) => {
    // debug('item %o ', item);
    let rootDirector = MEDIA_DIRECTORY.VIDEO;
    let mediaType = 'mp4';
    let downloadOptionKey = 1;
    let downloadOption = VIDEO_DOWNLOAD_OPTIONS[downloadOptionKey];
    if (updatedItem.type === MEDIA_TYPE.AUDIO) {
      rootDirector = MEDIA_DIRECTORY.AUDIO;
      downloadOption = AUDIO_DOWNLOAD_OPTIONS[downloadOptionKey];
      mediaType = 'mp3';
    }
    const driveDirectory = path.join(rootDirector, updatedItem.driveFolderId);
    if (!fs.existsSync(driveDirectory)) {
      fs.mkdirSync(driveDirectory);
    }

    if (
      _.isEmpty(updatedItem.errors) === true || _.isNull(updatedItem.errors) === true
    ) {
      // debug('Inside if %o ', updatedItem.errors);
      updatedItem.errors = [];
    }
    try {
      if (_.isEmpty(updatedItem.playlistUrlId)) {
        debug('CRITICAL : Skipping Audio Media Item which has not playlistUrlId. ', updatedItem);
        tempMediaItems.push(updatedItem);
        return;
      } else if (updatedItem.title.indexOf('Deleted') > -1) {
        debug('CRITICAL : Skipping Media having Deleted Title. ', updatedItem);
        tempMediaItems.push(updatedItem);
        return;
      }
      if (_.isEmpty(updatedItem.errors) === false) {
        const lastError: any = _.last(updatedItem.errors);
        downloadOptionKey = lastError.downloadOptions + 1;

        if (updatedItem.type === MEDIA_TYPE.AUDIO) {
          if (_.isEmpty(AUDIO_DOWNLOAD_OPTIONS[downloadOptionKey]) === false) {
            downloadOption = AUDIO_DOWNLOAD_OPTIONS[downloadOptionKey];
          } else {
            downloadOptionKey = 1;
          }
        } else if (updatedItem.type === MEDIA_TYPE.VIDEO) {
          if (_.isEmpty(VIDEO_DOWNLOAD_OPTIONS[downloadOptionKey]) === false) {
            downloadOption = VIDEO_DOWNLOAD_OPTIONS[downloadOptionKey];
          } else {
            downloadOptionKey = 1;
          }
        }
      }
      const response: any = await MediaDownloadUtils.downloadMedia(
        downloadOption, mediaType,
        updatedItem, driveDirectory);
      updatedItem.localFilePath = response.filePath;
      updatedItem.isDownloaded = true;
      // debug('Media download complete ', response);
    } catch (error: any) {
      updatedItem.isDownloaded = false;
      debug('downloadMediaHQUsingMediaItem error ', error);
      debug('downloadMediaHQUsingMediaItem error error.stderr ', error.stderr);
      const mediaErrorItem: MediaErrorEntity = {
        message: error.stderr,
        downloadOptions: downloadOptionKey
      };
      // debug('item ', item);
      updatedItem.errors.push(mediaErrorItem);
      debug('downloadMediaHQUsingMediaItem error ', updatedItem);
      // debug('item %o ', item);
    }
    tempMediaItems.push(updatedItem);
  }, { concurrency: APP.DOWNLOAD_AUDIO_CONCURRENCY });
  req.mediaItemsStore = tempMediaItems;
  req.youTubeStore = { message: true };
  return req;
};
