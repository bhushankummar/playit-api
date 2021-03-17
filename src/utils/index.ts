import * as Debug from 'debug';
import * as _ from 'lodash';
import { IRequest } from '../interface/IRequest';

const debug = Debug('PL:Utils');

export const url = (req: IRequest) => {
  return req.protocol + '://' + req.get('host');
};

export const wait = (minutes: number) => {
  return new Promise((resolve: any, reject: any) => {
    setTimeout(() => {
      resolve(true);
    }, minutes * 60000);
  });
};