import * as Debug from 'debug';
import * as cron from 'cron';
import { CRONE_JOB, ENDPOINT, UPLOAD_AUDIO_SCHEDULE } from '../constants';
import * as request from 'request-promise';

const CronJob = cron.CronJob;
const debug = Debug('PL:JOB-UploadAudioToGoogleDrive');

export const init: any = () => {
  const croneTime = `${UPLOAD_AUDIO_SCHEDULE.Seconds  } ${ 
    UPLOAD_AUDIO_SCHEDULE.Minutes  } ${ 
    UPLOAD_AUDIO_SCHEDULE.Hours  } ${ 
    UPLOAD_AUDIO_SCHEDULE.DayOfMonth  } ${ 
    UPLOAD_AUDIO_SCHEDULE.Months  } ${ 
    UPLOAD_AUDIO_SCHEDULE.DayOfWeek}`;
  const job = new CronJob(croneTime, start, undefined, false, CRONE_JOB.TIMEZONE);
  debug('.............. UploadAudioToGoogleDrive Job Initiated Successfully, still you have to execute start() ........');
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
    uri: `${ENDPOINT.UPLOAD}/audio`,
    body: {},
    json: true
  };

  try {
    await request(options);
  } catch (error) {
    // debug('error ', error);
  }
  taskRunning = false;
};
