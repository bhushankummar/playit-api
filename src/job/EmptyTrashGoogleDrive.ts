import * as Debug from 'debug';
import * as cron from 'cron';
import {APP, CRONE_JOB, EMPTY_TRASH_SCHEDULE, ENDPOINT} from '../constants';
import * as _ from 'lodash';
import * as request from 'request-promise';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-EmptyTrashGoogleDrive');

export const init: any = () => {
    /*jshint  -W031 : false */
    const croneTime = EMPTY_TRASH_SCHEDULE.Seconds + ' ' +
      EMPTY_TRASH_SCHEDULE.Minutes + ' ' +
      EMPTY_TRASH_SCHEDULE.Hours + ' ' +
      EMPTY_TRASH_SCHEDULE.DayOfMonth + ' ' +
      EMPTY_TRASH_SCHEDULE.Months + ' ' +
      EMPTY_TRASH_SCHEDULE.DayOfWeek;
    const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
    debug('.............. EmptyTrashGoogleDrive Job Initiated Successfully, still you have to execute start() ........');
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
        const options = {
            method: 'POST',
            uri: `${ENDPOINT.EMPTY_TRASH}`,
            body: data,
            json: true
        };

        try {
            await request(options);
        } catch (error) {
            // debug('error ', error);
        }
    }));
    taskRunning = false;
};
