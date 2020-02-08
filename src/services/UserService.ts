import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as Boom from 'boom';
import * as _ from 'lodash';
import * as utils from '../utils/index';
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
    const userModel = getMongoRepository(UserEntity);
    try {
        const user: UserEntity = new UserEntity();
        user.email = req.googleProfileStore.emails[ 0 ].value;
        user.google = req.googleStore;
        const document = await userModel.save(user);
        req.userStore = document;
    } catch (error) {
        debug('error: %o ', error);
        return next(error);
    }
    return next();
};

/**
 * Validate user login parameter
 */
export const validateLoginUserData: express.RequestHandler = (req: IRequest, res: express.Response, next: express.NextFunction) => {
    const params = _.merge(req.params, req.body);
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
