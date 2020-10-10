import * as Debug from 'debug';
import * as cron from 'cron';
import { APP, CRONE_JOB, ENDPOINT, UPLOAD_VIDEO_SCHEDULE } from '../constants';
import * as _ from 'lodash';
import * as request from 'request-promise';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-UploadVideoToGoogleDrive');

export const init: any = () => {
    /*jshint  -W031 : false */
    const croneTime = UPLOAD_VIDEO_SCHEDULE.Seconds + ' ' +
        UPLOAD_VIDEO_SCHEDULE.Minutes + ' ' +
        UPLOAD_VIDEO_SCHEDULE.Hours + ' ' +
        UPLOAD_VIDEO_SCHEDULE.DayOfMonth + ' ' +
        UPLOAD_VIDEO_SCHEDULE.Months + ' ' +
        UPLOAD_VIDEO_SCHEDULE.DayOfWeek;
    const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
    debug('.............. UploadVideoToGoogleDrive Job Initiated Successfully, still you have to execute start() ........');
    return job;
};

let taskRunning = false;
const start: any = async () => {
    if (taskRunning) {
        debug('.............. SKIP ........');
        return;
    }
    // debug('.............. Start ........');
    taskRunning = true;

    const options = {
        method: 'POST',
        uri: `${ENDPOINT.UPLOAD}/video`,
        body: {},
        json: true
    };

    try {
        await request(options);
    } catch (error) {
        // debug('error ', error);
    } finally {

    }
    taskRunning = false;
};
