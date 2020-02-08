import * as Debug from 'debug';
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import {IRequest} from '../interface/IRequest';

const debug = Debug('PL:Utils');

let baseUrl: string = '';

export const encryptSync = (password: string) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const compare = (password: string, encryptedPassword: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, encryptedPassword, (error: Error, isPasswordMatch: Boolean) => {
            if (error) {
                debug('error %o', error);
                return reject(error);
            }
            return resolve(isPasswordMatch);
        });
    });
};

export const url = (req: IRequest) => {
    return req.protocol + '://' + req.get('host');
};

export const setBaseUrl = (req: IRequest) => {
    baseUrl = this.url(req);
};

export const getBaseUrl = () => {
    return baseUrl;
};

export const emailValidation = (email: string) => {
    if (_.isEmpty(email)) {
        return false;
    }
    const atpos = email.indexOf('@');
    const dotpos = email.lastIndexOf('.');
    if (atpos < 1) {
        return false;
    }
    else if (dotpos < (atpos + 2)) {
        return false;
    } else if ((dotpos + 2 >= email.length)) {
        return false;
    }
    return true;
};

export const removeAndOrFromTheString = (query: string) => {
    const regex = new RegExp('(\\s+(AND|OR)\\s*)$');
    return query.replace(regex, '');
};

export const wait = (minutes: number) => {
    return new Promise((resolve: any, reject: any) => {
        setTimeout(() => {
            resolve(true);
        }, minutes * 60000);
    });
};