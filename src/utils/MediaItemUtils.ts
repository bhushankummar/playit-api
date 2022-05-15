import Bluebird = require('bluebird');
import * as Debug from 'debug';
import _ = require('lodash');
import moment = require('moment');
import { FindManyOptions, getRepository, LessThan } from 'typeorm';
import { APP } from '../constants';
import { MediaItemEntity } from '../entities/MediaItemEntity';
const debug = Debug('PL:MediaItemUtils');

export const searchAllNotDownloaded = async (req) => {
  try {
    const whereCondition = {
      downloadAttemptCount: LessThan(5),
      isUploaded: false,
      isDownloaded: false
    };
    const options: FindManyOptions = {
      where: whereCondition,
      order: {
        downloadAttemptCount: 'ASC'
      },
      take: APP.DOWNLOAD_TAKE
    };
    const mediaItemModel = getRepository(MediaItemEntity);
    req.mediaItemsStore = await mediaItemModel.find(options);
    debug('req.mediaItemsStore : Total records pending for the download ', req.mediaItemsStore.length);
    return req;
  } catch (error) {
    debug('searchAllNotDownloaded error ', error);
    throw error;
  }
};


/**
 * Update lastDownloadTimeStamp, downloadAttemptCount, isDownloaded....
 */
export const updateDownloadMedia = async (req) => {
  // debug('Inside updateDownloadAttempt');
  if (_.isEmpty(req.mediaItemsStore)) {
    return req;
  }
  const CONCURRENCY = 1;
  await Bluebird.map(req.mediaItemsStore, async (value: MediaItemEntity) => {
    try {
      const mediaItemModel = getRepository(MediaItemEntity);
      const whereCondition: Partial<MediaItemEntity> = {
        id: value.id
      };
      // debug('whereCondition %o ', whereCondition);
      // debug('value %o ', value);
      // debug('value.errors %o ', value.errors);
      let downloadAttemptCount = value.downloadAttemptCount;
      if (downloadAttemptCount === undefined) {
        downloadAttemptCount = 0;
      }
      downloadAttemptCount += 1;
      const updateData: Partial<MediaItemEntity> = {
        lastDownloadTimeStamp: moment().toDate(),
        downloadAttemptCount: downloadAttemptCount,
        isDownloaded: value.isDownloaded,
        localFilePath: value.localFilePath,
        errors: value.errors
      };
      // debug('updateData ', updateData);
      await mediaItemModel.update(whereCondition, updateData);
      // debug('updateDownloadMedia update ', response);
    } catch (error) {
      debug('updateDownloadMedia error ', error);
      debug('updateDownloadMedia error in  ', value);
    }
  }, { concurrency: CONCURRENCY });
  return req;
};
