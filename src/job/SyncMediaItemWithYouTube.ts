import * as Debug from 'debug';
import * as cron from 'cron';
import { CRONE_JOB, ENDPOINT, SYNC_TO_YOUTUBE_SCHEDULE } from '../constants';
import * as _ from 'lodash';
import * as request from 'request-promise';

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
    debug('.............. SKIP ........');
    return;
  }
  taskRunning = true;
  try {
    const options = {
      method: 'POST',
      uri: `${ENDPOINT.SYNC_TO_YOUTUBE}`,
      body: {},
      json: true
    };
    await request(options);
  } catch (error) {
    // debug('error ', error);
  }
  taskRunning = false;
};
