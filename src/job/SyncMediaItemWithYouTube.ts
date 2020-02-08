import * as Debug from 'debug';
import * as cron from 'cron';
import {APP, CRONE_JOB, ENDPOINT, SYNC_TO_YOUTUBE_SCHEDULE} from '../constants';
import * as _ from 'lodash';
import * as request from 'request-promise';
import {getMongoRepository} from 'typeorm';
import {UserEntity} from '../entities/UserEntity';
import {PlaylistEntity} from '../entities/PlaylistEntity';
import * as bluebird from 'bluebird';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-SyncMediaItemWithYouTube');

export const init: any = () => {
    /*jshint  -W031 : false */
    const croneTime = SYNC_TO_YOUTUBE_SCHEDULE.Seconds + ' ' +
      SYNC_TO_YOUTUBE_SCHEDULE.Minutes + ' ' +
      SYNC_TO_YOUTUBE_SCHEDULE.Hours + ' ' +
      SYNC_TO_YOUTUBE_SCHEDULE.DayOfMonth + ' ' +
      SYNC_TO_YOUTUBE_SCHEDULE.Months + ' ' +
      SYNC_TO_YOUTUBE_SCHEDULE.DayOfWeek;
    const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
    debug('.............. SyncMediaItemWithYouTube Job Initiated Successfully, still you have to execute start() ........');
    return job;
};

let taskRunning = false;
const start: any = async () => {
    if (taskRunning === true) {
        // debug('.............. SKIP ........');
        return;
    }
    taskRunning = true;

    const users = APP.ALLOWED_EMAILS;
    await Promise.all(users.map(async (email: any) => {
        if (_.isEmpty(email)) {
            return;
        }
        const data = {
            email: email
        };

        try {
            const userModel = getMongoRepository(UserEntity);
            const userStore: UserEntity = await userModel.findOne(data);
            // debug('userStore ', userStore);
            const userProfile = {
                _id: userStore._id,
                email: userStore.email
            };
            const playlistModel = getMongoRepository(PlaylistEntity);
            const whereConditionAudio = {
                user: userProfile
            };
            const playlistItemStore: PlaylistEntity[] = await playlistModel.find(whereConditionAudio);
            // debug('playlistItemStore ', playlistItemStore);
            await bluebird.map(playlistItemStore, (item: PlaylistEntity) => {
                const options = {
                    method: 'POST',
                    uri: `${ENDPOINT.SYNC_TO_YOUTUBE}/${item.urlId}/${item.driveFolderId}`,
                    body: data,
                    json: true
                };
                return request(options);
            }, {concurrency: 1});
        } catch (error) {
            // debug('error ', error);
        }
    }));
    taskRunning = false;
};
