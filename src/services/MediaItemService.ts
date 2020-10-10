import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
import * as GoogleDrive from '../utils/GoogleDrive';
import { getMongoRepository, FindManyOptions } from 'typeorm';
import { MediaItemEntity } from '../entities/MediaItemEntity';
import * as bluebird from 'bluebird';
import { YOUTUBE } from '../constants';
import moment = require('moment');
import { ObjectId } from 'mongodb';

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
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    // debug('userProfile %o ', userProfile);
    const whereCondition: any = {
        user: userProfile
    };
    if (params.isUploaded !== undefined) {
        whereCondition.isUploaded = params.isUploaded;
    }
    if (params.isDownloaded !== undefined) {
        whereCondition.isDownloaded = params.isDownloaded;
    }
    if (params.playlistId !== undefined) {
        whereCondition.playlistId = params.playlistId;
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
        const mediaItemModel = getMongoRepository(MediaItemEntity);
        req.mediaItemsStore = await mediaItemModel.find(whereCondition);
    } catch (error) {
        debug('error ', error);
        return next(error);
    }
    return next();
};

/**
 * List all the Media Items using PlaylistId and Google Drive Folder Id
 */
export const searchAllByLoggedInUserPlaylistAndDriveFolderId: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.userStore)) {
        return next();
    } else if (_.isEmpty(req.playlistStore)) {
        return next();
    }
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    // debug('userProfile ', userProfile);
    try {
        const whereCondition: any = {
            user: userProfile,
            playlistId: req.playlistStore.urlId,
            driveFolderId: req.playlistStore.driveFolderId
        };
        const mediaItemModel = getMongoRepository(MediaItemEntity);
        req.mediaItemsStore = await mediaItemModel.find(whereCondition);
        // debug('req.mediaItemsStore : database ', req.mediaItemsStore);
        debug('req.mediaItemsStore : Total records In database ', req.mediaItemsStore.length);
    } catch (error) {
        debug('searchAllByLoggedInUserPlaylistAndDriveFolderId error ', error);
        return next(error);
    }
    return next();
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
    _.each(req.googleDriveStore, (value) => {
        let youTubeId = value.name.split(YOUTUBE.ID_SEPARATOR);
        youTubeId = _.last(youTubeId);
        value.urlId = youTubeId.split('.')[0];
        googleItems.push(value);
    });
    // debug('googleItems ', googleItems);
    // debug('req.mediaItemsStore ', req.mediaItemsStore);
    const mediaItemsNew: any = [];
    const mediaItemsUpdate: any = [];
    const mediaItemsRemove: any = [];
    const googleDriveItemsRemove: any = [];

    /**
     * Identify the files those :
     * Not available in database :
     * A - Available in google drive
     * B - Not Available in google drive
     */
    _.each(req.youTubePlaylistStore.items, (value) => {
        const item = _.find(req.mediaItemsStore, { urlId: value.id });

        const itemGoogleDrive = _.find(googleItems, { urlId: value.id });
        if (_.isEmpty(item) === true && _.isEmpty(itemGoogleDrive) === true) {
            value.isUploaded = false;
            value.isDownloaded = false;
            mediaItemsNew.push(value);
        }
        if (_.isEmpty(item) === true && _.isEmpty(itemGoogleDrive) === false) {
            value.isUploaded = true;
            value.isDownloaded = true;
            value.fileId = itemGoogleDrive.id;
            mediaItemsNew.push(value);
        }
    });

    // TODO : Handle if the req.mediaItemsStore has the duplicate items.
    _.each(req.mediaItemsStore, (value) => {
        // debug('value.urlId ', value.urlId);
        const item = _.find(req.youTubePlaylistStore.items, { id: value.urlId });
        // debug('item %o ', item.length);
        /**
         * Identify the files those are in the database but not available in the YouTube
         */
        if (_.isEmpty(item) === true) {
            debug('Identify for the Remove. %o ', item);
            mediaItemsRemove.push(value);
        }

        const itemGoogleDrive = _.find(googleItems, { urlId: value.urlId });
        if (_.isEmpty(itemGoogleDrive) === true && value.isUploaded === true) {
            value.isUploaded = false;
            value.isDownloaded = false;
            mediaItemsUpdate.push(value);
        }
        if (_.isEmpty(itemGoogleDrive) === false && value.isUploaded === false) {
            value.isUploaded = true;
            value.isDownloaded = true;
            value.fileId = itemGoogleDrive.id;
            mediaItemsUpdate.push(value);
        }
    });
    _.each(googleItems, (value) => {
        const item = _.find(req.youTubePlaylistStore.items, { id: value.urlId });
        const removePendingItem = _.find(mediaItemsRemove, { urlId: value.urlId });
        if (_.isEmpty(item) === true && _.isEmpty(removePendingItem) === true) {
            googleDriveItemsRemove.push(value);
        }
    });
    req.data = {
        playlistStore: req.playlistStore,
        userStore: req.userStore,
        mediaItemsNewCount: mediaItemsNew.length,
        mediaItemsRemoveCount: mediaItemsRemove.length,
        googleDriveItemsRemoveCount: googleDriveItemsRemove.length,
        mediaItemsNew: mediaItemsNew,
        mediaItemsRemove: mediaItemsRemove,
        googleDriveItemsRemove: googleDriveItemsRemove,
        mediaItemsUpdateCount: mediaItemsUpdate.length,
        mediaItemsUpdate: mediaItemsUpdate
    };
    return next();
};

/**
 * Add new If Not Exits
 */
export const syncWithYouTube: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.userStore)) {
        return next();
    } else if (_.isEmpty(req.userStore.google)) {
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
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    // debug('req.data.mediaItemsNew ', req.data.mediaItemsNew.length);
    const CONCURRENCY = 1;
    const mediaItemsNew = [];
    await bluebird.map(req.data.mediaItemsNew, async (value: any) => {
        try {
            const data: Partial<MediaItemEntity> = {
                user: userProfile,
                title: value.title,
                url: value.url_simple,
                urlId: value.id,
                type: req.youTubePlaylistStore.type,
                playlistId: req.youTubePlaylistStore.id,
                driveFolderId: req.playlistStore.driveFolderId,
                isUploaded: value.isUploaded,
                isDownloaded: value.isDownloaded
            };
            if (_.isEmpty(value.fileId) === false) {
                data.fileId = value.fileId;
            }
            mediaItemsNew.push(data);
        } catch (error) {
            debug('error ', error);
        }
    }, { concurrency: CONCURRENCY });
    if (_.isEmpty(mediaItemsNew) === false) {
        try {
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            await mediaItemModel.insertMany(mediaItemsNew);
        } catch (error) {
            debug('error ', error);
        }
    }

    // debug('req.data.mediaItemsUpdate ', req.data.mediaItemsUpdate.length);
    await bluebird.map(req.data.mediaItemsUpdate, async (value: any) => {
        try {
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            const updateData: any = {
                isUploaded: value.isUploaded,
                isDownloaded: value.isDownloaded
            };
            if (value.fileId) {
                updateData.fileId = value.fileId;
            }
            const data = {
                $set: updateData
            };
            // const whereCondition = value;
            const whereCondition = {
                _id: value._id
            };
            // debug('data ', data);
            // debug('whereCondition ', whereCondition);
            const response = await mediaItemModel.updateOne(whereCondition, data);
            // debug('response ', response.result);
        } catch (error) {
            debug('mediaItemsUpdate error ', error);
            debug('mediaItemsUpdate error item ', value);
        }
    }, { concurrency: CONCURRENCY });

    await bluebird.map(req.data.mediaItemsRemove, async (value: MediaItemEntity) => {
        try {
            if (_.isEmpty(value.fileId)) {
                debug('mediaItemsRemove : File Id is empty. ', value);
                return;
            }
            await GoogleDrive.removeFile(req.userStore.google, value.fileId);
        } catch (error) {
            if (error && error.errors) {
                debug('mediaItemsRemove from google drive error ', error.errors);
            } else {
                debug('mediaItemsRemove from google drive error ', error);
            }
            debug('mediaItemsRemove from google drive value ', value);
        }
    }, { concurrency: CONCURRENCY });

    const mediaItemsRemove = [];
    await bluebird.map(req.data.mediaItemsRemove, async (value: MediaItemEntity) => {
        try {
            mediaItemsRemove.push(value);
        } catch (error) {
            debug('mediaItemsRemove error ', error);
            debug('mediaItemsRemove error in  ', value);
        }
    }, { concurrency: CONCURRENCY });

    if (_.isEmpty(mediaItemsRemove) === false) {
        try {
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            // debug('mediaRemoveItem ', value);
            await mediaItemModel.remove(mediaItemsRemove);
        } catch (error) {
            debug('mediaItemsRemove error ', error);
            debug('mediaItemsRemove error in  ', mediaItemsRemove);
        }
    }

    await bluebird.map(req.data.googleDriveItemsRemove, async (value: any) => {
        try {
            if (_.isEmpty(value.id)) {
                debug('googleDriveItemsRemove File Id is empty.', value);
                return;
            }
            await GoogleDrive.removeFile(req.userStore.google, value.id);
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
export const searchAllByLoggedInUserPlaylistAndDriveFolderIdAndNotUpload: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.userStore)) {
        return next();
    } else if (_.isEmpty(req.playlistStore)) {
        return next();
    }
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    // debug('userProfile ', userProfile);
    try {
        const whereCondition: FindManyOptions = {
            where: {
                user: userProfile,
                playlistId: req.playlistStore.urlId,
                driveFolderId: req.playlistStore.driveFolderId,
                isUploaded: false,
                isDownloaded: false
                // This is for development purpose only
                // _id: new ObjectId('5f807c255786e50026a0482e')
            },
            order: {
                lastDownloadTimeStamp: 'ASC'
            },
            take: 5
        };
        const mediaItemModel = getMongoRepository(MediaItemEntity);
        req.mediaItemsStore = await mediaItemModel.find(whereCondition);
        debug('req.mediaItemsStore : Total records pending for the download ', req.mediaItemsStore.length);
    } catch (error) {
        debug('searchAllByLoggedInUserPlaylistAndDriveFolderIdAndNotUpload error ', error);
        return next(error);
    }
    return next();
};

/**
 * Search Media which has been not uploaded and also not downloaded yet
 */
export const searchAllNotDownloaded: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    try {
        const whereCondition: FindManyOptions = {
            where: {
                isUploaded: false,
                isDownloaded: false
                // This is for development purpose only
                // _id: new ObjectId('5f807c255786e50026a0482e')
            },
            order: {
                lastDownloadTimeStamp: 'ASC'
            },
            take: 5
        };
        const mediaItemModel = getMongoRepository(MediaItemEntity);
        req.mediaItemsStore = await mediaItemModel.find(whereCondition);
        debug('req.mediaItemsStore : Total records pending for the download ', req.mediaItemsStore.length);
    } catch (error) {
        debug('searchAllNotDownloaded error ', error);
        return next(error);
    }
    return next();
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
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            const whereCondition: any = {
                '_id': new ObjectId(value._id)
                // '_id': value._id
            };
            // debug('whereCondition %o ', whereCondition);
            // debug('value %o ', value);
            // debug('value.errors %o ', value.errors);
            const count = (value.downloadAttemptCount || 0) + 1;
            const updateData: any = {
                lastDownloadTimeStamp: moment().toISOString(),
                downloadAttemptCount: count,
                isDownloaded: value.isDownloaded,
                localFilePath: value.localFilePath,
                // errors: value.errors
            };
            // debug('updateData ', updateData);
            const response = await mediaItemModel.update(whereCondition, updateData);

            const res = await mediaItemModel.update(whereCondition, updateData);
            // debug('updateDownloadMedia update ', res);
            // debug('updateDownloadMedia update ', response);
        } catch (error) {
            debug('updateDownloadMedia error ', error);
            debug('updateDownloadMedia error in  ', value);
        }
    }, { concurrency: CONCURRENCY });
    return next();
};

/**
 * Search Downloaded but yet to Upload
 */
export const searchOneByIsDownloaded: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const whereCondition: any = {
        isDownloaded: true,
        isUploaded: false,
        $or: [
            {
                lastUploadTimeStamp: {
                    '$lt': moment().subtract(1, 'minutes').toISOString()
                    // '$lt': moment().subtract(1, 'seconds').toISOString()
                }
            },
            {
                lastUploadTimeStamp: undefined
            }
        ]
    };
    // debug('whereCondition ', whereCondition);
    try {
        const mediaItemModel = getMongoRepository(MediaItemEntity);
        req.mediaItemStore = await mediaItemModel.findOne(whereCondition);
        // debug('req.mediaItemsStore ', req.mediaItemsStore);
    } catch (error) {
        debug('error ', error);
        return next(error);
    }
    return next();
};

/**
 * Update Upload Media
 */
export const updateUploadMedia: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    // debug('Inside updateDownloadAttempt');
    if (_.isEmpty(req.mediaItemStore)) {
        return next();
    }
    try {
        const mediaItemModel = getMongoRepository(MediaItemEntity);
        const whereCondition: any = {
            '_id': new ObjectId(req.mediaItemStore._id)
        };
        const updateData: any = {
            lastUploadTimeStamp: moment().toISOString(),
        };
        if (req.googleDriveFileStore && req.googleDriveFileStore.id) {
            updateData.fileId = req.googleDriveFileStore.id;
            updateData.isUploaded = true;
        }
        if (_.isEmpty(req.mediaItemStore.localFilePath)) {
            updateData.isUploaded = false;
            updateData.isDownloaded = false;
        }
        // debug('updateData ', updateData);
        const response = await mediaItemModel.update(whereCondition, updateData);
        // debug('updateDownloadMedia update ', response);
    } catch (error) {
        debug('updateUploadMedia error ', error);
        debug('updateUploadMedia error in  ', req.mediaItemStore);
    }
    return next();
};
