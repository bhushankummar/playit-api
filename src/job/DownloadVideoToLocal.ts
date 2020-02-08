import * as Debug from 'debug';
import * as cron from 'cron';
import {APP, CRONE_JOB, DOWNLOAD_VIDEO_SCHEDULE, ENDPOINT, MEDIA_TYPE} from '../constants';
import * as _ from 'lodash';
import * as request from 'request-promise';
import {getMongoRepository} from 'typeorm';
import {UserEntity} from '../entities/UserEntity';
import {PlaylistEntity} from '../entities/PlaylistEntity';
import * as bluebird from 'bluebird';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-DownloadVideoToLocal');

export const init: any = () => {
    /*jshint  -W031 : false */
    const croneTime = DOWNLOAD_VIDEO_SCHEDULE.Seconds + ' ' +
      DOWNLOAD_VIDEO_SCHEDULE.Minutes + ' ' +
      DOWNLOAD_VIDEO_SCHEDULE.Hours + ' ' +
      DOWNLOAD_VIDEO_SCHEDULE.DayOfMonth + ' ' +
      DOWNLOAD_VIDEO_SCHEDULE.Months + ' ' +
      DOWNLOAD_VIDEO_SCHEDULE.DayOfWeek;
    const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
    debug('.............. DownloadVideoToLocal Job Initiated Successfully, still you have to execute start() ........');
    return job;
};

let taskRunning = false;
const start: any = async () => {
    if (taskRunning) {
        // debug('.............. SKIP ........');
        return;
    }
    taskRunning = true;
    // debug('.............. Start ........');

    const users = APP.ALLOWED_EMAILS;
    await Promise.all(users.map(async (email: string) => {
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
                user: userProfile,
                type: MEDIA_TYPE.VIDEO
            };
            const playlistItemStore: PlaylistEntity[] = await playlistModel.find(whereConditionAudio);
            // debug('playlistItemStore ', playlistItemStore);
            await bluebird.map(playlistItemStore, (item: PlaylistEntity) => {
                const options = {
                    method: 'POST',
                    uri: `${ENDPOINT.DOWNLOAD}/video/${item.urlId}/${item.driveFolderId}`,
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
