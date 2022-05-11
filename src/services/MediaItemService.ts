import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as YtplUtils from '../utils/YtplUtils';
import * as GoogleDrive from '../utils/GoogleDriveUtils';
import { getRepository, FindManyOptions, LessThan, Not, In } from 'typeorm';
import { MediaItemEntity } from '../entities/MediaItemEntity';
import * as bluebird from 'bluebird';
import { YOUTUBE } from '../constants';
import * as Boom from 'boom';
import moment = require('moment');
import { IYtplItem } from '../interface/IYtplItem';
import { IGoogleDriveFileStore } from '../interface/IGoogleDriveFileStore';
import { FindOneOptions } from 'mongodb';

const debug = Debug('PL:MediaItemService');

/**
 * List all the Media Items using different Filters
 */
export const searchAllByLoggedInUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const params = _.merge(req.body, req.params);
  if (_.isEmpty(req.userStore)) {
    debug('CRITICAL: req.userStore is empty.');
    return next();
  }
  // debug('userProfile %o ', userProfile);
  const whereCondition: Partial<MediaItemEntity> = {};
  whereCondition.userId = req.userStore.id;
  if (params.isUploaded !== undefined) {
    whereCondition.isUploaded = params.isUploaded;
  }
  if (params.isDownloaded !== undefined) {
    whereCondition.isDownloaded = params.isDownloaded;
  }
  if (params.playlistUrlId !== undefined) {
    whereCondition.playlistUrlId = params.playlistUrlId;
  }
  if (params.driveFolderId !== undefined) {
    whereCondition.driveFolderId = params.driveFolderId;
  }
  if (params.urlId !== undefined) {
    whereCondition.urlId = params.urlId;
  }
  if (params.fileId !== undefined) {
    whereCondition.fileId = params.fileId;
  }
  // debug('whereCondition %o ', whereCondition);
  try {
    const options: FindManyOptions<MediaItemEntity> = {
      where: whereCondition,
      order: {
        title: 'ASC',
        playlistUrlId: 'ASC'
      }
    };
    const mediaItemModel = getRepository(MediaItemEntity);
    req.mediaItemsStore = await mediaItemModel.find(options);
    return next();
  } catch (error) {
    debug('searchAllByLoggedInUser error ', error);
    return next(error);
  }
};

/**
 * List all the Media Items using playlistUrlId and Google Drive Folder Id
 */
export const searchAllByLoggedInUserPlaylistAndDriveFolderId: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.playlistStore)) {
    return next();
  }
  try {
    const whereCondition: Partial<MediaItemEntity> = {
      userId: req.playlistStore.userId,
      playlistId: req.playlistStore.id,
      driveFolderId: req.playlistStore.driveFolderId
    };
    const options: FindManyOptions<MediaItemEntity> = {
      where: whereCondition,
      order: {
        urlId: 'ASC'
      }
    };
    // debug('whereCondition ', whereCondition);
    const mediaItemModel = getRepository(MediaItemEntity);
    req.mediaItemsStore = await mediaItemModel.find(options);
    // debug('req.mediaItemsStore : database ', req.mediaItemsStore);
    debug(`Total records In database - ${req.playlistStore.title} - ${req.mediaItemsStore.length}`);
    return next();
  } catch (error) {
    debug('searchAllByLoggedInUserPlaylistAndDriveFolderId error ', error);
    return next(error);
  }
};

export const identifySyncItemsForYouTube: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.youTubePlaylistStore)) {
    // debug('Return from empty req.youTubePlaylistStore');
    return next();
  } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
    // debug('Return from Empty req.youTubePlaylistStore.items');
    return next();
  }
  const googleItems: any = [];
  _.each(req.googleDriveFileItemsStore, (value: Partial<IGoogleDriveFileStore>) => {
    const youTubeIds = value.name.split(YOUTUBE.ID_SEPARATOR);
    const youTubeId: string = _.last(youTubeIds);
    value.urlId = youTubeId.split('.')[0];
    googleItems.push(value);
  });
  // debug('googleItems ', JSON.stringify(googleItems, null, 2));
  // debug('req.mediaItemsStore ', req.mediaItemsStore);
  const mediaItemsNewList: Partial<MediaItemEntity>[] = [];
  const mediaItemsUpdate: any = [];
  const mediaItemsRemove: any = [];
  const googleDriveItemsRemove: any = [];
  // debug('req.mediaItemsStore ', req.mediaItemsStore);
  // debug('req.mediaItemsStore ', _.map(req.mediaItemsStore, 'urlId'));
  // debug('req.youTubePlaylistStore.items ', req.youTubePlaylistStore.items);
  // debug('req.youTubePlaylistStore.items ', _.map(req.youTubePlaylistStore.items, 'id'));
  /**
   * Identify the files those :
   * Not available in database :
   * A - Available in google drive
   * B - Not Available in google drive
   */
  // _.each(req.mediaItemsStore, (value: MediaItemEntity) => {
  //   if (_.isEmpty(value.urlId)) {
  //     debug('CRITICAL : value.id is empty.');
  //     return;
  //   }
  //   debug('media.urlId ', value.urlId);
  // });
  // debug('req.youTubePlaylistStore.items ', req.youTubePlaylistStore.items.length);
  // debug('req.mediaItemsStore ', req.mediaItemsStore.length);
  _.each(req.youTubePlaylistStore.items, (value: IYtplItem) => {
    if (_.isEmpty(value.id)) {
      debug('CRITICAL : value.id is empty.');
      return;
    }
    const mediaTitle = YtplUtils.prepareFileName(value);
    const data: Partial<MediaItemEntity> = {
      userId: req.userStore.id,
      title: mediaTitle,
      url: value.url,
      urlId: value.id,
      type: req.playlistStore.type,
      playlistUrlId: req.youTubePlaylistStore.id,
      playlistId: req.playlistStore.id,
      driveFolderId: req.playlistStore.driveFolderId
    };

    const mediaItem: MediaItemEntity = _.find(req.mediaItemsStore, {
      urlId: value.id
    });
    // debug('youtube.id %o media.urlId %o database id %o ', value.id, mediaItem.urlId, mediaItem.id);
    // if (_.isEmpty(mediaItem) === true) {
    //   debug('This song is not found in the Database ', mediaItem);
    // }
    // if (_.isUndefined(mediaItem) === true) {
    //   debug('This song is not found in the Database ', mediaItem);
    // }
    // if (_.isNull(mediaItem) === true) {
    //   debug('This song is not found in the Database ', mediaItem);
    // }
    // debug('value.id ', value.id);
    // debug('value.url ', value.url);

    const itemGoogleDrive = _.find(googleItems, { urlId: value.id });
    const mediaNewItem = _.find(mediaItemsNewList, {
      urlId: value.id
    });

    if (_.isEmpty(mediaItem) === true &&
      _.isEmpty(itemGoogleDrive) === true &&
      _.isEmpty(mediaNewItem) === true
    ) {
      // Media is not in database and also Media is not in Google Drive
      // debug('Inside new Media');
      data.isUploaded = false;
      data.isDownloaded = false;
      mediaItemsNewList.push(data);
    } else if (_.isEmpty(mediaItem) === true &&
      _.isEmpty(itemGoogleDrive) === false &&
      _.isEmpty(mediaNewItem) === true) {
      // Media is not in database and Media is AVAILABLE in Google Drive
      data.isUploaded = true;
      data.isDownloaded = true;
      data.fileId = itemGoogleDrive.id;
      mediaItemsNewList.push(data);
    } else {
      // debug('It does not match any condition ', JSON.stringify(mediaItem));
    }
  });

  // TODO : Handle if the req.mediaItemsStore has the duplicate items.
  _.each(req.mediaItemsStore, (mediaItem: MediaItemEntity) => {
    // debug('value.urlId ', value.urlId);
    const youTubeItem = _.find(req.youTubePlaylistStore.items, {
      id: mediaItem.urlId
    });
    // debug('item %o ', item.length);
    /**
     * Identify the files those are in the database but not available in the YouTube
     */
    if (_.isEmpty(youTubeItem) === true) {
      // debug('Identify for the Remove. %o ', mediaItem);
      mediaItemsRemove.push(mediaItem);
    }

    const itemGoogleDrive = _.find(googleItems, {
      urlId: mediaItem.urlId
    });
    // if (_.isEmpty(itemGoogleDrive) === true) {
    //   debug('This song is not found in the Google Drive ', mediaItem);
    // }
    // Media is not in Google Drive BUT Media isUploaded = true
    if (_.isEmpty(itemGoogleDrive) === true) {
      mediaItem.isUploaded = false;
      mediaItem.isDownloaded = false;
      mediaItemsUpdate.push(mediaItem);
    }
    // Media available in Google Drive BUT Media isUploaded = false
    if (_.isEmpty(itemGoogleDrive) === false
      && mediaItem.isUploaded === false) {
      mediaItem.isUploaded = true;
      mediaItem.isDownloaded = true;
      mediaItem.fileId = itemGoogleDrive.id;
      mediaItemsUpdate.push(mediaItem);
    }
  });

  _.each(googleItems, (value) => {
    const item = _.find(req.youTubePlaylistStore.items, {
      id: value.urlId
    });
    const removePendingItem = _.find(mediaItemsRemove, {
      urlId: value.urlId
    });
    if (_.isEmpty(item) === true && _.isEmpty(removePendingItem) === true) {
      googleDriveItemsRemove.push(value);
    }
  });
  req.data = {
    playlistStore: req.playlistStore,
    userStore: req.userStore,
    mediaItemsNewCount: mediaItemsNewList.length,
    mediaItemsRemoveCount: mediaItemsRemove.length,
    mediaItemsNew: mediaItemsNewList,
    mediaItemsRemove: mediaItemsRemove,
    googleDriveItemsRemove: googleDriveItemsRemove,
    googleDriveItemsRemoveCount: googleDriveItemsRemove.length,
    mediaItemsUpdateCount: mediaItemsUpdate.length,
    mediaItemsUpdate: mediaItemsUpdate
  };
  debug(`${req.playlistStore.title} - mediaItemsNewCount ${mediaItemsNewList.length}`);
  debug(`${req.playlistStore.title} - mediaItemsRemoveCount ${mediaItemsRemove.length}`);
  debug(`${req.playlistStore.title} - mediaItemsUpdateCount ${mediaItemsUpdate.length}`);
  debug(`${req.playlistStore.title} - googleDriveItemsRemoveCount ${googleDriveItemsRemove.length}`);
  return next();
};

/**
 * Add new If Not Exits
 */
export const syncWithYouTube: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next();
  } else if (_.isEmpty(req.userStore.refresh_token)) {
    return next();
  } else if (_.isEmpty(req.playlistStore)) {
    return next();
  } else if (_.isEmpty(req.data)) {
    return next();
  } else if (
    _.isEmpty(req.data.mediaItemsNew) &&
    _.isEmpty(req.data.mediaItemsRemove) &&
    _.isEmpty(req.data.googleDriveItemsRemove) &&
    _.isEmpty(req.data.mediaItemsUpdate)
  ) {
    return next();
  }
  // debug('req.data.mediaItemsNew ', req.data.mediaItemsNew.length);
  const CONCURRENCY = 1;
  if (_.isEmpty(req.data.mediaItemsNew) === false) {
    try {
      const mediaItemModel = getRepository(MediaItemEntity);
      await mediaItemModel.insert(req.data.mediaItemsNew);
    } catch (error) {
      debug('error insertMany ', error);
      debug('error insertMany ', req.data.mediaItemsNew);
    }
  }

  // debug('req.data.mediaItemsUpdate ', req.data.mediaItemsUpdate.length);
  await bluebird.map(req.data.mediaItemsUpdate, async (value: MediaItemEntity) => {
    try {
      const mediaItemModel = getRepository(MediaItemEntity);
      const updateData: Partial<MediaItemEntity> = {
        title: value.title,
        isUploaded: value.isUploaded,
        isDownloaded: value.isDownloaded
      };
      if (value.fileId) {
        updateData.fileId = value.fileId;
      }
      const whereCondition: Partial<MediaItemEntity> = {
        id: value.id
      };
      await mediaItemModel.update(whereCondition, updateData);
      // debug('mediaItemsUpdate response ', response);
    } catch (error) {
      debug('mediaItemsUpdate error ', error);
      debug('mediaItemsUpdate error item ', value);
    }
  }, { concurrency: CONCURRENCY });

  await bluebird.map(req.data.mediaItemsRemove, async (value: MediaItemEntity) => {
    try {
      if (_.isEmpty(value.fileId)) {
        // debug('CRITICAL: mediaItemsRemove : File Id is empty. ', value);
        return;
      }
      await GoogleDrive.removeFile(req.userStore, value.fileId);
      // debug('googleDriveRemove response ', response);
    } catch (error) {
      if (error && error.errors) {
        debug('mediaItemsRemove from google drive error ', error.errors);
      } else {
        debug('mediaItemsRemove from google drive error ', error);
      }
      debug('mediaItemsRemove from google drive value ', value);
    }
  }, { concurrency: CONCURRENCY });

  if (_.isEmpty(req.data.mediaItemsRemove) === false) {
    try {
      const mediaItemModel = getRepository(MediaItemEntity);
      // debug('mediaRemoveItem ', value);
      await mediaItemModel.remove(req.data.mediaItemsRemove);
      // debug('mediaItemsRemove response ', response);
    } catch (error) {
      debug('mediaItemModel.remove error ', error);
      debug('mediaItemModel.remove error in  ', req.data.mediaItemsRemove);
    }
  }

  await bluebird.map(req.data.googleDriveItemsRemove, async (value: any) => {
    try {
      if (_.isEmpty(value.id)) {
        debug('CRITICAL: googleDriveItemsRemove File Id is empty.', value);
        return;
      }
      await GoogleDrive.removeFile(req.userStore, value.id);
    } catch (error) {
      if (error && error.errors) {
        debug('googleDriveItemsRemove error ', error.errors);
      } else {
        debug('googleDriveItemsRemove error ', error);
      }
      debug('googleDriveItemsRemove from google drive value ', value);
    }
  }, { concurrency: CONCURRENCY });
  return next();
};

/**
 * Search Media which has been not uploaded and also not downloaded yet
 */
export const searchAllNotDownloaded: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
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
      take: 1
    };
    const mediaItemModel = getRepository(MediaItemEntity);
    req.mediaItemsStore = await mediaItemModel.find(options);
    debug('req.mediaItemsStore : Total records pending for the download ', req.mediaItemsStore.length);
    return next();
  } catch (error) {
    debug('searchAllNotDownloaded error ', error);
    return next(error);
  }
};

/**
 * Update lastDownloadTimeStamp, downloadAttemptCount, isDownloaded....
 */
export const updateDownloadMedia: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  // debug('Inside updateDownloadAttempt');
  if (_.isEmpty(req.mediaItemsStore)) {
    return next();
  }
  const CONCURRENCY = 1;
  await bluebird.map(req.mediaItemsStore, async (value: MediaItemEntity) => {
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
      return next();
    } catch (error) {
      debug('updateDownloadMedia error ', error);
      debug('updateDownloadMedia error in  ', value);
    }
  }, { concurrency: CONCURRENCY });
};

/**
 * Search Downloaded but yet to Upload
 */
export const searchOneByIsDownloaded: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const whereCondition = {
    googleDriveUploadAttemptCount: LessThan(2),
    isDownloaded: true,
    isUploaded: false,
  };
  const orderBy: any = {
    order: {
      lastDownloadTimeStamp: 'ASC',
      lastUploadTimeStamp: 'DESC',
      googleDriveUploadAttemptCount: 'DESC'
    }
  };
  // debug('whereCondition ', whereCondition);
  try {
    const mediaItemModel = getRepository(MediaItemEntity);
    req.mediaStore = await mediaItemModel.findOne(whereCondition, orderBy);
    // debug('req.mediaStore Pending to Upload Media ', req.mediaStore);
    if (_.isEmpty(req.mediaStore) === false) {
      debug('Found One Pending to Upload Media');
    }
    return next();
  } catch (error) {
    debug('searchOneByIsDownloaded error ', error);
    return next(error);
  }
};

/**
 * Update Upload Media
 */
export const updateUploadMedia: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  // debug('Inside updateDownloadAttempt');
  if (_.isEmpty(req.mediaStore)) {
    return next();
  }
  try {
    const mediaItemModel = getRepository(MediaItemEntity);
    const whereCondition: Partial<MediaItemEntity> = {
      id: req.mediaStore.id
    };
    const count = (req.mediaStore.googleDriveUploadAttemptCount || 0) + 1;
    const updateData: Partial<MediaItemEntity> = {
      lastUploadTimeStamp: moment().toDate(),
      googleDriveUploadAttemptCount: count
    };
    if (req.googleDriveFileStore && req.googleDriveFileStore.id) {
      updateData.fileId = req.googleDriveFileStore.id;
      updateData.isUploaded = true;
    }
    if (_.isEmpty(req.mediaStore.localFilePath)) {
      updateData.localFilePath = '';
      updateData.googleDriveUploadAttemptCount = 0;
      updateData.downloadAttemptCount = 0;
      updateData.isUploaded = false;
      updateData.isDownloaded = false;
    }
    // debug('updateData ', updateData);
    await mediaItemModel.update(whereCondition, updateData);
    return next();
  } catch (error) {
    debug('updateUploadMedia error ', error);
    debug('updateUploadMedia error in  ', req.mediaStore);
    return next();
  }
};

/**
 * Remove All Media Items which Matches the Playlist
 */
export const removeMediaItems: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next(Boom.notFound('Invalid User'));
  } else if (_.isEmpty(req.playlistStore)) {
    debug('This playlist does not exits.');
    return next();
    // return next(Boom.notFound('This playlist does not exits.'));
  }
  const mediaItemModel = getRepository(MediaItemEntity);
  try {
    const whereCondition: Partial<MediaItemEntity> = {
      playlistId: req.playlistStore.id
    };
    await mediaItemModel.delete(whereCondition);
    // debug('response ', response);
    return next();
  } catch (error) {
    debug('removeMediaItems error ', error);
    return next(Boom.notFound(error));
  }
};
