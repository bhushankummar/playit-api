import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as Boom from 'boom';
import * as _ from 'lodash';
import * as mongodb from 'mongodb';
import { UserEntity } from '../entities/UserEntity';
import { getMongoRepository } from 'typeorm';

const debug = Debug('PL:UserService');

/**
 * Validate user register parameter
 */
export const validateRegisterUser: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body);
    if (_.isEmpty(params.email)) {
        return next(Boom.notFound('Please enter email.'));
    }
    return next();
};

/**
 * Search user by email
 * @param: email
 */
export const searchOneByEmail: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body);
    if (_.isEmpty(params.email)) {
        return next();
    }
    try {
        const whereCondition = {
            email: params.email
        };
        const userModel = getMongoRepository(UserEntity);
        req.userStore = await userModel.findOne(whereCondition);
        // debug('req.userStore ', req.userStore);
    } catch (error) {
        return next(error);
    }
    return next();
};

/**
 * Add new user with Google Data
 */
export const registerUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body, req.query);
    if (_.isEmpty(params.state) === false) {
        return next();
    }
    try {
        const user: UserEntity = new UserEntity();
        user.email = req.googleProfileStore.emailAddresses[0].value;
        user.google = req.googleStore;
        const userModel = getMongoRepository(UserEntity);
        const document = await userModel.save(user);
        req.userStore = document;
    } catch (error) {
        debug('registerUser error: %o ', error);
        return next(error);
    }
    return next();
};

/**
 * Validate user login parameter
 */
export const validateLoginUserData: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body);
    if (_.isEmpty(params.email)) {
        return next(Boom.notFound('Please enter email.'));
    }
    return next();
};

/**
 * Validate user password
 * @param: password
 */
export const loginUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const userStore = req.userStore;
    if (_.isEmpty(userStore)) {
        return next(Boom.notFound('You does not exits'));
    }
    return next();
};

/**
 * Update Google Token
 */
export const updateGoogleToken: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body, req.query);
    if (_.isEmpty(params.state) === true) {
        return next();
    }
    // debug('Inside updateGoogleToken ', params.state);
    const stateObjectId = new mongodb.ObjectID(params.state);
    // debug('Inside updateGoogleToken stateObjectId', stateObjectId);

    try {
        const whereCondition = {
            _id: stateObjectId
        };
        const userData = {
            google: req.googleStore
        };
        const userModel = getMongoRepository(UserEntity);
        const response = await userModel.update(whereCondition, userData);
    } catch (error) {
        debug('updateGoogleToken error ', error);
        return next(error);
    }
    return next();
};

/**
 * Search user by email
 * @param: email
 */
export const searchOneByState: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body, req.query);
    if (_.isEmpty(params.state) === true) {
        return next();
    }

    const stateObjectId = new mongodb.ObjectID(params.state);
    try {
        const whereCondition: any = {
            _id: stateObjectId
        };
        const userModel = getMongoRepository(UserEntity);
        req.userStore = await userModel.findOne(whereCondition);
    } catch (error) {
        return next(error);
    }
    return next();
};

/**
 * Search user by email
 * @param: email
 */
export const searchOneByPlaylistUser: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    if (_.isEmpty(req.playlistStore)) {
        return next();
    } else if (_.isEmpty(req.playlistStore.user)) {
        return next();
    } else if (_.isEmpty(req.playlistStore.user._id)) {
        debug('CRITICAL : req.playlistStore.user._id is empty %o ', req.playlistStore);
        return next();
    }
    try {
        const whereCondition = {
            _id: req.playlistStore.user._id
        };
        const userModel = getMongoRepository(UserEntity);
        req.userStore = await userModel.findOne(whereCondition);
    } catch (error) {
        return next(error);
    }
    return next();
};
