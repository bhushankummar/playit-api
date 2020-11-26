import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as _ from 'lodash';
import * as YtplUtils from '../utils/YtplUtils';
import { IYtplPlaylist } from '../interface/IYtplPlaylist';


const debug = Debug('PL:YouTubeService');
