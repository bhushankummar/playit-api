import * as Debug from 'debug';
import * as cron from 'cron';
import { APP, CRONE_JOB, DOWNLOAD_AUDIO_SCHEDULE, ENDPOINT, MEDIA_TYPE } from '../constants';
import * as _ from 'lodash';
import * as request from 'request-promise';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-DownloadAudioToLocal');

export const init: any = () => {
    /*jshint  -W031 : false */
    const croneTime = DOWNLOAD_AUDIO_SCHEDULE.Seconds + ' ' +
        DOWNLOAD_AUDIO_SCHEDULE.Minutes + ' ' +
        DOWNLOAD_AUDIO_SCHEDULE.Hours + ' ' +
        DOWNLOAD_AUDIO_SCHEDULE.DayOfMonth + ' ' +
        DOWNLOAD_AUDIO_SCHEDULE.Months + ' ' +
        DOWNLOAD_AUDIO_SCHEDULE.DayOfWeek;
    const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
    debug('.............. DownloadAudioToLocal Job Initiated Successfully, still you have to execute start() ........');
    return job;
};

let taskRunning = false;
const start: any = async () => {
    if (taskRunning) {
        debug('.............. SKIP ........');
        return;
    }
    taskRunning = true;
    // debug('.............. Start ........');
    try {
        const options = {
            method: 'POST',
            uri: `${ENDPOINT.DOWNLOAD}`,
            body: {},
            json: true
        };
        await request(options);
    } catch (error) {
        // debug('error ', error);
    }
    taskRunning = false;
};
