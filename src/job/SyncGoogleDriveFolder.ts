import * as Debug from 'debug';
import * as cron from 'cron';
import { CRONE_JOB, ENDPOINT, SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE } from '../constants';
import * as request from 'request-promise';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-SyncGoogleDriveFolder');

export const init: any = () => {
  const croneTime = `${SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE.Seconds  } ${
    SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE.Minutes  } ${
    SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE.Hours  } ${
    SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE.DayOfMonth  } ${
    SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE.Months  } ${
    SYNC_GOOGLE_DRIVE_FOLDER_SCHEDULE.DayOfWeek}`;
  const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
  debug('.............. SyncGoogleDriveFolder Job Initiated Successfully, still you have to execute start() ........');
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
      uri: `${ENDPOINT.SYNC_GOOGLE_DRIVE_FOLDER}`,
      body: {},
      json: true
    };
    await request(options);
  } catch (error) {
    // debug('error ', error);
  }
  taskRunning = false;
};
