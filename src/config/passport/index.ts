import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
import * as moment from 'moment';
import * as passportHttpBearer from 'passport-http-bearer';
import {TokenEntity} from '../../entities/TokenEntity';
import {UserEntity} from '../../entities/UserEntity';
import {getMongoRepository} from 'typeorm';
import {IRequest} from '../../interface/IRequest';

const debug = Debug('PL:Passport');
const bearerStrategy = passportHttpBearer.Strategy;

export const passport = new bearerStrategy({
    scope: '',
    realm: '',
    passReqToCallback: true
}, async (req: IRequest, token: string, callback: any) => {
    let tokenDocument: TokenEntity;
    let userDocument: UserEntity;

    try {
        const whereCondition = {
            token: token
        };
        const tokenModel = getMongoRepository(TokenEntity);
        tokenDocument = await tokenModel.findOne(whereCondition);
    } catch (error) {
        debug('Error %o ', error);
        return callback(error);
    }

    try {
        const searchCondition = {
            _id: tokenDocument.user._id
        };
        const userModel = getMongoRepository(UserEntity);
        userDocument = await userModel.findOne(searchCondition);
    } catch (error) {
        debug('Error %o ', error);
        return callback(error);
    }
    if (_.isEmpty(tokenDocument)) {
        return callback(new Boom('You are unauthorized User.'), {statusCode: 401});
    }
    const expiryTimestamp: any = moment(tokenDocument.timestamp).add(24, 'hours');
    const isAfter: boolean = moment(expiryTimestamp).isAfter(moment().format());

    if (isAfter === false) {
        return callback(new Boom('Your session has been expired.'), {statusCode: 401});
    }
    req.userStore = userDocument;
    return callback(undefined, userDocument);
});
