import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as GoogleDrive from '../utils/GoogleDrive';
import { getMongoRepository } from 'typeorm';
import { MediaItemEntity } from '../entities/MediaItemEntity';
import * as bluebird from 'bluebird';
import { YOUTUBE } from '../constants';

const debug = Debug('PL:MediaItemService');

/**
 * Remove Duplicate Items and Create If Not Exits
 */
export const removeDuplicateItemsFromDatabaseAndCreate: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
        return next();
    }
    const uniqueItems: any = [];
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    let identifyFromDatabase = 0;
    await bluebird.map(req.youTubePlaylistStore.items, async (value: any) => {
        try {
            const whereCondition: any = {
                user: userProfile,
                urlId: value.id,
                playlistId: req.youTubePlaylistStore.id,
                driveFolderId: req.playlistStore.driveFolderId
            };
            // debug('whereCondition ', whereCondition);
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            const mediaItemStore = await mediaItemModel.findOne(whereCondition);
            if (mediaItemStore && mediaItemStore.isUploaded === false) {
                uniqueItems.push(value);
            } else if (mediaItemStore && mediaItemStore.isUploaded === true) {
                identifyFromDatabase += 1;
            }
            if (_.isEmpty(mediaItemStore)) {
                // debug('Adding new mediaItem');
                uniqueItems.push(value);
                const data = {
                    user: {
                        _id: req.userStore._id,
                        email: req.userStore.email
                    },
                    title: value.title,
                    url: value.url_simple,
                    urlId: value.id,
                    playlistId: req.youTubePlaylistStore.id,
                    driveFolderId: req.playlistStore.driveFolderId,
                    isUploaded: false
                };
                // debug('data ', JSON.stringify(data));
                await mediaItemModel.insert(data);
            }
        } catch (error) {
            debug('error ', error);
        }
    }, { concurrency: 2 });
    debug('After remove duplicate from database uniqueItems ', uniqueItems.length);
    debug('duplicate identify From Database ', identifyFromDatabase);
    req.youTubePlaylistStore.items = uniqueItems;
    return next();
};

/**
 * List all the Playlist Songs
 */
export const searchByLoggedInUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.body, req.params);
    if (_.isEmpty(req.userStore)) {
        return next();
    }
    const userProfile = {
        _id: req.userStore._id,
        email: req.userStore.email
    };
    const whereCondition: any = {
        user: userProfile
    };
    if (params.isUploaded !== undefined) {
        whereCondition.isUploaded = params.isUploaded;
    }

    debug('whereCondition ', whereCondition);
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
 * List all the Playlist Songs
 */
export const searchByLoggedInUserPlaylistAndDriveFolderId: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
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
        debug('req.mediaItemsStore : Total records In database ', req.mediaItemsStore.length);
    } catch (error) {
        debug('error ', error);
        return next(error);
    }
    return next();
};

export const identifySyncItemsForYouTube: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.youTubePlaylistStore)) {
        return next();
    } else if (_.isEmpty(req.youTubePlaylistStore.items)) {
        return next();
    }
    const googleItems: any = [];
    _.each(req.googleDriveStore, (value) => {
        let youTubeId = value.name.split(YOUTUBE.ID_SEPARATOR);
        youTubeId = _.last(youTubeId);
        value.urlId = youTubeId.split('.')[0];
        googleItems.push(value);
    });

    const mediaItemsNew: any = [];
    const mediaItemsUpdate: any = [];
    const mediaItemsRemove: any = [];
    const googleDriveItemsRemove: any = [];

    /**
     * Identify the files those are not in the database but available in the YouTube
     */
    _.each(req.youTubePlaylistStore.items, (value) => {
        const item = _.find(req.mediaItemsStore, { urlId: value.id });
        if (_.isEmpty(item)) {
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
        if (_.isEmpty(item)) {
            // debug('Identify for the Remove. %o ', item);
            mediaItemsRemove.push(value);
        }

        const itemGoogleDrive = _.find(googleItems, { urlId: value.urlId });
        if (_.isEmpty(itemGoogleDrive) && value.isUploaded === true) {
            value.isUploaded = false;
            mediaItemsUpdate.push(value);
        }
        if (!_.isEmpty(itemGoogleDrive) && value.isUploaded === false) {
            value.isUploaded = true;
            mediaItemsUpdate.push(value);
        }
    });
    _.each(googleItems, (value) => {
        const item = _.find(req.youTubePlaylistStore.items, { id: value.urlId });
        const removePendingItem = _.find(mediaItemsRemove, { urlId: value.urlId });
        if (_.isEmpty(item) && _.isEmpty(removePendingItem)) {
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
    } if (_.isEmpty(req.playlistStore)) {
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
    debug('req.data.mediaItemsNew ', req.data.mediaItemsNew.length);
    const CONCURRENCY = 1;
    await bluebird.map(req.data.mediaItemsNew, async (value: any) => {
        try {
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            const data = {
                user: userProfile,
                title: value.title,
                url: value.url_simple,
                urlId: value.id,
                playlistId: req.youTubePlaylistStore.id,
                driveFolderId: req.playlistStore.driveFolderId,
                isUploaded: false
            };
            await mediaItemModel.insert(data);
        } catch (error) {
            debug('error ', error);
        }
    }, { concurrency: CONCURRENCY });

    // debug('req.data.mediaItemsUpdate ', req.data.mediaItemsUpdate.length);
    await bluebird.map(req.data.mediaItemsUpdate, async (value: any) => {
        try {
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            const data = {
                $set: {
                    isUploaded: value.isUploaded
                }
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

    // req.data.mediaItemsRemove = _.take(req.data.mediaItemsRemove, 1);

    // debug('req.data.mediaItemsRemove ', req.data.mediaItemsRemove.length);
    await bluebird.map(req.data.mediaItemsRemove, async (value: MediaItemEntity) => {
        try {
            const mediaItemModel = getMongoRepository(MediaItemEntity);
            // debug('mediaRemoveItem ', value);
            await mediaItemModel.remove(value);
        } catch (error) {
            debug('mediaItemsRemove error ', error);
            debug('mediaItemsRemove error in  ', value);
        }
    }, { concurrency: CONCURRENCY });
    await bluebird.map(req.data.mediaItemsRemove, async (value: MediaItemEntity) => {
        try {
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

    // req.data.googleDriveItemsRemove = _.take(req.data.googleDriveItemsRemove, 1);
    //  debug('req.data.googleDriveItemsRemove ', req.data.googleDriveItemsRemove.length);
    await bluebird.map(req.data.googleDriveItemsRemove, async (value: any) => {
        try {
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

export const identifySyncItemsForGoogleDrive: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.googleDriveStore)) {
        return next();
    }
    const mediaItemsUpdate: any = [];
    const googleItems: any = [];
    _.each(req.googleDriveStore, (value) => {
        let youTubeId = value.name.split(YOUTUBE.ID_SEPARATOR);
        youTubeId = _.last(youTubeId);
        value.urlId = youTubeId.split('.')[0];
        googleItems.push(value);
    });
    _.each(req.mediaItemsStore, (value) => {
        const item = _.find(googleItems, { urlId: value.urlId });
        if (_.isEmpty(item) && value.isUploaded === true) {
            value.isUploaded = false;
            mediaItemsUpdate.push(value);
        }
        if (!_.isEmpty(item) && value.isUploaded === false) {
            value.isUploaded = true;
            mediaItemsUpdate.push(value);
        }
    });
    req.data = {
        mediaItemsUpdateCount: mediaItemsUpdate.length,
        mediaItemsUpdate: mediaItemsUpdate
    };
    return next();
};
