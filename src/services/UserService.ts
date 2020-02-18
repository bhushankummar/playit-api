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
        user.email = req.googleProfileStore.emailAddresses[ 0 ].value;
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
    try {
        const whereCondition = {
            _id: params.state
        };
        const userData = {
            google: req.googleStore
        };
        const userModel = getMongoRepository(UserEntity);
        const response = await userModel.update(whereCondition, userData);
        debug('response ', response);
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

    debug('params.state ', params.state);
    const stateObjectId = new mongodb.ObjectID(params.state);
    debug('stateObjectId ', stateObjectId);
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
